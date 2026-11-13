package com.frauddetection.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frauddetection.dto.AnalysisResponse;
import com.frauddetection.dto.TransactionRequest;
import com.frauddetection.dto.UserProfileDto;
import com.frauddetection.model.RiskLevel;
import com.frauddetection.service.TransactionAnalysisService;
import com.frauddetection.service.UserProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import com.frauddetection.config.SecurityConfig;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
@Import(SecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionAnalysisService transactionAnalysisService;

    @MockBean
    private UserProfileService userProfileService;

    @Test
    void testAnalyzeTransactionSuccess() throws Exception {
        TransactionRequest req = new TransactionRequest(
                "TXN-TEST-1", "USER-100", 125.0, "ELECTRONICS", "NEW_YORK", "WEB", 14, 5.0, 3, false);

        AnalysisResponse resp = new AnalysisResponse(
                "TXN-TEST-1", "USER-100", 125.0, "ELECTRONICS", "NEW_YORK",
                0.08, false, RiskLevel.LOW, List.of(), false);

        when(transactionAnalysisService.analyzeTransaction(any(TransactionRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/transactions/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN-TEST-1"))
                .andExpect(jsonPath("$.isFraud").value(false))
                .andExpect(jsonPath("$.riskLevel").value("LOW"))
                .andExpect(jsonPath("$.fraudProbability").value(0.08));
    }

    @Test
    void testAnalyzeTransactionValidationFailure() throws Exception {
        TransactionRequest req = new TransactionRequest();
        req.setAmount(-50.0); // Invalid negative amount
        req.setHourOfDay(28); // Invalid hour > 23

        mockMvc.perform(post("/api/transactions/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void testBatchSizeExceedsLimitFails() throws Exception {
        List<TransactionRequest> list = new ArrayList<>();
        for (int i = 0; i < 501; i++) {
            list.add(new TransactionRequest("TXN-" + i, "USER-1", 10.0, "GROCERY", "NEW_YORK", "POS", 12, 1.0, 1,
                    false));
        }

        mockMvc.perform(post("/api/transactions/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(list)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Batch size exceeds maximum limit of 500 transactions"));
    }

    @Test
    void testGetUserProfileDetail() throws Exception {
        UserProfileDto dto = new UserProfileDto("USER-99", 55.0, 12.0, 5, List.of("NEW_YORK"), List.of("GROCERY"),
                "NEW_YORK", null);
        when(userProfileService.getProfileDto("USER-99")).thenReturn(dto);
        when(transactionAnalysisService.getUserRecentTransactions("USER-99")).thenReturn(List.of());

        mockMvc.perform(get("/api/transactions/user/USER-99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.userId").value("USER-99"))
                .andExpect(jsonPath("$.profile.avgAmount").value(55.0));
    }
}
