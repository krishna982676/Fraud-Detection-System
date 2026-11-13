package com.frauddetection.dto;

public class TopFactor {
    private String feature;
    private double importance;
    private String impact; // INCREASES_RISK, DECREASES_RISK
    private String value;

    public TopFactor() {}

    public TopFactor(String feature, double importance, String impact, String value) {
        this.feature = feature;
        this.importance = importance;
        this.impact = impact;
        this.value = value;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public double getImportance() {
        return importance;
    }

    public void setImportance(double importance) {
        this.importance = importance;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
