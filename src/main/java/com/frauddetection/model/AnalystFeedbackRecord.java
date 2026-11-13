package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analyst_feedback", indexes = {
    @Index(name = "idx_feedback_org_id", columnList = "organizationId")
})
public class AnalystFeedbackRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", length = 36)
    private String organizationId = "default-org";

    private Long alertId;
    private String transactionId;
    private String userId;
    private Double amount;
    private String merchantCategory;
    private String location;
    private String deviceType;
    private Integer hourOfDay;
    private Double distanceFromHome;
    private Integer txnCountLast24h;
    private Boolean isInternational;

    @Column(nullable = false)
    private Boolean isActualFraud;

    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public AnalystFeedbackRecord() {
        this.createdAt = LocalDateTime.now();
    }

    public AnalystFeedbackRecord(Long alertId, String transactionId, String userId, Double amount,
                                 String merchantCategory, String location, String deviceType,
                                 Integer hourOfDay, Double distanceFromHome, Integer txnCountLast24h,
                                 Boolean isInternational, Boolean isActualFraud, String notes) {
        this.alertId = alertId;
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
        this.isActualFraud = isActualFraud;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
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

    public Boolean getIsActualFraud() {
        return isActualFraud;
    }

    public void setIsActualFraud(Boolean actualFraud) {
        isActualFraud = actualFraud;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
