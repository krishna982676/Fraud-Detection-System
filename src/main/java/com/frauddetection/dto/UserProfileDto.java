package com.frauddetection.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserProfileDto {
    private String userId;
    private double avgAmount;
    private double stdDevAmount;
    private long txnCount;
    private List<String> usualCities;
    private List<String> usualCategories;
    private String lastLocation;
    private LocalDateTime lastTxnTime;

    public UserProfileDto() {}

    public UserProfileDto(String userId, double avgAmount, double stdDevAmount, long txnCount,
                          List<String> usualCities, List<String> usualCategories,
                          String lastLocation, LocalDateTime lastTxnTime) {
        this.userId = userId;
        this.avgAmount = avgAmount;
        this.stdDevAmount = stdDevAmount;
        this.txnCount = txnCount;
        this.usualCities = usualCities;
        this.usualCategories = usualCategories;
        this.lastLocation = lastLocation;
        this.lastTxnTime = lastTxnTime;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getAvgAmount() {
        return avgAmount;
    }

    public void setAvgAmount(double avgAmount) {
        this.avgAmount = avgAmount;
    }

    public double getStdDevAmount() {
        return stdDevAmount;
    }

    public void setStdDevAmount(double stdDevAmount) {
        this.stdDevAmount = stdDevAmount;
    }

    public long getTxnCount() {
        return txnCount;
    }

    public void setTxnCount(long txnCount) {
        this.txnCount = txnCount;
    }

    public List<String> getUsualCities() {
        return usualCities;
    }

    public void setUsualCities(List<String> usualCities) {
        this.usualCities = usualCities;
    }

    public List<String> getUsualCategories() {
        return usualCategories;
    }

    public void setUsualCategories(List<String> usualCategories) {
        this.usualCategories = usualCategories;
    }

    public String getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(String lastLocation) {
        this.lastLocation = lastLocation;
    }

    public LocalDateTime getLastTxnTime() {
        return lastTxnTime;
    }

    public void setLastTxnTime(LocalDateTime lastTxnTime) {
        this.lastTxnTime = lastTxnTime;
    }
}
