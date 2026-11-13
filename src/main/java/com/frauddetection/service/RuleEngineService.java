package com.frauddetection.service;

import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.StructuredReason;
import com.frauddetection.dto.TransactionRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RuleEngineService {

    private final FraudProperties fraudProperties;
    private final UserProfileService userProfileService;

    public RuleEngineService(FraudProperties fraudProperties, UserProfileService userProfileService) {
        this.fraudProperties = fraudProperties;
        this.userProfileService = userProfileService;
    }

    public static class RuleEvaluationResult {
        private final List<StructuredReason> structuredReasons;
        private final double ruleRiskScore; // between 0.0 and 1.0

        public RuleEvaluationResult(List<StructuredReason> structuredReasons, double ruleRiskScore) {
            this.structuredReasons = structuredReasons;
            this.ruleRiskScore = ruleRiskScore;
        }

        public List<StructuredReason> getStructuredReasons() {
            return structuredReasons;
        }

        public List<String> getLegacyReasons() {
            List<String> list = new ArrayList<>();
            for (StructuredReason r : structuredReasons) {
                list.add(r.getMessage());
            }
            return list;
        }

        public double getRuleRiskScore() {
            return ruleRiskScore;
        }

        public boolean hasViolations() {
            return !structuredReasons.isEmpty();
        }
    }

    public RuleEvaluationResult evaluate(TransactionRequest request) {
        List<StructuredReason> reasons = new ArrayList<>();
        double totalWeight = 0.0;
        UserProfileService.InternalUserProfile profile = userProfileService.getOrCreateProfile(request.getUserId());
        LocalDateTime now = request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now();

        // 1. Per-User Statistical Amount Anomaly (amount > mean + 3*std)
        if (profile.getCount() >= 2) {
            double mean = profile.getMeanAmount();
            double std = profile.getStdDevAmount();
            double thresholdZ3 = mean + (3.0 * std);

            if (request.getAmount() > thresholdZ3 && request.getAmount() > 250.0) {
                double zScore = (request.getAmount() - mean) / Math.max(0.01, std);
                String severity = zScore > 5.0 ? "HIGH" : "MED";
                double weight = zScore > 5.0 ? 0.35 : 0.22;
                reasons.add(new StructuredReason(
                        "AMOUNT_STATISTICAL_SPIKE",
                        severity,
                        String.format("Amount ($%.2f) exceeds user baseline (mean $%.2f + 3σ, z=%.1f)",
                                request.getAmount(), mean, zScore),
                        weight
                ));
                totalWeight += weight;
            }
        } else if (request.getAmount() >= 2800.0) {
            // New user high amount fallback
            reasons.add(new StructuredReason(
                    "HIGH_INITIAL_AMOUNT",
                    "MED",
                    String.format("Unusually elevated transaction amount ($%.2f) on unseasoned profile", request.getAmount()),
                    0.20
            ));
            totalWeight += 0.20;
        }

        // 2. Impossible Travel (Speed > 900 km/h from previous transaction)
        if (profile.getLastLocation() != null && profile.getLastTxnTime() != null) {
            double speedKmH = UserProfileService.calculateImpliedSpeedKmH(
                    profile.getLastLocation(), profile.getLastTxnTime(),
                    request.getLocation(), now
            );
            double distKm = UserProfileService.calculateHaversineDistanceKm(profile.getLastLocation(), request.getLocation());

            if (speedKmH > 900.0 && distKm > 150.0) {
                reasons.add(new StructuredReason(
                        "IMPOSSIBLE_TRAVEL",
                        "HIGH",
                        String.format("Impossible travel speed: %.0f km/h between %s and %s (%.0f km)",
                                speedKmH, profile.getLastLocation(), request.getLocation(), distKm),
                        0.40
                ));
                totalWeight += 0.40;
            }
        }

        // Domestic location jump / high distance from home
        if (request.getDistanceFromHome() >= fraudProperties.getRules().getImpossibleTravelKm()) {
            reasons.add(new StructuredReason(
                    "EXTREME_DISTANCE_FROM_HOME",
                    "MED",
                    String.format("Distance from home location is %.1f km", request.getDistanceFromHome()),
                    0.20
            ));
            totalWeight += 0.20;
        }

        // 3. Velocity Surge in short window (more than 3 txns in 10 minutes)
        int velocity10m = profile.getVelocityLast10Minutes(now) + 1; // including current
        if (velocity10m >= 4) {
            String sev = velocity10m >= 7 ? "HIGH" : "MED";
            double w = velocity10m >= 7 ? 0.35 : 0.25;
            reasons.add(new StructuredReason(
                    "VELOCITY_BURST",
                    sev,
                    String.format("High transaction velocity: %d transactions within a 10-minute window", velocity10m),
                    w
            ));
            totalWeight += w;
        } else if (request.getTxnCountLast24h() >= fraudProperties.getRules().getHighVelocity24h()) {
            reasons.add(new StructuredReason(
                    "VELOCITY_24H",
                    "MED",
                    String.format("24-hour volume surge: %d transactions in last 24h", request.getTxnCountLast24h()),
                    0.20
            ));
            totalWeight += 0.20;
        }

        // 4. Unusual Location for user
        if (profile.getCount() >= 4 && !profile.isUsualCity(request.getLocation())) {
            reasons.add(new StructuredReason(
                    "UNUSUAL_LOCATION",
                    "LOW",
                    String.format("First observed activity in city '%s' for this account", request.getLocation()),
                    0.15
            ));
            totalWeight += 0.15;
        }

        // 5. Unusual Device for user
        if (profile.getCount() >= 4 && !profile.isKnownDevice(request.getDeviceType())) {
            reasons.add(new StructuredReason(
                    "NEW_DEVICE_TYPE",
                    "LOW",
                    String.format("Unrecognized device type '%s' detected", request.getDeviceType()),
                    0.12
            ));
            totalWeight += 0.12;
        }

        // 6. Nocturnal International Transaction Rule
        if (Boolean.TRUE.equals(request.getIsInternational())) {
            int hour = request.getHourOfDay();
            if (hour >= fraudProperties.getRules().getNightHourStart() && hour <= fraudProperties.getRules().getNightHourEnd()) {
                reasons.add(new StructuredReason(
                        "NOCTURNAL_INTERNATIONAL",
                        "MED",
                        String.format("Nocturnal international transaction attempted at %02d:00 hours", hour),
                        0.22
                ));
                totalWeight += 0.22;
            }
        }

        // 7. High-Risk Merchant Category & Large Volume
        String cat = request.getMerchantCategory() != null ? request.getMerchantCategory().toUpperCase() : "";
        if (("TRANSFER".equals(cat) || "LUXURY".equals(cat)) && request.getAmount() >= 2200.0) {
            reasons.add(new StructuredReason(
                    "HIGH_RISK_CATEGORY_VOLUME",
                    "MED",
                    String.format("High-risk merchant category '%s' with elevated volume ($%.2f)", cat, request.getAmount()),
                    0.18
            ));
            totalWeight += 0.18;
        }

        // Cap rule score at 1.0
        double normalizedRuleScore = Math.min(1.0, totalWeight);
        return new RuleEvaluationResult(reasons, Math.round(normalizedRuleScore * 1000.0) / 1000.0);
    }
}
