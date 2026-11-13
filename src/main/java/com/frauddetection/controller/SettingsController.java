package com.frauddetection.controller;

import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/settings", "/api/settings"})
public class SettingsController {

    private final FraudProperties fraudProperties;

    // In-memory operational policies
    private int dedupWindowMinutes = 5;
    private int escalationLimitMinutes = 10;
    private boolean highContrastMode = false;
    private boolean audioAlertsEnabled = false;

    public SettingsController(FraudProperties fraudProperties) {
        this.fraudProperties = fraudProperties;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> map = new HashMap<>();
        map.put("highThreshold", fraudProperties.getThreshold());
        map.put("medThreshold", fraudProperties.getMediumThreshold());
        map.put("dedupWindowMinutes", dedupWindowMinutes);
        map.put("escalationLimitMinutes", escalationLimitMinutes);
        map.put("highContrastMode", highContrastMode);
        map.put("audioAlertsEnabled", audioAlertsEnabled);
        return ResponseEntity.ok(map);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(@RequestBody Map<String, Object> body) {
        if (body.containsKey("highThreshold")) {
            double ht = Double.parseDouble(body.get("highThreshold").toString());
            fraudProperties.setThreshold(Math.max(0.01, Math.min(0.99, ht)));
        }
        if (body.containsKey("medThreshold")) {
            double mt = Double.parseDouble(body.get("medThreshold").toString());
            fraudProperties.setMediumThreshold(Math.max(0.01, Math.min(0.99, mt)));
        }
        if (body.containsKey("dedupWindowMinutes")) {
            this.dedupWindowMinutes = Integer.parseInt(body.get("dedupWindowMinutes").toString());
        }
        if (body.containsKey("escalationLimitMinutes")) {
            this.escalationLimitMinutes = Integer.parseInt(body.get("escalationLimitMinutes").toString());
        }
        if (body.containsKey("highContrastMode")) {
            this.highContrastMode = Boolean.parseBoolean(body.get("highContrastMode").toString());
        }
        if (body.containsKey("audioAlertsEnabled")) {
            this.audioAlertsEnabled = Boolean.parseBoolean(body.get("audioAlertsEnabled").toString());
        }

        Map<String, Object> current = new HashMap<>();
        current.put("highThreshold", fraudProperties.getThreshold());
        current.put("medThreshold", fraudProperties.getMediumThreshold());
        current.put("dedupWindowMinutes", dedupWindowMinutes);
        current.put("escalationLimitMinutes", escalationLimitMinutes);
        current.put("highContrastMode", highContrastMode);
        current.put("audioAlertsEnabled", audioAlertsEnabled);

        return ResponseEntity.ok(ApiResponse.ok("Operational settings and scoring policies updated successfully", current));
    }
}

