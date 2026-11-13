package com.frauddetection.ml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.*;

public class DatasetProfile {

    private final String datasetName;
    private final String filePath;
    private long totalRows;
    private long legitCount;
    private long fraudCount;
    private long duplicateRows;
    private final Map<String, Long> missingPerColumn = new LinkedHashMap<>();
    private final List<String> columns = new ArrayList<>();
    private final List<String> removedColumns = new ArrayList<>();
    private final List<String> usableFeatures = new ArrayList<>();
    private String labelColumn;

    public DatasetProfile(String datasetName, String filePath) {
        this.datasetName = datasetName;
        this.filePath = filePath;
    }

    public static DatasetProfile profile(String datasetName, File file, String labelCol, List<String> identifierCols) throws Exception {
        DatasetProfile profile = new DatasetProfile(datasetName, file.getAbsolutePath());
        profile.labelColumn = labelCol;
        if (identifierCols != null) {
            profile.removedColumns.addAll(identifierCols);
        }

        Set<String> seenRowSignatures = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return profile;
            }

            String[] rawHeaders = headerLine.split(",");
            for (String h : rawHeaders) {
                String cleanHeader = h.replace("\"", "").trim();
                profile.columns.add(cleanHeader);
                profile.missingPerColumn.put(cleanHeader, 0L);
                if (!cleanHeader.equalsIgnoreCase(labelCol) &&
                        (identifierCols == null || !identifierCols.contains(cleanHeader))) {
                    profile.usableFeatures.add(cleanHeader);
                }
            }

            int labelIdx = -1;
            for (int i = 0; i < profile.columns.size(); i++) {
                if (profile.columns.get(i).equalsIgnoreCase(labelCol)) {
                    labelIdx = i;
                    break;
                }
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                profile.totalRows++;

                // Duplicate check via string signature
                if (!seenRowSignatures.add(line)) {
                    profile.duplicateRows++;
                }

                String[] parts = line.split(",", -1);
                for (int i = 0; i < profile.columns.size(); i++) {
                    String col = profile.columns.get(i);
                    String val = (i < parts.length) ? parts[i].replace("\"", "").trim() : "";
                    if (val.isEmpty()) {
                        profile.missingPerColumn.put(col, profile.missingPerColumn.get(col) + 1);
                    }
                }

                if (labelIdx >= 0 && labelIdx < parts.length) {
                    String rawLabel = parts[labelIdx].replace("\"", "").trim().toUpperCase();
                    if ("1".equals(rawLabel) || "FRAUD".equals(rawLabel) || "TRUE".equals(rawLabel)) {
                        profile.fraudCount++;
                    } else {
                        profile.legitCount++;
                    }
                }
            }
        }

        return profile;
    }

    public double getFraudPercentage() {
        return totalRows > 0 ? (fraudCount * 100.0 / totalRows) : 0.0;
    }

    public void printSummary() {
        System.out.println("================================================================================");
        System.out.printf("DATASET PROFILE: %s (%s)%n", datasetName, filePath);
        System.out.println("================================================================================");
        System.out.printf("Total Row Count:        %,d%n", totalRows);
        System.out.printf("Legitimate Transactions: %,d (%.4f%%)%n", legitCount, 100.0 - getFraudPercentage());
        System.out.printf("Fraud Transactions:      %,d (%.4f%%)%n", fraudCount, getFraudPercentage());
        System.out.printf("Duplicate Rows:          %,d%n", duplicateRows);
        System.out.printf("Label Column:            %s%n", labelColumn);
        System.out.printf("Removed Identifiers:     %s%n", removedColumns.isEmpty() ? "None" : removedColumns);
        System.out.printf("Usable Features (%d):     %s%n", usableFeatures.size(), usableFeatures);
        System.out.println("Missing Values per Column:");
        for (Map.Entry<String, Long> entry : missingPerColumn.entrySet()) {
            double pct = totalRows > 0 ? (entry.getValue() * 100.0 / totalRows) : 0.0;
            System.out.printf("  - %-32s: %,8d missing (%.2f%%)%n", entry.getKey(), entry.getValue(), pct);
        }
        System.out.println("================================================================================\n");
    }

    // Getters
    public String getDatasetName() { return datasetName; }
    public String getFilePath() { return filePath; }
    public long getTotalRows() { return totalRows; }
    public long getLegitCount() { return legitCount; }
    public long getFraudCount() { return fraudCount; }
    public long getDuplicateRows() { return duplicateRows; }
    public Map<String, Long> getMissingPerColumn() { return missingPerColumn; }
    public List<String> getColumns() { return columns; }
    public List<String> getRemovedColumns() { return removedColumns; }
    public List<String> getUsableFeatures() { return usableFeatures; }
    public String getLabelColumn() { return labelColumn; }
}
