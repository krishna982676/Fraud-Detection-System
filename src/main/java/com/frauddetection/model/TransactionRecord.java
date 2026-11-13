package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_txn_id", columnList = "transactionId"),
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_created_at", columnList = "createdAt"),
    @Index(name = "idx_txn_org_id", columnList = "organizationId")
})
public class TransactionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", length = 36)
    private String organizationId = "default-org";

    @Column(nullable = false, length = 64)
    private String transactionId;

    @Column(nullable = false, length = 64)
    private String userId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 32)
    private String merchantCategory;

    @Column(nullable = false, length = 64)
    private String location;

    @Column(nullable = false, length = 32)
    private String deviceType;

    @Column(nullable = false)
    private Integer hourOfDay;

    @Column(nullable = false)
    private Double distanceFromHome;

    @Column(nullable = false)
    private Integer txnCountLast24h;

    @Column(nullable = false)
    private Boolean isInternational;

    @Column(nullable = false)
    private Double fraudProbability;

    private Double mlScore;
    private Double ruleScore;
    private Double finalScore;

    @Column(nullable = false)
    private Boolean isFraud;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RiskLevel riskLevel;

    @Column(length = 2000)
    private String reasons;

    @Column(length = 4000)
    private String structuredReasonsJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public TransactionRecord() {
        this.createdAt = LocalDateTime.now();
    }

    public TransactionRecord(String transactionId, String userId, Double amount, String merchantCategory,
                             String location, String deviceType, Integer hourOfDay, Double distanceFromHome,
                             Integer txnCountLast24h, Boolean isInternational, Double fraudProbability,
                             Double mlScore, Double ruleScore, Double finalScore,
                             Boolean isFraud, RiskLevel riskLevel, String reasons, String structuredReasonsJson,
                             LocalDateTime createdAt) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.amount = amount;
        this.merchantCategory = merchantCategory;
        this.location = location;
        this.deviceType = deviceType;
        this.hourOfDay = hourOfDay;
        this.distanceFromHome = distanceFromHome;
        this.txnCountLast24h = txnCountLast24h;
        this.isInternational = isInternational;
        this.fraudProbability = fraudProbability;
        this.mlScore = mlScore;
        this.ruleScore = ruleScore;
        this.finalScore = finalScore;
        this.isFraud = isFraud;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.structuredReasonsJson = structuredReasonsJson;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public Integer getHourOfDay() {
        return hourOfDay;
    }

    public void setHourOfDay(Integer hourOfDay) {
        this.hourOfDay = hourOfDay;
    }

    public Double getDistanceFromHome() {
        return distanceFromHome;
    }

    public void setDistanceFromHome(Double distanceFromHome) {
        this.distanceFromHome = distanceFromHome;
    }

    public Integer getTxnCountLast24h() {
        return txnCountLast24h;
    }

    public void setTxnCountLast24h(Integer txnCountLast24h) {
        this.txnCountLast24h = txnCountLast24h;
    }

    public Boolean getIsInternational() {
        return isInternational;
    }

    public void setIsInternational(Boolean international) {
        isInternational = international;
    }

    public Double getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(Double fraudProbability) {
        this.fraudProbability = fraudProbability;
    }

    public Double getMlScore() {
        return mlScore;
    }

    public void setMlScore(Double mlScore) {
        this.mlScore = mlScore;
    }

    public Double getRuleScore() {
        return ruleScore;
    }

    public void setRuleScore(Double ruleScore) {
        this.ruleScore = ruleScore;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
    }

    public Boolean getIsFraud() {
        return isFraud;
    }

    public void setIsFraud(Boolean fraud) {
        isFraud = fraud;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getReasons() {
        return reasons;
    }

    public void setReasons(String reasons) {
        this.reasons = reasons;
    }

    public String getStructuredReasonsJson() {
        return structuredReasonsJson;
    }

    public void setStructuredReasonsJson(String structuredReasonsJson) {
        this.structuredReasonsJson = structuredReasonsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getOrganizationId() {
        return organizationId != null ? organizationId : "default-org";
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }
}
