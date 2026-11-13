package com.frauddetection.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frauddetection.dto.AlertStatusUpdateRequest;
import com.frauddetection.dto.FeedbackRequest;
import com.frauddetection.model.Alert;
import com.frauddetection.model.AlertStatus;
import com.frauddetection.model.RiskLevel;
import com.frauddetection.service.AlertService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import com.frauddetection.config.SecurityConfig;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlertController.class)
@Import(SecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlertService alertService;

    @Test
    void testGetAlerts() throws Exception {
        Alert alert = new Alert(
                "TXN-ALERT-1", "USER-55", 3800.0, "LUXURY", "DUBAI",
                0.91, RiskLevel.HIGH, "Impossible travel | High Amount", "[]"
        );
        alert.setId(1L);

        when(alertService.getAlerts(AlertStatus.OPEN)).thenReturn(List.of(alert));

        mockMvc.perform(get("/api/alerts?status=OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].transactionId").value("TXN-ALERT-1"))
                .andExpect(jsonPath("$[0].riskLevel").value("HIGH"))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    void testUpdateAlertStatus() throws Exception {
        Alert updated = new Alert(
                "TXN-ALERT-1", "USER-55", 3800.0, "LUXURY", "DUBAI",
                0.91, RiskLevel.HIGH, "Impossible travel", "[]"
        );
        updated.setId(1L);
        updated.setStatus(AlertStatus.REVIEWED);

        AlertStatusUpdateRequest req = new AlertStatusUpdateRequest(AlertStatus.REVIEWED);

        when(alertService.updateStatus(eq(1L), eq(AlertStatus.REVIEWED))).thenReturn(updated);

        mockMvc.perform(patch("/api/alerts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("REVIEWED"));
    }

    @Test
    void testRecordFeedbackSuccess() throws Exception {
        FeedbackRequest req = new FeedbackRequest(1L, true, "Confirmed card theft");
        doNothing().when(alertService).recordFeedback(any(FeedbackRequest.class));

        mockMvc.perform(post("/api/alerts/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private FeedbackRequest any(Class<FeedbackRequest> type) {
        return org.mockito.ArgumentMatchers.any(type);
    }
}
