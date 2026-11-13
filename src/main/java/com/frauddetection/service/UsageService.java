package com.frauddetection.service;

import com.frauddetection.config.PlanProperties;
import com.frauddetection.model.Organization;
import com.frauddetection.model.Plan;
import com.frauddetection.model.Subscription;
import com.frauddetection.model.SubscriptionStatus;
import com.frauddetection.model.UsageCounter;
import com.frauddetection.repository.OrganizationRepository;
import com.frauddetection.repository.SubscriptionRepository;
import com.frauddetection.repository.UsageCounterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class UsageService {

    private static final Logger log = LoggerFactory.getLogger(UsageService.class);
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final UsageCounterRepository usageCounterRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrganizationRepository organizationRepository;
    private final PlanProperties planProperties;

    public UsageService(UsageCounterRepository usageCounterRepository,
                        SubscriptionRepository subscriptionRepository,
                        OrganizationRepository organizationRepository,
                        PlanProperties planProperties) {
        this.usageCounterRepository = usageCounterRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.organizationRepository = organizationRepository;
        this.planProperties = planProperties;
    }

    public static class QuotaCheckResult {
        private final boolean allowed;
        private final boolean trialExpired;
        private final boolean quotaExceeded;
        private final long currentUsage;
        private final long limit;
        private final String message;

        public QuotaCheckResult(boolean allowed, boolean trialExpired, boolean quotaExceeded, long currentUsage, long limit, String message) {
            this.allowed = allowed;
            this.trialExpired = trialExpired;
            this.quotaExceeded = quotaExceeded;
            this.currentUsage = currentUsage;
            this.limit = limit;
            this.message = message;
        }

        public boolean isAllowed() {
            return allowed;
        }

        public boolean isTrialExpired() {
            return trialExpired;
        }

        public boolean isQuotaExceeded() {
            return quotaExceeded;
        }

        public long getCurrentUsage() {
            return currentUsage;
        }

        public long getLimit() {
            return limit;
        }

        public String getMessage() {
            return message;
        }
    }

    public String getCurrentYearMonth() {
        return LocalDate.now().format(MONTH_FORMATTER);
    }

    @Transactional
    public QuotaCheckResult checkAndIncrementUsage(String organizationId, long count) {
        String currentMonth = getCurrentYearMonth();

        // 1. Check Subscription Status
        Optional<Subscription> subOpt = subscriptionRepository.findByOrganizationId(organizationId);
        SubscriptionStatus status = subOpt.map(Subscription::getStatus).orElse(SubscriptionStatus.TRIALING);
        LocalDateTime trialEndsAt = subOpt.map(Subscription::getTrialEndsAt).orElse(null);

        if (status == SubscriptionStatus.TRIALING && trialEndsAt != null && LocalDateTime.now().isAfter(trialEndsAt)) {
            return new QuotaCheckResult(false, true, false, 0, 0, "Trial period expired. Please upgrade your subscription to continue real-time scoring.");
        }

        if (status == SubscriptionStatus.CANCELED || status == SubscriptionStatus.EXPIRED) {
            return new QuotaCheckResult(false, true, false, 0, 0, "Subscription is inactive. Please reactivate your plan to resume transaction analysis.");
        }

        // 2. Determine Quota
        Plan plan = subOpt.map(Subscription::getPlan).orElse(Plan.TRIAL);
        PlanProperties.PlanDetail planDetail = planProperties.getDetail(plan.name());
        long monthlyLimit = planDetail != null ? planDetail.getMonthlyQuota() : 10000;

        // 3. Atomically Get or Create Usage Counter
        UsageCounter counter = usageCounterRepository.findByOrganizationIdAndYearMonth(organizationId, currentMonth)
                .orElseGet(() -> {
                    UsageCounter newCounter = new UsageCounter(organizationId, currentMonth, 0L);
                    try {
                        return usageCounterRepository.save(newCounter);
                    } catch (Exception e) {
                        return usageCounterRepository.findByOrganizationIdAndYearMonth(organizationId, currentMonth).orElse(newCounter);
                    }
                });

        if (counter.getTxnCount() + count > monthlyLimit) {
            return new QuotaCheckResult(false, false, true, counter.getTxnCount(), monthlyLimit,
                    "Monthly transaction quota exceeded (" + counter.getTxnCount() + "/" + monthlyLimit + "). Upgrade to a higher plan for unlimited scoring.");
        }

        // 4. Increment
        usageCounterRepository.incrementCount(organizationId, currentMonth, count);
        return new QuotaCheckResult(true, false, false, counter.getTxnCount() + count, monthlyLimit, "OK");
    }

    public long getCurrentMonthUsage(String organizationId) {
        return usageCounterRepository.findByOrganizationIdAndYearMonth(organizationId, getCurrentYearMonth())
                .map(UsageCounter::getTxnCount)
                .orElse(0L);
    }
}
