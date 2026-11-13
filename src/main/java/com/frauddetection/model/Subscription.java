package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_sub_org_id", columnList = "organization_id"),
    @Index(name = "idx_sub_status", columnList = "status"),
    @Index(name = "idx_sub_provider_id", columnList = "provider_subscription_id")
})
public class Subscription {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "organization_id", nullable = false, unique = true, length = 36)
    private String organizationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Plan plan = Plan.TRIAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SubscriptionStatus status = SubscriptionStatus.TRIALING;

    @Column(nullable = false, length = 32)
    private String provider = "RAZORPAY";

    @Column(name = "provider_subscription_id")
    private String providerSubscriptionId;

    @Column(name = "provider_customer_id")
    private String providerCustomerId;

    @Column(name = "trial_ends_at", nullable = false)
    private LocalDateTime trialEndsAt;

    @Column(name = "current_period_start")
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "cancel_at_period_end", nullable = false)
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Subscription() {
        this.createdAt = LocalDateTime.now();
        this.status = SubscriptionStatus.TRIALING;
        this.cancelAtPeriodEnd = false;
    }

    public Subscription(String id, String organizationId, Plan plan, LocalDateTime trialEndsAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.plan = plan;
        this.status = SubscriptionStatus.TRIALING;
        this.trialEndsAt = trialEndsAt;
        this.createdAt = LocalDateTime.now();
        this.cancelAtPeriodEnd = false;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isTrialExpired() {
        return status == SubscriptionStatus.TRIALING && trialEndsAt != null && LocalDateTime.now().isAfter(trialEndsAt);
    }

    public boolean isUsable() {
        if (status == SubscriptionStatus.ACTIVE) {
            return true;
        }
        if (status == SubscriptionStatus.TRIALING) {
            return trialEndsAt != null && LocalDateTime.now().isBefore(trialEndsAt);
        }
        return false;
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

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderSubscriptionId() {
        return providerSubscriptionId;
    }

    public void setProviderSubscriptionId(String providerSubscriptionId) {
        this.providerSubscriptionId = providerSubscriptionId;
    }

    public String getProviderCustomerId() {
        return providerCustomerId;
    }

    public void setProviderCustomerId(String providerCustomerId) {
        this.providerCustomerId = providerCustomerId;
    }

    public LocalDateTime getTrialEndsAt() {
        return trialEndsAt;
    }

    public void setTrialEndsAt(LocalDateTime trialEndsAt) {
        this.trialEndsAt = trialEndsAt;
    }

    public LocalDateTime getCurrentPeriodStart() {
        return currentPeriodStart;
    }

    public void setCurrentPeriodStart(LocalDateTime currentPeriodStart) {
        this.currentPeriodStart = currentPeriodStart;
    }

    public LocalDateTime getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }

    public void setCurrentPeriodEnd(LocalDateTime currentPeriodEnd) {
        this.currentPeriodEnd = currentPeriodEnd;
    }

    public Boolean getCancelAtPeriodEnd() {
        return cancelAtPeriodEnd;
    }

    public void setCancelAtPeriodEnd(Boolean cancelAtPeriodEnd) {
        this.cancelAtPeriodEnd = cancelAtPeriodEnd;
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
