package com.frauddetection.ml;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ModelEvaluationResultTest {

    @Test
    void testMetricsCalculation() {
        // TN = 950, FP = 10, FN = 5, TP = 35
        ModelEvaluationResult result = new ModelEvaluationResult(
                "RandomForest", 0.70, 950, 10, 5, 35, 0.95, 0.88
        );

        assertEquals(1000, result.getTotalInstances());
        assertEquals(950, result.getTrueNegatives());
        assertEquals(10, result.getFalsePositives());
        assertEquals(5, result.getFalseNegatives());
        assertEquals(35, result.getTruePositives());

        // Precision = 35 / (35 + 10) = 35 / 45 = 0.7777...
        assertEquals(35.0 / 45.0, result.getPrecision(), 0.0001);

        // Recall = 35 / (35 + 5) = 35 / 40 = 0.875
        assertEquals(35.0 / 40.0, result.getRecall(), 0.0001);

        // F1 = 2 * P * R / (P + R)
        double p = 35.0 / 45.0;
        double r = 35.0 / 40.0;
        double expectedF1 = 2 * p * r / (p + r);
        assertEquals(expectedF1, result.getF1(), 0.0001);

        // Accuracy = (950 + 35) / 1000 = 0.985
        assertEquals(0.985, result.getAccuracy(), 0.0001);
        assertEquals(0.95, result.getRocAuc(), 0.0001);
        assertEquals(0.88, result.getPrAuc(), 0.0001);

        // 2x2 matrix
        int[][] matrix = result.getConfusionMatrixGrid();
        assertEquals(950, matrix[0][0]);
        assertEquals(10, matrix[0][1]);
        assertEquals(5, matrix[1][0]);
        assertEquals(35, matrix[1][1]);
    }

    @Test
    void testTrivialClassifier() {
        // 10,000 instances with 200 frauds -> Trivial classifier predicts Legit for all
        ModelEvaluationResult trivial = ModelEvaluationResult.trivialAlwaysLegit(10000, 200);

        assertEquals(0.98, trivial.getAccuracy(), 0.001); // 98% accuracy!
        assertEquals(0.0, trivial.getPrecision(), 0.001);
        assertEquals(0.0, trivial.getRecall(), 0.001);
        assertEquals(0.0, trivial.getF1(), 0.001);
        assertEquals(0.50, trivial.getRocAuc(), 0.001);
        assertEquals(0.02, trivial.getPrAuc(), 0.001); // Base rate
    }
}

