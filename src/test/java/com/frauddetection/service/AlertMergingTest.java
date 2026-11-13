package com.frauddetection.service;

import com.frauddetection.dto.StructuredReason;
import com.frauddetection.model.Alert;
import com.frauddetection.model.AlertStatus;
import com.frauddetection.model.RiskLevel;
import com.frauddetection.model.TransactionRecord;
import com.frauddetection.repository.AlertRepository;
import com.frauddetection.repository.AnalystFeedbackRepository;
import com.frauddetection.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AlertMergingTest {

    private AlertRepository alertRepository;
    private AnalystFeedbackRepository feedbackRepository;
    private TransactionRepository transactionRepository;
    private WebSocketNotificationService notificationService;
    private AlertService alertService;

    @BeforeEach
    void setUp() {
        alertRepository = Mockito.mock(AlertRepository.class);
        feedbackRepository = Mockito.mock(AnalystFeedbackRepository.class);
        transactionRepository = Mockito.mock(TransactionRepository.class);
        notificationService = Mockito.mock(WebSocketNotificationService.class);
        alertService = new AlertService(alertRepository, feedbackRepository, transactionRepository, notificationService);
    }

    @Test
    void testCreateNewAlertWhenNoOpenAlertExists() {
        when(alertRepository.findTopByUserIdAndStatusInAndLastEventAtAfterOrderByLastEventAtDesc(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArgument(0));

        TransactionRecord txn = new TransactionRecord(
                "TXN-101", "USER-A", 1500.0, "LUXURY", "DUBAI", "WEB", 2, 4000.0, 5, true,
                0.85, 0.85, 0.85, 0.85, true, RiskLevel.HIGH, "Luxury spend", "[]", LocalDateTime.now()
        );

        Alert alert = alertService.createOrMergeAlert(txn, 0.85, RiskLevel.HIGH, List.of(
                new StructuredReason("HIGH_AMOUNT", "HIGH", "High amount", 0.35)
        ));

        assertNotNull(alert);
        assertEquals(1, alert.getCount());
        assertEquals("USER-A", alert.getUserId());
        assertEquals(1500.0, alert.getAmount());
        assertEquals(AlertStatus.OPEN, alert.getStatus());
        verify(notificationService, times(1)).sendAlert(any(Alert.class));
    }

    @Test
    void testMergeAlertWhenOpenAlertExistsWithin5Minutes() {
        LocalDateTime now = LocalDateTime.now();
        Alert existingAlert = new Alert(
                "TXN-PREV", "USER-A", 1200.0, "LUXURY", "DUBAI", 0.82, RiskLevel.HIGH, "Initial high risk", "[]"
        );
        existingAlert.setId(55L);
        existingAlert.setCount(1);
        existingAlert.setLastEventAt(now.minusMinutes(2));

        when(alertRepository.findTopByUserIdAndStatusInAndLastEventAtAfterOrderByLastEventAtDesc(
                eq("USER-A"), any(), any()
        )).thenReturn(Optional.of(existingAlert));
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArgument(0));

        TransactionRecord secondTxn = new TransactionRecord(
                "TXN-NEW", "USER-A", 800.0, "TRANSFER", "DUBAI", "WEB", 2, 4000.0, 6, true,
                0.90, 0.90, 0.90, 0.90, true, RiskLevel.HIGH, "Transfer surge", "[]", now
        );

        Alert merged = alertService.createOrMergeAlert(secondTxn, 0.90, RiskLevel.HIGH, List.of(
                new StructuredReason("TRANSFER_SURGE", "HIGH", "Transfer surge", 0.40)
        ));

        assertNotNull(merged);
        assertEquals(55L, merged.getId());
        assertEquals(2, merged.getCount(), "Count should increment on merge");
        assertEquals(2000.0, merged.getAmount(), "Amounts should accumulate");
        assertEquals("TXN-NEW", merged.getTransactionId(), "Should update to latest transaction id");
        verify(alertRepository, times(1)).save(existingAlert);
    }

    @Test
    void testAutoEscalationOfStaleOpenAlerts() {
        LocalDateTime staleTime = LocalDateTime.now().minusMinutes(15);
        Alert staleAlert = new Alert(
                "TXN-STALE", "USER-B", 2500.0, "LUXURY", "PARIS", 0.88, RiskLevel.HIGH, "Stale", "[]"
        );
        staleAlert.setId(99L);
        staleAlert.setStatus(AlertStatus.OPEN);
        staleAlert.setCreatedAt(staleTime);

        when(alertRepository.findByStatusAndCreatedAtBefore(eq(AlertStatus.OPEN), any()))
                .thenReturn(List.of(staleAlert));
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArgument(0));

        alertService.checkAutoEscalations();

        assertEquals(AlertStatus.ESCALATED, staleAlert.getStatus(), "Stale alert should escalate to ESCALATED");
        verify(alertRepository, times(1)).save(staleAlert);
    }
}
