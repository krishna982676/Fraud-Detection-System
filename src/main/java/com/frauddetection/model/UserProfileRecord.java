package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_profiles_org_user", columnNames = {"organization_id", "user_id"})
}, indexes = {
    @Index(name = "idx_profiles_org_id", columnList = "organization_id")
})
public class UserProfileRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "sum_amount")
    private Double sumAmount = 0.0;

    @Column(name = "sum_sq_amount")
    private Double sumSqAmount = 0.0;

    @Column(name = "txn_count")
    private Long txnCount = 0L;

    @Column(name = "primary_city", length = 64)
    private String primaryCity;

    @Column(name = "primary_category", length = 64)
    private String primaryCategory;

    @Column(name = "last_location", length = 64)
    private String lastLocation;

    @Column(name = "last_transaction_at")
    private LocalDateTime lastTransactionAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UserProfileRecord() {
        this.updatedAt = LocalDateTime.now();
    }

    public UserProfileRecord(String organizationId, String userId) {
        this.organizationId = organizationId;
        this.userId = userId;
        this.sumAmount = 0.0;
        this.sumSqAmount = 0.0;
        this.txnCount = 0L;
        this.updatedAt = LocalDateTime.now();
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

    public Double getSumAmount() {
        return sumAmount;
    }

    public void setSumAmount(Double sumAmount) {
        this.sumAmount = sumAmount;
    }

    public Double getSumSqAmount() {
        return sumSqAmount;
    }

    public void setSumSqAmount(Double sumSqAmount) {
        this.sumSqAmount = sumSqAmount;
    }

    public Long getTxnCount() {
        return txnCount;
    }

    public void setTxnCount(Long txnCount) {
        this.txnCount = txnCount;
    }

    public String getPrimaryCity() {
        return primaryCity;
    }

    public void setPrimaryCity(String primaryCity) {
        this.primaryCity = primaryCity;
    }

    public String getPrimaryCategory() {
        return primaryCategory;
    }

    public void setPrimaryCategory(String primaryCategory) {
        this.primaryCategory = primaryCategory;
    }

    public String getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(String lastLocation) {
        this.lastLocation = lastLocation;
    }

    public LocalDateTime getLastTransactionAt() {
        return lastTransactionAt;
    }

    public void setLastTransactionAt(LocalDateTime lastTransactionAt) {
        this.lastTransactionAt = lastTransactionAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
