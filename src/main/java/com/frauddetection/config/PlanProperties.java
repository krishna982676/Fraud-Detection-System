package com.frauddetection.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "sentinelx.plans")
public class PlanProperties {

    public static class PlanDetail {
        private String name;
        private long priceInrMonthly;
        private long priceInrYearly;
        private long monthlyQuota = 10000;
        private int trialDays = 30;
        private int rateLimitPerMinute = 120;
        private List<String> features = new ArrayList<>();

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public long getPriceInrMonthly() {
            return priceInrMonthly;
        }

        public void setPriceInrMonthly(long priceInrMonthly) {
            this.priceInrMonthly = priceInrMonthly;
        }

        public long getPriceInrYearly() {
            return priceInrYearly;
        }

        public void setPriceInrYearly(long priceInrYearly) {
            this.priceInrYearly = priceInrYearly;
        }

        public long getMonthlyQuota() {
            return monthlyQuota;
        }

        public void setMonthlyQuota(long monthlyQuota) {
            this.monthlyQuota = monthlyQuota;
        }

        public int getTrialDays() {
            return trialDays;
        }

        public void setTrialDays(int trialDays) {
            this.trialDays = trialDays;
        }

        public int getRateLimitPerMinute() {
            return rateLimitPerMinute;
        }

        public void setRateLimitPerMinute(int rateLimitPerMinute) {
            this.rateLimitPerMinute = rateLimitPerMinute;
        }

        public List<String> getFeatures() {
            return features;
        }

        public void setFeatures(List<String> features) {
            this.features = features;
        }
    }

    private PlanDetail trial = new PlanDetail();
    private PlanDetail starter = new PlanDetail();
    private PlanDetail growth = new PlanDetail();
    private PlanDetail enterprise = new PlanDetail();

    public PlanDetail getTrial() {
        return trial;
    }

    public void setTrial(PlanDetail trial) {
        this.trial = trial;
    }

    public PlanDetail getStarter() {
        return starter;
    }

    public void setStarter(PlanDetail starter) {
        this.starter = starter;
    }

    public PlanDetail getGrowth() {
        return growth;
    }

    public void setGrowth(PlanDetail growth) {
        this.growth = growth;
    }

    public PlanDetail getEnterprise() {
        return enterprise;
    }

    public void setEnterprise(PlanDetail enterprise) {
        this.enterprise = enterprise;
    }

    public PlanDetail getDetail(String plan) {
        if (plan == null) return trial;
        return switch (plan.toUpperCase()) {
            case "STARTER" -> starter;
            case "GROWTH" -> growth;
            case "ENTERPRISE" -> enterprise;
            default -> trial;
        };
    }
}
