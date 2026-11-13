package com.frauddetection.dto;

import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {
    @NotNull(message = "alertId is required")
    private Long alertId;

    @NotNull(message = "isActualFraud is required")
    private Boolean isActualFraud;

    private String notes;

    public FeedbackRequest() {}

    public FeedbackRequest(Long alertId, Boolean isActualFraud, String notes) {
        this.alertId = alertId;
        this.isActualFraud = isActualFraud;
        this.notes = notes;
    }

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
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
}
