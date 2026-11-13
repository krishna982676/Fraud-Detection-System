package com.frauddetection.dto;

import com.frauddetection.model.RiskLevel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AnalysisResponse {

    private String transactionId;
    private String userId;
    private Double amount;
    private String merchantCategory;
    private String location;
    private Double fraudProbability;
    private Boolean isFraud;
    private RiskLevel riskLevel;
    private String decision = "APPROVE"; // APPROVE | REVIEW | BLOCK
    private String modelVersion = "RandomForest (v2.0)";
    private Double thresholdUsed = 0.20;
    private List<String> reasons = new ArrayList<>();
    private List<StructuredReason> structuredReasons = new ArrayList<>();
    private ScoreBreakdown scoreBreakdown;
    private List<TopFactor> topFactors = new ArrayList<>();
    private Boolean alertGenerated = false;
    private Long alertId;
    private LocalDateTime timestamp;

    public AnalysisResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public AnalysisResponse(String transactionId, String userId, Double amount, String merchantCategory,
                            String location, Double fraudProbability, Boolean isFraud,
                            RiskLevel riskLevel, List<String> reasons, Boolean alertGenerated) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.amount = amount;
        this.merchantCategory = merchantCategory;
        this.location = location;
        this.fraudProbability = fraudProbability;
        this.isFraud = isFraud;
        this.riskLevel = riskLevel;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
        this.alertGenerated = alertGenerated;
        this.timestamp = LocalDateTime.now();
        this.decision = determineDecision(riskLevel, isFraud);
    }

    private static String determineDecision(RiskLevel level, Boolean fraud) {
        if (Boolean.TRUE.equals(fraud) || level == RiskLevel.HIGH) {
            return "BLOCK";
        } else if (level == RiskLevel.MEDIUM) {
            return "REVIEW";
        }
        return "APPROVE";
    }

    public Double getFinalScore() {
        return scoreBreakdown != null ? scoreBreakdown.getFinalScore() : fraudProbability;
    }

    public Double getMlScore() {
        return scoreBreakdown != null ? scoreBreakdown.getMlScore() : fraudProbability;
    }

    public Double getRuleScore() {
        return scoreBreakdown != null ? scoreBreakdown.getRuleScore() : 0.0;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Double getThresholdUsed() {
        return thresholdUsed;
    }

    public void setThresholdUsed(Double thresholdUsed) {
        this.thresholdUsed = thresholdUsed;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getMerchantCategory() {
        return merchantCategory;
    }

    public void setMerchantCategory(String merchantCategory) {
        this.merchantCategory = merchantCategory;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(Double fraudProbability) {
        this.fraudProbability = fraudProbability;
    }

    public Boolean getIsFraud() {
        return isFraud;
    }

    public void setIsFraud(Boolean fraud) {
        isFraud = fraud;
        this.decision = determineDecision(this.riskLevel, fraud);
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
        this.decision = determineDecision(riskLevel, this.isFraud);
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<StructuredReason> getStructuredReasons() {
        return structuredReasons;
    }

    public void setStructuredReasons(List<StructuredReason> structuredReasons) {
        this.structuredReasons = structuredReasons;
    }

    public ScoreBreakdown getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown;
    }

    public List<TopFactor> getTopFactors() {
        return topFactors;
    }

    public void setTopFactors(List<TopFactor> topFactors) {
        this.topFactors = topFactors;
    }

    public Boolean getAlertGenerated() {
        return alertGenerated;
    }

    public void setAlertGenerated(Boolean alertGenerated) {
        this.alertGenerated = alertGenerated;
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
