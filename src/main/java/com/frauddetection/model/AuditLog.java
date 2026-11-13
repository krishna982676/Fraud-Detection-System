package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log", indexes = {
    @Index(name = "idx_audit_org_id", columnList = "organization_id"),
    @Index(name = "idx_audit_org_created", columnList = "organization_id, created_at")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
        this.createdAt = LocalDateTime.now();
    }

    public AuditLog(String organizationId, String userId, String action, String resourceType, String resourceId, String ipAddress, String details) {
        this.organizationId = organizationId;
        this.userId = userId;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.ipAddress = ipAddress;
        this.details = details;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
