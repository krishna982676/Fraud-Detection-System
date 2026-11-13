package com.frauddetection.dto;

public class StructuredReason {
    private String code;
    private String severity; // LOW, MED, HIGH
    private String message;
    private double weight;

    public StructuredReason() {}

    public StructuredReason(String code, String severity, String message, double weight) {
        this.code = code;
        this.severity = severity;
        this.message = message;
        this.weight = weight;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }
}
