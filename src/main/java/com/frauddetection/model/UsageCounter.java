package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_counters", uniqueConstraints = {
    @UniqueConstraint(name = "uk_usage_counters_org_month", columnNames = {"organization_id", "year_month"})
}, indexes = {
    @Index(name = "idx_usage_org_month", columnList = "organization_id, year_month")
})
public class UsageCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    @Column(name = "txn_count", nullable = false)
    private Long txnCount = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UsageCounter() {
        this.createdAt = LocalDateTime.now();
        this.txnCount = 0L;
    }

    public UsageCounter(String organizationId, String yearMonth, Long txnCount) {
        this.organizationId = organizationId;
        this.yearMonth = yearMonth;
        this.txnCount = txnCount;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
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

    public String getYearMonth() {
        return yearMonth;
    }

    public void setYearMonth(String yearMonth) {
        this.yearMonth = yearMonth;
    }

    public Long getTxnCount() {
        return txnCount;
    }

    public void setTxnCount(Long txnCount) {
        this.txnCount = txnCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
