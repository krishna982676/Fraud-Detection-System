package com.frauddetection.dto;

import com.frauddetection.model.AlertStatus;
import jakarta.validation.constraints.NotNull;

public class AlertStatusUpdateRequest {

    @NotNull(message = "status is required")
    private AlertStatus status;

    public AlertStatusUpdateRequest() {}

    public AlertStatusUpdateRequest(AlertStatus status) {
        this.status = status;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }
}
