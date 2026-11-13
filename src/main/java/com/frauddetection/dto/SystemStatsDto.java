package com.frauddetection.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SystemStatsDto {

    private long totalTransactions;
    private long fraudTransactions;
    private long legitTransactions;
    private double fraudRatePercentage;
    private double deltaFraudRate = 0.0;

    private long totalAlerts;
    private long openAlerts;
    private long reviewedAlerts;
    private long dismissedAlerts;
    private long escalatedAlerts;
    private long alertsLastHour;

    private double activeThreshold = 0.70;

    private Map<String, Long> riskDistribution = new HashMap<>();
    private Map<String, Long> categoryBreakdown = new HashMap<>();
    private Map<Integer, Long> hourlyFraud = new HashMap<>();
    private List<Double> sparklineRecent = new ArrayList<>();

    public SystemStatsDto() {}

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getFraudTransactions() {
        return fraudTransactions;
    }

    public void setFraudTransactions(long fraudTransactions) {
        this.fraudTransactions = fraudTransactions;
    }

    public long getLegitTransactions() {
        return legitTransactions;
    }

    public void setLegitTransactions(long legitTransactions) {
        this.legitTransactions = legitTransactions;
    }

    public double getFraudRatePercentage() {
        return fraudRatePercentage;
    }

    public void setFraudRatePercentage(double fraudRatePercentage) {
        this.fraudRatePercentage = fraudRatePercentage;
    }

    public double getDeltaFraudRate() {
        return deltaFraudRate;
    }

    public void setDeltaFraudRate(double deltaFraudRate) {
        this.deltaFraudRate = deltaFraudRate;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public void setOpenAlerts(long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public long getReviewedAlerts() {
        return reviewedAlerts;
    }

    public void setReviewedAlerts(long reviewedAlerts) {
        this.reviewedAlerts = reviewedAlerts;
    }

    public long getDismissedAlerts() {
        return dismissedAlerts;
    }

    public void setDismissedAlerts(long dismissedAlerts) {
        this.dismissedAlerts = dismissedAlerts;
    }

    public long getEscalatedAlerts() {
        return escalatedAlerts;
    }

    public void setEscalatedAlerts(long escalatedAlerts) {
        this.escalatedAlerts = escalatedAlerts;
    }

    public long getAlertsLastHour() {
        return alertsLastHour;
    }

    public void setAlertsLastHour(long alertsLastHour) {
        this.alertsLastHour = alertsLastHour;
    }

    public double getActiveThreshold() {
        return activeThreshold;
    }

    public void setActiveThreshold(double activeThreshold) {
        this.activeThreshold = activeThreshold;
    }

    public Map<String, Long> getRiskDistribution() {
        return riskDistribution;
    }

    public void setRiskDistribution(Map<String, Long> riskDistribution) {
        this.riskDistribution = riskDistribution;
    }

    public Map<String, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<Integer, Long> getHourlyFraud() {
        return hourlyFraud;
    }

    public void setHourlyFraud(Map<Integer, Long> hourlyFraud) {
        this.hourlyFraud = hourlyFraud;
    }

    public List<Double> getSparklineRecent() {
        return sparklineRecent;
    }

    public void setSparklineRecent(List<Double> sparklineRecent) {
        this.sparklineRecent = sparklineRecent;
    }
}
