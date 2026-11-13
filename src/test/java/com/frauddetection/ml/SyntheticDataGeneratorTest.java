package com.frauddetection.ml;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import weka.core.Instances;

import static org.junit.jupiter.api.Assertions.*;

class SyntheticDataGeneratorTest {

    private SyntheticDataGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new SyntheticDataGenerator();
    }

    @Test
    void testAttributesCreatedProperly() {
        var attrs = generator.getAttributes();
        assertEquals(9, attrs.size());
        assertEquals("amount", attrs.get(0).name());
        assertEquals("label", attrs.get(attrs.size() - 1).name());
    }

    @Test
    void testDatasetGeneration() {
        int rows = 1000;
        double fraudRatio = 0.05;
        Instances dataset = generator.generateDataset(rows, fraudRatio);

        assertNotNull(dataset);
        assertEquals(rows, dataset.numInstances());
        assertEquals(dataset.numAttributes() - 1, dataset.classIndex());

        int fraudCount = 0;
        int legitCount = 0;
        for (int i = 0; i < dataset.numInstances(); i++) {
            String label = dataset.instance(i).stringValue(dataset.classIndex());
            if ("FRAUD".equals(label)) {
                fraudCount++;
            } else if ("LEGIT".equals(label)) {
                legitCount++;
            }
        }

        assertTrue(fraudCount > 0, "Fraud cases should be generated");
        assertTrue(legitCount > fraudCount, "Legit cases should dominate the dataset");
        assertEquals(rows, fraudCount + legitCount);
    }
}
