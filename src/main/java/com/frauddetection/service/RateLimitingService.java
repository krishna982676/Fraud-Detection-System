package com.frauddetection.service;

import com.frauddetection.config.PlanProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final PlanProperties planProperties;
    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    public RateLimitingService(PlanProperties planProperties) {
        this.planProperties = planProperties;
    }

    public boolean tryConsume(String keyIdentifier, String planName) {
        Bucket bucket = bucketCache.computeIfAbsent(keyIdentifier, k -> createNewBucket(planName));
        return bucket.tryConsume(1);
    }

    private Bucket createNewBucket(String planName) {
        PlanProperties.PlanDetail detail = planProperties.getDetail(planName);
        int ratePerMinute = detail != null ? detail.getRateLimitPerMinute() : 120;
        Bandwidth limit = Bandwidth.classic(ratePerMinute, Refill.greedy(ratePerMinute, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
