package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_slug", columnList = "slug")
})
public class Organization {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, length = 32)
    private String status = "ACTIVE";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Plan plan = Plan.TRIAL;

    @Column(length = 32)
    private String gstin;

    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "risk_threshold")
    private Double riskThreshold = 0.70;

    @Column(name = "medium_risk_threshold")
    private Double mediumRiskThreshold = 0.40;

    @Column(name = "data_retention_days")
    private Integer dataRetentionDays = 90;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Organization() {
        this.createdAt = LocalDateTime.now();
    }

    public Organization(String id, String name, String slug, Plan plan) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.plan = plan;
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public Double getRiskThreshold() {
        return riskThreshold != null ? riskThreshold : 0.70;
    }

    public void setRiskThreshold(Double riskThreshold) {
        this.riskThreshold = riskThreshold;
    }

    public Double getMediumRiskThreshold() {
        return mediumRiskThreshold != null ? mediumRiskThreshold : 0.40;
    }

    public void setMediumRiskThreshold(Double mediumRiskThreshold) {
        this.mediumRiskThreshold = mediumRiskThreshold;
    }

    public Integer getDataRetentionDays() {
        return dataRetentionDays;
    }

    public void setDataRetentionDays(Integer dataRetentionDays) {
        this.dataRetentionDays = dataRetentionDays;
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
