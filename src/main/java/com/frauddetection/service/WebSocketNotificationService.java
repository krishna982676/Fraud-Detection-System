package com.frauddetection.service;

import com.frauddetection.dto.AnalysisResponse;
import com.frauddetection.model.Alert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketNotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendAlert(Alert alert) {
        try {
            log.info("Broadcasting Alert over WebSocket to /topic/alerts for txn: {}", alert.getTransactionId());
            messagingTemplate.convertAndSend("/topic/alerts", alert);
        } catch (Exception e) {
            log.error("Failed to push alert over WebSocket: {}", e.getMessage(), e);
        }
    }

    public void sendTransaction(AnalysisResponse response) {
        try {
            messagingTemplate.convertAndSend("/topic/transactions", response);
        } catch (Exception e) {
            log.error("Failed to push transaction over WebSocket: {}", e.getMessage(), e);
        }
    }
}
