package com.frauddetection.controller;

import com.frauddetection.dto.SystemStatsDto;
import com.frauddetection.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ "/api/v1/stats", "/api/stats" })
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<SystemStatsDto> getStats() {
        SystemStatsDto stats = statsService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
