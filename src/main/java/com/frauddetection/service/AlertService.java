package com.frauddetection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frauddetection.dto.FeedbackRequest;
import com.frauddetection.dto.StructuredReason;
import com.frauddetection.exception.ResourceNotFoundException;
import com.frauddetection.model.*;
import com.frauddetection.repository.AlertRepository;
import com.frauddetection.repository.AnalystFeedbackRepository;
import com.frauddetection.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final AnalystFeedbackRepository feedbackRepository;
    private final TransactionRepository transactionRepository;
    private final WebSocketNotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AlertService(AlertRepository alertRepository,
                        AnalystFeedbackRepository feedbackRepository,
                        TransactionRepository transactionRepository,
                        WebSocketNotificationService notificationService) {
        this.alertRepository = alertRepository;
        this.feedbackRepository = feedbackRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Alert createOrMergeAlert(TransactionRecord txn, Double fraudProbability, RiskLevel riskLevel,
                                   List<StructuredReason> structuredReasons) {
        LocalDateTime now = txn.getCreatedAt() != null ? txn.getCreatedAt() : LocalDateTime.now();
        LocalDateTime windowStart = now.minusMinutes(5);

        // Check if user already has an active OPEN or ESCALATED alert in the last 5 minutes
        Optional<Alert> existingOpenAlert = alertRepository
                .findTopByUserIdAndStatusInAndLastEventAtAfterOrderByLastEventAtDesc(
                        txn.getUserId(),
                        List.of(AlertStatus.OPEN, AlertStatus.ESCALATED),
                        windowStart
                );

        String legacyReasons = buildLegacyReasonsString(structuredReasons);
        String structuredJson = serializeStructuredReasons(structuredReasons);

        if (existingOpenAlert.isPresent()) {
            Alert alert = existingOpenAlert.get();
            alert.setCount(alert.getCount() + 1);
            alert.setLastEventAt(now);
            alert.setUpdatedAt(now);
            alert.setAmount(alert.getAmount() + txn.getAmount());
            alert.setFraudProbability(Math.max(alert.getFraudProbability(), fraudProbability));
            alert.setTransactionId(txn.getTransactionId()); // point to latest transaction

            if (legacyReasons != null && !legacyReasons.isBlank()) {
                if (alert.getReasons() != null && !alert.getReasons().contains(legacyReasons)) {
                    alert.setReasons(alert.getReasons() + " | " + legacyReasons);
                }
            }
            alert.setStructuredReasonsJson(structuredJson);

            Alert saved = alertRepository.save(alert);
            log.info("MERGED ALERT: [ID={}] User={} count={} totalAmount=${}",
                    saved.getId(), saved.getUserId(), saved.getCount(), saved.getAmount());

            notificationService.sendAlert(saved);
            return saved;
        }

        // Otherwise create new Alert
        Alert alert = new Alert(
                txn.getTransactionId(),
                txn.getUserId(),
                txn.getAmount(),
                txn.getMerchantCategory(),
                txn.getLocation(),
                fraudProbability,
                riskLevel,
                legacyReasons,
                structuredJson
        );
        alert.setCreatedAt(now);
        alert.setLastEventAt(now);

        Alert saved = alertRepository.save(alert);
        log.warn("NEW ALERT: [ID={}] Txn={}, User={}, Risk={}, Prob={}",
                saved.getId(), saved.getTransactionId(), saved.getUserId(), saved.getRiskLevel(), saved.getFraudProbability());

        notificationService.sendAlert(saved);
        return saved;
    }

    @Transactional
    public List<Alert> getAlerts(AlertStatus status) {
        checkAutoEscalations();

        if (status != null) {
            return alertRepository.findByStatusOrderByLastEventAtDesc(status);
        }
        return alertRepository.findAllByOrderByLastEventAtDesc();
    }

    public java.util.Optional<Alert> getAlertById(Long id) {
        return alertRepository.findById(id);
    }

    @Transactional
    public Alert updateStatus(Long id, AlertStatus newStatus) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));

        alert.setStatus(newStatus);
        alert.setUpdatedAt(LocalDateTime.now());
        Alert updated = alertRepository.save(alert);

        // Record analyst feedback automatically on REVIEWED or DISMISSED
        boolean isActualFraud = (newStatus == AlertStatus.REVIEWED);
        saveFeedbackInternal(alert, isActualFraud, "Status transitioned by analyst to " + newStatus);

        log.info("Alert id={} updated to status: {}", id, newStatus);
        notificationService.sendAlert(updated);
        return updated;
    }

    @Transactional
    public void recordFeedback(FeedbackRequest request) {
        Alert alert = alertRepository.findById(request.getAlertId())
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + request.getAlertId()));

        AlertStatus targetStatus = Boolean.TRUE.equals(request.getIsActualFraud()) ? AlertStatus.REVIEWED : AlertStatus.DISMISSED;
        alert.setStatus(targetStatus);
        alert.setUpdatedAt(LocalDateTime.now());
        alertRepository.save(alert);

        saveFeedbackInternal(alert, request.getIsActualFraud(), request.getNotes());
    }

    private void saveFeedbackInternal(Alert alert, boolean isActualFraud, String notes) {
        try {
            // Retrieve original transaction details
            TransactionRecord txn = transactionRepository.findAll().stream()
                    .filter(t -> t.getTransactionId().equals(alert.getTransactionId()))
                    .findFirst()
                    .orElse(null);

            AnalystFeedbackRecord feedback = new AnalystFeedbackRecord(
                    alert.getId(),
                    alert.getTransactionId(),
                    alert.getUserId(),
                    alert.getAmount(),
                    alert.getMerchantCategory(),
                    alert.getLocation(),
                    txn != null ? txn.getDeviceType() : "WEB",
                    txn != null ? txn.getHourOfDay() : 12,
                    txn != null ? txn.getDistanceFromHome() : 5.0,
                    txn != null ? txn.getTxnCountLast24h() : 2,
                    txn != null ? txn.getIsInternational() : false,
                    isActualFraud,
                    notes
            );
            feedbackRepository.save(feedback);
            log.info("Analyst feedback saved for alert {} -> actualFraud={}", alert.getId(), isActualFraud);
        } catch (Exception e) {
            log.warn("Could not save analyst feedback record: {}", e.getMessage());
        }
    }

    @Transactional
    public void checkAutoEscalations() {
        LocalDateTime escalationThreshold = LocalDateTime.now().minusMinutes(10);
        List<Alert> staleOpenAlerts = alertRepository.findByStatusAndCreatedAtBefore(AlertStatus.OPEN, escalationThreshold);
        for (Alert a : staleOpenAlerts) {
            a.setStatus(AlertStatus.ESCALATED);
            a.setUpdatedAt(LocalDateTime.now());
            alertRepository.save(a);
            log.info("Auto-escalated stale alert id={} to ESCALATED", a.getId());
        }
    }

    private String buildLegacyReasonsString(List<StructuredReason> reasons) {
        if (reasons == null || reasons.isEmpty()) return "ML Model Flagged Abnormal Signature";
        List<String> messages = new ArrayList<>();
        for (StructuredReason r : reasons) {
            messages.add(r.getMessage());
        }
        return String.join(" | ", messages);
    }

    private String serializeStructuredReasons(List<StructuredReason> reasons) {
        try {
            return objectMapper.writeValueAsString(reasons != null ? reasons : List.of());
        } catch (Exception e) {
            return "[]";
        }
    }
}
