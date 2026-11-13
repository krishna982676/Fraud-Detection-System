package com.frauddetection.ml;

import com.frauddetection.config.FraudProperties;
import com.frauddetection.dto.ModelMetricsDto;
import com.frauddetection.dto.ThresholdSweepDto;
import com.frauddetection.dto.TopFactor;
import com.frauddetection.dto.TransactionRequest;
import com.frauddetection.model.ModelMetricsRecord;
import com.frauddetection.repository.ModelMetricsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class WekaFraudClassifierTest {

    private WekaFraudClassifier classifier;
    private FraudProperties properties;
    private SyntheticDataGenerator generator;
    private DatasetLoader loader;
    private ModelMetricsRepository repository;

    @BeforeEach
    void setUp() {
        properties = new FraudProperties();
        properties.setModelPath("target/test-models/fraud-test-v2.model");
        properties.getDataset().setSyntheticRows(600);
        properties.getDataset().setFraudRatio(0.05);

        generator = new SyntheticDataGenerator();
        loader = new DatasetLoader(generator);
        repository = Mockito.mock(ModelMetricsRepository.class);

        when(repository.save(any(ModelMetricsRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        classifier = new WekaFraudClassifier(properties, loader, generator, repository);
    }

    @Test
    void testTrainAndPredictMultiModel() {
        ModelMetricsDto metrics = classifier.trainModel();

        assertNotNull(metrics);
        assertTrue(classifier.isReady());
        assertTrue(metrics.getAccuracy() > 70.0, "Accuracy should be substantial");
        assertTrue(metrics.getRocAuc() > 0.6, "ROC AUC should be high");

        // Verify baseline models evaluated
        assertNotNull(metrics.getBaselineAlgorithm());
        assertTrue(metrics.getBaselineAccuracy() > 0.0);
        assertNotNull(metrics.getLogisticAlgorithm());
        assertTrue(metrics.getLogisticAccuracy() > 0.0);

        // Test prediction
        TransactionRequest legitReq = new TransactionRequest(
                "TXN-T1", "USER-1", 25.0, "GROCERY", "NEW_YORK", "POS", 14, 2.0, 1, false
        );
        double legitProb = classifier.predictFraudProbability(legitReq);
        assertTrue(legitProb >= 0.0 && legitProb <= 1.0);

        TransactionRequest fraudReq = new TransactionRequest(
                "TXN-T2", "USER-2", 4500.0, "LUXURY", "DUBAI", "WEB", 2, 7000.0, 25, true
        );
        double fraudProb = classifier.predictFraudProbability(fraudReq);
        assertTrue(fraudProb >= 0.0 && fraudProb <= 1.0);
        assertTrue(fraudProb > legitProb, "Fraud probability should exceed legit probability");

        // Test Explainability top factors
        List<TopFactor> factors = classifier.explainPrediction(fraudReq, fraudProb);
        assertNotNull(factors);
        assertFalse(factors.isEmpty());
        assertTrue(factors.size() <= 3);

        // Test Threshold Sweep
        List<ThresholdSweepDto> sweep = classifier.getThresholdSweep();
        assertNotNull(sweep);
        assertFalse(sweep.isEmpty());
    }
}
