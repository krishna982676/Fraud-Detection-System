package com.frauddetection.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.*;
import com.frauddetection.ml.WekaFraudClassifier;
import com.frauddetection.model.Alert;
import com.frauddetection.model.RiskLevel;
import com.frauddetection.model.TransactionRecord;
import com.frauddetection.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(TransactionAnalysisService.class);

    private final FraudProperties fraudProperties;
    private final WekaFraudClassifier classifier;
    private final RuleEngineService ruleEngineService;
    private final UserProfileService userProfileService;
    private final AlertService alertService;
    private final TransactionRepository transactionRepository;
    private final WebSocketNotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TransactionAnalysisService(FraudProperties fraudProperties,
                                      WekaFraudClassifier classifier,
                                      RuleEngineService ruleEngineService,
                                      UserProfileService userProfileService,
                                      AlertService alertService,
                                      TransactionRepository transactionRepository,
                                      WebSocketNotificationService notificationService) {
        this.fraudProperties = fraudProperties;
        this.classifier = classifier;
        this.ruleEngineService = ruleEngineService;
        this.userProfileService = userProfileService;
        this.alertService = alertService;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AnalysisResponse analyzeTransaction(TransactionRequest request) {
        if (request.getTransactionId() == null || request.getTransactionId().isBlank()) {
            request.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (request.getTimestamp() == null) {
            request.setTimestamp(LocalDateTime.now());
        }

        // 1. Evaluate Rule Layer
        RuleEngineService.RuleEvaluationResult ruleResult = ruleEngineService.evaluate(request);
        List<StructuredReason> structuredReasons = new ArrayList<>(ruleResult.getStructuredReasons());
        double ruleScore = ruleResult.getRuleRiskScore();

        // 2. Query ML Model Probability
        double mlScore = classifier.predictFraudProbability(request);

        // 3. Hybrid Scoring: 70% ML + 30% Rules
        double finalScore = (0.70 * mlScore) + (0.30 * ruleScore);
        finalScore = Math.round(finalScore * 1000.0) / 1000.0;

        double threshold = fraudProperties.getThreshold();
        double mediumThreshold = fraudProperties.getMediumThreshold();

        // 4. Determine Risk Level & Fraud Classification
        RiskLevel riskLevel;
        boolean isFraud;

        if (finalScore >= threshold) {
            riskLevel = RiskLevel.HIGH;
            isFraud = true;
            if (structuredReasons.isEmpty()) {
                structuredReasons.add(new StructuredReason(
                        "ML_ANOMALY",
                        "HIGH",
                        String.format("Weka RandomForest ensemble detected fraudulent signature (ML score: %.2f)", mlScore),
                        0.40
                ));
            }
        } else if (finalScore >= mediumThreshold) {
            riskLevel = RiskLevel.MEDIUM;
            isFraud = false;
            if (structuredReasons.isEmpty()) {
                structuredReasons.add(new StructuredReason(
                        "ML_VARIANCE",
                        "MED",
                        String.format("Elevated behavioral variance detected by ML model (ML score: %.2f)", mlScore),
                        0.20
                ));
            }
        } else {
            riskLevel = RiskLevel.LOW;
            isFraud = false;
        }

        // Legacy string reasons for backward compatibility
        List<String> legacyReasons = new ArrayList<>();
        for (StructuredReason sr : structuredReasons) {
            legacyReasons.add(sr.getMessage());
        }
        String legacyReasonsString = !legacyReasons.isEmpty() ? String.join(" | ", legacyReasons) : null;
        String structuredReasonsJson = serializeReasons(structuredReasons);

        // 5. Save Transaction Record
        TransactionRecord record = new TransactionRecord(
                request.getTransactionId(),
                request.getUserId(),
                request.getAmount(),
                request.getMerchantCategory(),
                request.getLocation(),
                request.getDeviceType(),
                request.getHourOfDay(),
                request.getDistanceFromHome(),
                request.getTxnCountLast24h(),
                request.getIsInternational(),
                finalScore,
                mlScore,
                ruleScore,
                finalScore,
                isFraud,
                riskLevel,
                legacyReasonsString,
                structuredReasonsJson,
                request.getTimestamp()
        );
        TransactionRecord savedRecord = transactionRepository.save(record);

        // 6. Update user behavior profile cache
        userProfileService.recordTransaction(
                request.getUserId(),
                request.getAmount(),
                request.getLocation(),
                request.getMerchantCategory(),
                request.getDeviceType(),
                request.getHourOfDay(),
                request.getTimestamp()
        );

        // 7. Alert Deduplication / Creation if High Risk or Fraud
        boolean alertGenerated = false;
        Long alertId = null;
        if (isFraud || riskLevel == RiskLevel.HIGH) {
            Alert alert = alertService.createOrMergeAlert(savedRecord, finalScore, riskLevel, structuredReasons);
            alertGenerated = true;
            alertId = alert.getId();
        }

        // 8. Explainability Top Factors
        List<TopFactor> topFactors = classifier.explainPrediction(request, mlScore);

        ScoreBreakdown breakdown = new ScoreBreakdown(
                round3(mlScore),
                round3(ruleScore),
                round3(finalScore),
                riskLevel
        );

        AnalysisResponse response = new AnalysisResponse();
        response.setTransactionId(savedRecord.getTransactionId());
        response.setUserId(savedRecord.getUserId());
        response.setAmount(savedRecord.getAmount());
        response.setMerchantCategory(savedRecord.getMerchantCategory());
        response.setLocation(savedRecord.getLocation());
        response.setFraudProbability(finalScore);
        response.setIsFraud(isFraud);
        response.setRiskLevel(riskLevel);
        response.setReasons(legacyReasons);
        response.setStructuredReasons(structuredReasons);
        response.setScoreBreakdown(breakdown);
        response.setTopFactors(topFactors);
        response.setAlertGenerated(alertGenerated);
        response.setAlertId(alertId);
        response.setTimestamp(savedRecord.getCreatedAt());
        response.setThresholdUsed(threshold);
        if (classifier.getLatestMetrics() != null && classifier.getLatestMetrics().getAlgorithm() != null) {
            response.setModelVersion(classifier.getLatestMetrics().getAlgorithm());
        }

        // Broadcast to WebSocket subscribers exactly once
        notificationService.sendTransaction(response);

        log.info("Analyzed txn {}: user={}, amt=${}, ML={}, Rule={}, Final={}, Risk={}, Alert={}",
                response.getTransactionId(), response.getUserId(), response.getAmount(),
                String.format("%.3f", mlScore), String.format("%.3f", ruleScore), String.format("%.3f", finalScore),
                riskLevel, alertGenerated);

        return response;
    }

    public BatchAnalysisResponse analyzeBatch(List<TransactionRequest> requests) {
        if (requests.size() > 500) {
            throw new IllegalArgumentException("Batch size exceeds maximum limit of 500 transactions");
        }
        log.info("Processing batch of {} transactions", requests.size());
        List<AnalysisResponse> results = new ArrayList<>();
        int fraudCount = 0;
        int alertCount = 0;

        for (TransactionRequest req : requests) {
            AnalysisResponse res = analyzeTransaction(req);
            results.add(res);
            if (Boolean.TRUE.equals(res.getIsFraud())) {
                fraudCount++;
            }
            if (Boolean.TRUE.equals(res.getAlertGenerated())) {
                alertCount++;
            }
        }

        return new BatchAnalysisResponse(requests.size(), fraudCount, alertCount, results);
    }

    public Page<TransactionRecord> getTransactionHistory(Pageable pageable) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public List<TransactionRecord> getUserRecentTransactions(String userId) {
        return transactionRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }

    public java.util.Optional<TransactionRecord> getTransactionById(String transactionId) {
        return transactionRepository.findByTransactionId(transactionId);
    }

    private double round3(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }

    private String serializeReasons(List<StructuredReason> reasons) {
        try {
            return objectMapper.writeValueAsString(reasons != null ? reasons : List.of());
        } catch (Exception e) {
            return "[]";
        }
    }
}
