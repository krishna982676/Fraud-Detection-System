package com.frauddetection.controller;

import com.frauddetection.dto.AlertStatusUpdateRequest;
import com.frauddetection.dto.ApiResponse;
import com.frauddetection.dto.FeedbackRequest;
import com.frauddetection.model.Alert;
import com.frauddetection.model.AlertStatus;
import com.frauddetection.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/alerts", "/api/alerts"})
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts(@RequestParam(required = false) AlertStatus status) {
        List<Alert> alerts = alertService.getAlerts(status);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        return alertService.getAlertById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<Alert> updateAlertStatus(
            @PathVariable Long id,
            @Valid @RequestBody AlertStatusUpdateRequest request) {
        Alert updated = alertService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<String>> recordFeedback(@Valid @RequestBody FeedbackRequest request) {
        alertService.recordFeedback(request);
        return ResponseEntity.ok(ApiResponse.ok("Analyst feedback recorded successfully", "Recorded"));
    }
}
