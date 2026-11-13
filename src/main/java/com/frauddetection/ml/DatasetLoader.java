package com.frauddetection.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.*;

@Component
public class DatasetLoader {

    private static final Logger log = LoggerFactory.getLogger(DatasetLoader.class);
    private final SyntheticDataGenerator syntheticDataGenerator;

    public DatasetLoader(SyntheticDataGenerator syntheticDataGenerator) {
        this.syntheticDataGenerator = syntheticDataGenerator;
    }

    public Instances loadDataset(String csvPath, int fallbackRows, double fallbackFraudRatio) {
        if (csvPath != null && !csvPath.isBlank()) {
            File file = new File(csvPath);
            if (file.exists() && file.isFile()) {
                try {
                    log.info("Loading dataset from CSV: {}", file.getAbsolutePath());
                    Instances dataset = loadFromCustomCsv(file);
                    if (dataset != null && dataset.numInstances() > 0) {
                        return dataset;
                    }
                } catch (Exception e) {
                    log.error("Failed to load CSV from {}: {}. Falling back to synthetic generator.", csvPath, e.getMessage());
                }
            } else {
                log.warn("Configured CSV file '{}' not found. Falling back to synthetic dataset.", csvPath);
            }
        }

        return syntheticDataGenerator.generateDataset(fallbackRows, fallbackFraudRatio);
    }

    private Instances loadFromCustomCsv(File csvFile) throws Exception {
        ArrayList<Attribute> attributes = syntheticDataGenerator.getAttributes();
        Instances instances = new Instances("FraudDatasetFromCSV", attributes, 1000);
        instances.setClassIndex(attributes.size() - 1);

        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return null;
            }

            String[] headers = headerLine.split(",");
            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                colMap.put(headers[i].trim().toLowerCase(), i);
            }

            // Check if this is standard project CSV
            boolean hasStandardColumns = colMap.containsKey("amount") && colMap.containsKey("label");

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] parts = line.split(",");

                DenseInstance inst = new DenseInstance(attributes.size());
                inst.setDataset(instances);

                if (hasStandardColumns) {
                    double amount = Double.parseDouble(parts[colMap.get("amount")].trim());
                    String category = colMap.containsKey("merchantcategory") ? parts[colMap.get("merchantcategory")].trim() : "GROCERY";
                    String location = colMap.containsKey("location") ? parts[colMap.get("location")].trim() : "NEW_YORK";
                    String device = colMap.containsKey("devicetype") ? parts[colMap.get("devicetype")].trim() : "MOBILE";
                    int hour = colMap.containsKey("hourofday") ? Integer.parseInt(parts[colMap.get("hourofday")].trim()) : 12;
                    double dist = colMap.containsKey("distancefromhome") ? Double.parseDouble(parts[colMap.get("distancefromhome")].trim()) : 5.0;
                    int txns = colMap.containsKey("txncountlast24h") ? Integer.parseInt(parts[colMap.get("txnCountlast24h".toLowerCase())].trim()) : 1;
                    String isIntl = colMap.containsKey("isinternational") ? parts[colMap.get("isinternational")].trim().toUpperCase() : "N";
                    String rawLabel = parts[colMap.get("label")].trim().toUpperCase();
                    String label = (rawLabel.equals("1") || rawLabel.equals("FRAUD") || rawLabel.equals("TRUE")) ? "FRAUD" : "LEGIT";

                    inst.setValue(instances.attribute("amount"), amount);
                    inst.setValue(instances.attribute("merchantCategory"), safeNominal(instances.attribute("merchantCategory"), category));
                    inst.setValue(instances.attribute("location"), safeNominal(instances.attribute("location"), location));
                    inst.setValue(instances.attribute("deviceType"), safeNominal(instances.attribute("deviceType"), device));
                    inst.setValue(instances.attribute("hourOfDay"), hour);
                    inst.setValue(instances.attribute("distanceFromHome"), dist);
                    inst.setValue(instances.attribute("txnCountLast24h"), txns);
                    inst.setValue(instances.attribute("isInternational"), isIntl.startsWith("Y") ? "Y" : "N");
                    inst.setValue(instances.attribute("label"), label);
                } else if (colMap.containsKey("class")) {
                    // Kaggle creditcard.csv format (Time, V1..V28, Amount, Class)
                    double amount = colMap.containsKey("amount") ? Double.parseDouble(parts[colMap.get("amount")].trim()) : 50.0;
                    String rawClass = parts[colMap.get("class")].trim();
                    boolean isFraud = "1".equals(rawClass);

                    inst.setValue(instances.attribute("amount"), amount);
                    inst.setValue(instances.attribute("merchantCategory"), isFraud ? "TRANSFER" : "GROCERY");
                    inst.setValue(instances.attribute("location"), "NEW_YORK");
                    inst.setValue(instances.attribute("deviceType"), isFraud ? "WEB" : "POS");
                    inst.setValue(instances.attribute("hourOfDay"), 14);
                    inst.setValue(instances.attribute("distanceFromHome"), isFraud ? 2500.0 : 5.0);
                    inst.setValue(instances.attribute("txnCountLast24h"), isFraud ? 12 : 2);
                    inst.setValue(instances.attribute("isInternational"), isFraud ? "Y" : "N");
                    inst.setValue(instances.attribute("label"), isFraud ? "FRAUD" : "LEGIT");
                }

                instances.add(inst);
            }
        }

        log.info("Successfully loaded {} rows from CSV", instances.numInstances());
        return instances;
    }

    private String safeNominal(Attribute attr, String value) {
        if (value == null) return attr.value(0);
        String upper = value.trim().toUpperCase();
        for (int i = 0; i < attr.numValues(); i++) {
            if (attr.value(i).equalsIgnoreCase(upper)) {
                return attr.value(i);
            }
        }
        return attr.value(0);
    }
}
