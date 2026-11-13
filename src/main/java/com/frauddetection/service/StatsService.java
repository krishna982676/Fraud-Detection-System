package com.frauddetection.service;

import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.SystemStatsDto;
import com.frauddetection.model.AlertStatus;
import com.frauddetection.model.RiskLevel;
import com.frauddetection.model.TransactionRecord;
import com.frauddetection.repository.AlertRepository;
import com.frauddetection.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class StatsService {

    private final TransactionRepository transactionRepository;
    private final AlertRepository alertRepository;
    private final FraudProperties fraudProperties;

    // In-memory sliding bucket of transaction counts for sparklines (12 buckets of
    // 5s each = 60s)
    private final LinkedList<Long> sparklineBuckets = new LinkedList<>();

    public StatsService(TransactionRepository transactionRepository,
            AlertRepository alertRepository,
            FraudProperties fraudProperties) {
        this.transactionRepository = transactionRepository;
        this.alertRepository = alertRepository;
        this.fraudProperties = fraudProperties;

        // Initialize 12 empty buckets
        for (int i = 0; i < 12; i++) {
            sparklineBuckets.add(0L);
        }
    }

    public synchronized SystemStatsDto getSystemStats() {
        long totalTxns = transactionRepository.count();
        long fraudTxns = transactionRepository.countByIsFraudTrue();
        long legitTxns = Math.max(0, totalTxns - fraudTxns);

        double fraudRate = totalTxns > 0
                ? Math.round(((double) fraudTxns / totalTxns * 100.0) * 100.0) / 100.0
                : 0.0;

        long totalAlerts = alertRepository.count();
        long openAlerts = alertRepository.countByStatus(AlertStatus.OPEN);
        long reviewedAlerts = alertRepository.countByStatus(AlertStatus.REVIEWED);
        long dismissedAlerts = alertRepository.countByStatus(AlertStatus.DISMISSED);
        long escalatedAlerts = alertRepository.countByStatus(AlertStatus.ESCALATED);

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long alertsLastHour = alertRepository.countAlertsSince(oneHourAgo);

        Map<String, Long> riskDistribution = new HashMap<>();
        riskDistribution.put("LOW", transactionRepository.countByRiskLevel(RiskLevel.LOW));
        riskDistribution.put("MEDIUM", transactionRepository.countByRiskLevel(RiskLevel.MEDIUM));
        riskDistribution.put("HIGH", transactionRepository.countByRiskLevel(RiskLevel.HIGH));

        // Category breakdown of fraud
        Map<String, Long> categoryBreakdown = new HashMap<>();
        for (Object[] row : transactionRepository.countFraudByCategory()) {
            categoryBreakdown.put(String.valueOf(row[0]), (Long) row[1]);
        }

        // Hourly fraud
        Map<Integer, Long> hourlyFraud = new HashMap<>();
        for (Object[] row : transactionRepository.countFraudByHour()) {
            hourlyFraud.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

        // Sparkline calculation from recent transactions
        List<Double> sparkline = computeRecentSparkline();

        // Delta indicator: Compare transactions in last 1 min vs previous 1 min
        LocalDateTime now = LocalDateTime.now();
        List<TransactionRecord> recent2Min = transactionRepository
                .findByCreatedAtAfterOrderByCreatedAtDesc(now.minusMinutes(2));
        long countLastMin = 0;
        long countPrevMin = 0;
        for (TransactionRecord t : recent2Min) {
            long secAgo = ChronoUnit.SECONDS.between(t.getCreatedAt(), now);
            if (secAgo <= 60) {
                countLastMin++;
            } else if (secAgo <= 120) {
                countPrevMin++;
            }
        }
        double deltaRate = countPrevMin > 0
                ? Math.round(((double) (countLastMin - countPrevMin) / countPrevMin * 100.0) * 10.0) / 10.0
                : (countLastMin > 0 ? 100.0 : 0.0);

        SystemStatsDto stats = new SystemStatsDto();
        stats.setTotalTransactions(totalTxns);
        stats.setFraudTransactions(fraudTxns);
        stats.setLegitTransactions(legitTxns);
        stats.setFraudRatePercentage(fraudRate);
        stats.setDeltaFraudRate(deltaRate);

        stats.setTotalAlerts(totalAlerts);
        stats.setOpenAlerts(openAlerts);
        stats.setReviewedAlerts(reviewedAlerts);
        stats.setDismissedAlerts(dismissedAlerts);
        stats.setEscalatedAlerts(escalatedAlerts);
        stats.setAlertsLastHour(alertsLastHour);

        stats.setActiveThreshold(fraudProperties.getThreshold());
        stats.setRiskDistribution(riskDistribution);
        stats.setCategoryBreakdown(categoryBreakdown);
        stats.setHourlyFraud(hourlyFraud);
        stats.setSparklineRecent(sparkline);

        return stats;
    }

    private List<Double> computeRecentSparkline() {
        LocalDateTime now = LocalDateTime.now();
        List<TransactionRecord> last60s = transactionRepository
                .findByCreatedAtAfterOrderByCreatedAtDesc(now.minusSeconds(60));
        double[] buckets = new double[12]; // 12 buckets of 5s each

        for (TransactionRecord t : last60s) {
            long secondsAgo = ChronoUnit.SECONDS.between(t.getCreatedAt(), now);
            int bucketIdx = 11 - (int) Math.min(11, Math.max(0, secondsAgo / 5));
            buckets[bucketIdx]++;
        }

        List<Double> result = new ArrayList<>();
        for (double b : buckets) {
            result.add(b);
        }
        return result;
    }
}
