package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_api_keys_org_id", columnList = "organization_id"),
    @Index(name = "idx_api_keys_hash", columnList = "key_hash")
})
public class ApiKey {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "key_prefix", nullable = false, length = 16)
    private String keyPrefix;

    @Column(name = "key_hash", nullable = false, unique = true, length = 128)
    private String keyHash;

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ApiKey() {
        this.createdAt = LocalDateTime.now();
        this.isRevoked = false;
    }

    public ApiKey(String id, String organizationId, String userId, String name, String keyPrefix, String keyHash) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.name = name;
        this.keyPrefix = keyPrefix;
        this.keyHash = keyHash;
        this.createdAt = LocalDateTime.now();
        this.isRevoked = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public void setKeyHash(String keyHash) {
        this.keyHash = keyHash;
    }

    public Boolean getIsRevoked() {
        return isRevoked;
    }

    public void setIsRevoked(Boolean isRevoked) {
        this.isRevoked = isRevoked;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
