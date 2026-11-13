package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_status", columnList = "status"),
    @Index(name = "idx_alert_user", columnList = "userId"),
    @Index(name = "idx_alert_created_at", columnList = "createdAt"),
    @Index(name = "idx_alert_org_id", columnList = "organizationId")
})
public class Alert {

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

    @Column(nullable = false)
    private Double fraudProbability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RiskLevel riskLevel;

    @Column(length = 2000)
    private String reasons;

    @Column(length = 4000)
    private String structuredReasonsJson;

    @Column(name = "event_count", nullable = false)
    private Integer count = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AlertStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastEventAt;
    private LocalDateTime updatedAt;

    public Alert() {
        this.status = AlertStatus.OPEN;
        this.count = 1;
        this.createdAt = LocalDateTime.now();
        this.lastEventAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Alert(String transactionId, String userId, Double amount, String merchantCategory,
                 String location, Double fraudProbability, RiskLevel riskLevel,
                 String reasons, String structuredReasonsJson) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.amount = amount;
        this.merchantCategory = merchantCategory;
        this.location = location;
        this.fraudProbability = fraudProbability;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.structuredReasonsJson = structuredReasonsJson;
        this.count = 1;
        this.status = AlertStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.lastEventAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public Double getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(Double fraudProbability) {
        this.fraudProbability = fraudProbability;
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

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastEventAt() {
        return lastEventAt;
    }

    public void setLastEventAt(LocalDateTime lastEventAt) {
        this.lastEventAt = lastEventAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getOrganizationId() {
        return organizationId != null ? organizationId : "default-org";
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }
}
