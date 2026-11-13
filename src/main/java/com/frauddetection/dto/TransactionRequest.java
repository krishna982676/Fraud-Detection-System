package com.frauddetection.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class TransactionRequest {

    private String transactionId;

    @NotBlank(message = "userId is required")
    private String userId;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "amount must be greater than zero")
    private Double amount;

    @NotBlank(message = "merchantCategory is required")
    private String merchantCategory;

    @NotBlank(message = "location is required")
    private String location;

    @NotBlank(message = "deviceType is required")
    private String deviceType;

    @NotNull(message = "hourOfDay is required")
    @Min(value = 0, message = "hourOfDay must be between 0 and 23")
    @Max(value = 23, message = "hourOfDay must be between 0 and 23")
    private Integer hourOfDay;

    @NotNull(message = "distanceFromHome is required")
    @DecimalMin(value = "0.0", message = "distanceFromHome cannot be negative")
    private Double distanceFromHome;

    @NotNull(message = "txnCountLast24h is required")
    @Min(value = 0, message = "txnCountLast24h cannot be negative")
    private Integer txnCountLast24h;

    @NotNull(message = "isInternational is required")
    private Boolean isInternational;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime timestamp;

    // Additional fields for Schema B and Schema A replay
    private Double previousFraudulentTransactions = 0.0;
    private Double accountAge = 60.0;
    private String paymentMethod = "Credit Card";
    private Map<String, Double> pcaFeatures = new HashMap<>();

    public TransactionRequest() {
        this.timestamp = LocalDateTime.now();
    }

    // Setters / getters for schema aliases
    public void setTransactionAmount(Double amount) { this.amount = amount; }
    public Double getTransactionAmount() { return this.amount; }

    public void setTransactionType(String type) { this.merchantCategory = type; }
    public String getTransactionType() { return this.merchantCategory; }

    public void setDeviceUsed(String device) { this.deviceType = device; }
    public String getDeviceUsed() { return this.deviceType; }

    public void setTimeOfTransaction(Double time) {
        if (time != null) this.hourOfDay = Math.max(0, Math.min(23, time.intValue()));
    }
    public Double getTimeOfTransaction() { return this.hourOfDay != null ? this.hourOfDay.doubleValue() : null; }

    public void setNumberOfTransactionsLast24H(Integer txns) { this.txnCountLast24h = txns; }
    public Integer getNumberOfTransactionsLast24H() { return this.txnCountLast24h; }

    public Double getPreviousFraudulentTransactions() { return previousFraudulentTransactions; }
    public void setPreviousFraudulentTransactions(Double p) { this.previousFraudulentTransactions = p; }

    public Double getAccountAge() { return accountAge; }
    public void setAccountAge(Double accountAge) { this.accountAge = accountAge; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Map<String, Double> getPcaFeatures() { return pcaFeatures; }
    public void setPcaFeatures(Map<String, Double> pcaFeatures) { this.pcaFeatures = pcaFeatures; }

    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void handleDynamicProperty(String name, Object value) {
        if (name != null && name.toUpperCase().matches("^V\\d+$") && value != null) {
            try {
                pcaFeatures.put(name.toUpperCase(), Double.parseDouble(value.toString()));
            } catch (Exception ignored) {}
        }
    }

    public TransactionRequest(String transactionId, String userId, Double amount, String merchantCategory,
                              String location, String deviceType, Integer hourOfDay, Double distanceFromHome,
                              Integer txnCountLast24h, Boolean isInternational) {
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
        this.timestamp = LocalDateTime.now();
    }

    public TransactionRequest(String transactionId, String userId, Double amount, String merchantCategory,
                              String location, String deviceType, Integer hourOfDay, Double distanceFromHome,
                              Integer txnCountLast24h, Boolean isInternational, LocalDateTime timestamp) {
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
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
