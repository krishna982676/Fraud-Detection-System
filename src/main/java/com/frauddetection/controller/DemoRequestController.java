package com.frauddetection.controller;

import com.frauddetection.dto.ApiResponse;
import com.frauddetection.model.DemoRequest;
import com.frauddetection.repository.DemoRequestRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping({"/api/v1/demo-requests", "/api/demo-requests"})
public class DemoRequestController {

    private final DemoRequestRepository repository;

    public DemoRequestController(DemoRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DemoRequest>> createDemoRequest(@Valid @RequestBody DemoRequest request) {
        Instant oneHourAgo = Instant.now().minus(1, ChronoUnit.HOURS);
        long recentCount = repository.countByBusinessEmailAndCreatedAtAfter(request.getBusinessEmail(), oneHourAgo);
        if (recentCount >= 5) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error("Rate limit exceeded for this email. Please try again later."));
        }

        request.setCreatedAt(Instant.now());
        DemoRequest saved = repository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Demo request submitted successfully. Our team will contact you.", saved));
    }
}
