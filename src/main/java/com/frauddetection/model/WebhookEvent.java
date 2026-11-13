package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_events", indexes = {
    @Index(name = "idx_webhook_processed", columnList = "processed_at")
})
public class WebhookEvent {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    public WebhookEvent() {
        this.processedAt = LocalDateTime.now();
    }

    public WebhookEvent(String id, String provider, String eventType, String payload) {
        this.id = id;
        this.provider = provider;
        this.eventType = eventType;
        this.payload = payload;
        this.processedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
