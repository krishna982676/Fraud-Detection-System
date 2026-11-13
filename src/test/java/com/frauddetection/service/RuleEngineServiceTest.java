package com.frauddetection.service;

import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.TransactionRequest;
import com.frauddetection.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RuleEngineServiceTest {

    private FraudProperties properties;
    private UserProfileService userProfileService;
    private RuleEngineService ruleEngineService;

    @BeforeEach
    void setUp() {
        properties = new FraudProperties();
        TransactionRepository transactionRepository = Mockito.mock(TransactionRepository.class);
        userProfileService = new UserProfileService(transactionRepository);
        ruleEngineService = new RuleEngineService(properties, userProfileService);
    }

    @Test
    void testNormalTransactionHasNoViolations() {
        userProfileService.recordTransaction("USER-1", 50.0, "NEW_YORK", "GROCERY", "MOBILE", 14, LocalDateTime.now().minusHours(2));
        userProfileService.recordTransaction("USER-1", 45.0, "NEW_YORK", "DINING", "MOBILE", 12, LocalDateTime.now().minusHours(1));

        TransactionRequest req = new TransactionRequest(
                "TXN-1", "USER-1", 48.0, "GROCERY", "NEW_YORK", "MOBILE", 15, 2.0, 2, false
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertFalse(result.hasViolations());
        assertEquals(0, result.getStructuredReasons().size());
        assertEquals(0.0, result.getRuleRiskScore());
    }

    @Test
    void testStatisticalZScoreAmountAnomaly() {
        // User with steady $30 average
        userProfileService.recordTransaction("USER-10", 30.0, "LONDON", "GROCERY", "MOBILE", 12, LocalDateTime.now().minusDays(2));
        userProfileService.recordTransaction("USER-10", 32.0, "LONDON", "DINING", "MOBILE", 13, LocalDateTime.now().minusDays(1));
        userProfileService.recordTransaction("USER-10", 28.0, "LONDON", "GROCERY", "MOBILE", 10, LocalDateTime.now().minusHours(5));

        // Sudden $1,400 transaction
        TransactionRequest req = new TransactionRequest(
                "TXN-2", "USER-10", 1400.0, "ELECTRONICS", "LONDON", "MOBILE", 14, 5.0, 1, false
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertTrue(result.hasViolations());
        assertTrue(result.getStructuredReasons().stream().anyMatch(r -> r.getCode().equals("AMOUNT_STATISTICAL_SPIKE")));
        assertTrue(result.getRuleRiskScore() > 0.2);
    }

    @Test
    void testHaversineImpossibleTravelSpeed() {
        LocalDateTime t1 = LocalDateTime.now().minusMinutes(10);
        // User was in NEW_YORK 10 minutes ago
        userProfileService.recordTransaction("USER-20", 50.0, "NEW_YORK", "DINING", "POS", 12, t1);

        // Suddenly transacts in TOKYO 10 minutes later (dist > 10,000 km, implied speed > 60,000 km/h)
        TransactionRequest req = new TransactionRequest(
                "TXN-3", "USER-20", 90.0, "DINING", "TOKYO", "POS", 13, 20.0, 1, false, LocalDateTime.now()
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertTrue(result.hasViolations());
        assertTrue(result.getStructuredReasons().stream().anyMatch(r -> r.getCode().equals("IMPOSSIBLE_TRAVEL")));
        assertTrue(result.getRuleRiskScore() >= 0.40);
    }

    @Test
    void testVelocityBurstRule() {
        LocalDateTime now = LocalDateTime.now();
        // Record 3 transactions within 3 minutes
        userProfileService.recordTransaction("USER-30", 20.0, "PARIS", "GROCERY", "MOBILE", 14, now.minusMinutes(3));
        userProfileService.recordTransaction("USER-30", 25.0, "PARIS", "GROCERY", "MOBILE", 14, now.minusMinutes(2));
        userProfileService.recordTransaction("USER-30", 30.0, "PARIS", "GROCERY", "MOBILE", 14, now.minusMinutes(1));

        // 4th transaction within 10 minutes
        TransactionRequest req = new TransactionRequest(
                "TXN-4", "USER-30", 40.0, "GROCERY", "PARIS", "MOBILE", 14, 2.0, 4, false, now
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertTrue(result.hasViolations());
        assertTrue(result.getStructuredReasons().stream().anyMatch(r -> r.getCode().equals("VELOCITY_BURST")));
    }

    @Test
    void testNocturnalInternationalViolation() {
        TransactionRequest req = new TransactionRequest(
                "TXN-5", "USER-40", 150.0, "TRANSFER", "DUBAI", "WEB", 3, 50.0, 2, true
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertTrue(result.hasViolations());
        assertTrue(result.getStructuredReasons().stream().anyMatch(r -> r.getCode().equals("NOCTURNAL_INTERNATIONAL")));
    }

    @Test
    void testIndiaLocationHaversineAndImpossibleTravel() {
        // Test distance between Mumbai and New Delhi (~1,148 km)
        double distMumbaiDelhi = UserProfileService.calculateHaversineDistanceKm("MUMBAI", "NEW_DELHI");
        assertTrue(distMumbaiDelhi > 1100.0 && distMumbaiDelhi < 1200.0,
                "Expected distance between Mumbai and New Delhi to be ~1,148 km but was " + distMumbaiDelhi);

        // Test alias "Delhi" and "India" map accurately
        double distAlias = UserProfileService.calculateHaversineDistanceKm("DELHI", "INDIA");
        assertEquals(0.0, distAlias, 0.01, "Both Delhi and India should map to New Delhi coordinates");

        // Test Bengaluru to London (> 7,000 km)
        double distBlrLondon = UserProfileService.calculateHaversineDistanceKm("BENGALURU", "LONDON");
        assertTrue(distBlrLondon > 7000.0, "Distance between Bengaluru and London should exceed 7,000 km");

        // Record a transaction in Bengaluru, then another in New Delhi 5 minutes later (> 1,700 km/h)
        LocalDateTime t1 = LocalDateTime.now().minusMinutes(5);
        userProfileService.recordTransaction("USER-INDIA-TEST", 500.0, "BENGALURU", "TRANSFER", "MOBILE", 14, t1);

        TransactionRequest req = new TransactionRequest(
                "TXN-IN-1", "USER-INDIA-TEST", 600.0, "TRANSFER", "NEW_DELHI", "MOBILE", 14, 5.0, 2, false, LocalDateTime.now()
        );

        RuleEngineService.RuleEvaluationResult result = ruleEngineService.evaluate(req);
        assertTrue(result.hasViolations());
        assertTrue(result.getStructuredReasons().stream().anyMatch(r -> r.getCode().equals("IMPOSSIBLE_TRAVEL")),
                "Should trigger IMPOSSIBLE_TRAVEL for 1,700+ km in 5 minutes between Bengaluru and New Delhi");
    }
}
