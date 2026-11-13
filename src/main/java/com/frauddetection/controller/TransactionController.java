package com.frauddetection.controller;

import com.frauddetection.dto.AnalysisResponse;
import com.frauddetection.dto.BatchAnalysisResponse;
import com.frauddetection.dto.TransactionRequest;
import com.frauddetection.dto.UserProfileDto;
import com.frauddetection.model.TransactionRecord;
import com.frauddetection.service.TransactionAnalysisService;
import com.frauddetection.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/transactions", "/api/transactions"})
public class TransactionController {

    private final TransactionAnalysisService transactionAnalysisService;
    private final UserProfileService userProfileService;

    public TransactionController(TransactionAnalysisService transactionAnalysisService,
                                 UserProfileService userProfileService) {
        this.transactionAnalysisService = transactionAnalysisService;
        this.userProfileService = userProfileService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyzeTransaction(@Valid @RequestBody TransactionRequest request) {
        AnalysisResponse response = transactionAnalysisService.analyzeTransaction(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<BatchAnalysisResponse> analyzeBatch(@RequestBody List<@Valid TransactionRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new IllegalArgumentException("Batch request must contain at least 1 transaction");
        }
        if (requests.size() > 500) {
            throw new IllegalArgumentException("Batch size exceeds maximum limit of 500 transactions");
        }
        BatchAnalysisResponse response = transactionAnalysisService.analyzeBatch(requests);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionRecord>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TransactionRecord> transactions = transactionAnalysisService.getTransactionHistory(PageRequest.of(page, size));
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionRecord> getTransactionById(@PathVariable String transactionId) {
        return transactionAnalysisService.getTransactionById(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDetail(@PathVariable String userId) {
        UserProfileDto profile = userProfileService.getProfileDto(userId);
        List<TransactionRecord> recentTxns = transactionAnalysisService.getUserRecentTransactions(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("profile", profile);
        result.put("recentTransactions", recentTxns);
        return ResponseEntity.ok(result);
    }
}
