package com.frauddetection.ml;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DatasetProfileTest {

    @Test
    void testProfileComputation(@TempDir Path tempDir) throws Exception {
        File csv = tempDir.resolve("test_transactions.csv").toFile();
        try (PrintWriter pw = new PrintWriter(new FileWriter(csv))) {
            pw.println("txn_id,user_id,amount,category,is_fraud");
            pw.println("T1,U1,100.0,GROCERY,0");
            pw.println("T2,U2,250.0,,1");
            pw.println("T3,U3,,LUXURY,0");
            pw.println("T1,U1,100.0,GROCERY,0"); // duplicate
            pw.println("T4,U4,500.0,TRANSFER,1");
        }

        DatasetProfile profile = DatasetProfile.profile(
                "Test Dataset", csv, "is_fraud", List.of("txn_id", "user_id")
        );

        assertEquals(5, profile.getTotalRows());
        assertEquals(3, profile.getLegitCount());
        assertEquals(2, profile.getFraudCount());
        assertEquals(1, profile.getDuplicateRows());
        assertEquals(40.0, profile.getFraudPercentage(), 0.001);

        assertTrue(profile.getRemovedColumns().contains("txn_id"));
        assertTrue(profile.getRemovedColumns().contains("user_id"));
        assertFalse(profile.getUsableFeatures().contains("txn_id"));
        assertTrue(profile.getUsableFeatures().contains("amount"));
        assertTrue(profile.getUsableFeatures().contains("category"));

        assertEquals(1L, profile.getMissingPerColumn().get("amount"));
        assertEquals(1L, profile.getMissingPerColumn().get("category"));
        assertEquals(0L, profile.getMissingPerColumn().get("is_fraud"));
    }
}

