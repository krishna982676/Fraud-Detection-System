package com.frauddetection.service;

import com.frauddetection.dto.AnalysisResponse;
import com.frauddetection.dto.TransactionRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DatasetAnalysisService {
    private static final int MAX_ROWS = 10_000;
    private final TransactionAnalysisService transactionAnalysisService;
    private final Map<String, DatasetSession> sessions = new ConcurrentHashMap<>();

    public DatasetAnalysisService(TransactionAnalysisService transactionAnalysisService) {
        this.transactionAnalysisService = transactionAnalysisService;
    }

    public Map<String, Object> upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Select a non-empty CSV file");
        }
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new IllegalArgumentException("CSV file must be smaller than 25 MB");
        }
        List<Map<String, String>> rows = parse(file);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("CSV must contain a header and at least one data row");
        }
        String id = UUID.randomUUID().toString();
        List<String> columns = new ArrayList<>(rows.get(0).keySet());
        String target = findColumn(columns, "class", "is_fraud", "fraud", "label", "target");
        DatasetSession session = new DatasetSession(id, file.getOriginalFilename(), columns, rows, target);
        sessions.put(id, session);

        Map<String, Object> profile = profile(session);
        profile.put("status", "UPLOADED");
        return profile;
    }

    public Map<String, Object> list() {
        List<Map<String, Object>> result = new ArrayList<>();
        sessions.values().stream()
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .forEach(session -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("datasetId", session.id);
                    item.put("name", session.name);
                    item.put("rows", session.rows.size());
                    item.put("columns", session.columns.size());
                    item.put("status", session.status);
                    item.put("mode", session.targetColumn == null ? "ANOMALY_DETECTION" : "SUPERVISED");
                    item.put("createdAt", session.createdAt.toString());
                    result.add(item);
                });
        return Map.of("datasets", result);
    }

    public Map<String, Object> profile(String id) {
        DatasetSession session = get(id);
        return profile(session);
    }

    public Map<String, Object> analyze(String id) {
        DatasetSession session = get(id);
        if ("COMPLETED".equals(session.status)) return results(session);
        session.status = "ANALYSING";
        long started = System.currentTimeMillis();
        int suspicious = 0;
        List<Map<String, Object>> analysed = new ArrayList<>();
        for (int i = 0; i < session.rows.size(); i++) {
            Map<String, String> row = session.rows.get(i);
            AnalysisResponse response = transactionAnalysisService.analyzeTransaction(toRequest(row, session.columns, session.id, i));
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("original", row);
            result.put("transactionId", response.getTransactionId());
            result.put("amount", response.getAmount());
            result.put("fraudProbability", response.getFraudProbability());
            result.put("predictedFraud", response.getIsFraud());
            result.put("riskLevel", response.getRiskLevel());
            result.put("decision", response.getIsFraud() ? "BLOCK" : response.getRiskLevel().name().equals("MEDIUM") ? "REVIEW" : "APPROVE");
            result.put("reasons", response.getReasons() == null ? List.of() : response.getReasons());
            analysed.add(result);
            if (response.getRiskLevel().name().equals("HIGH")) suspicious++;
        }
        session.results = analysed;
        session.status = "COMPLETED";
        session.processingMs = System.currentTimeMillis() - started;
        return results(session);
    }

    public String export(String id) {
        DatasetSession session = get(id);
        if (!"COMPLETED".equals(session.status)) throw new IllegalStateException("Analyse the dataset before exporting it");
        StringBuilder csv = new StringBuilder(String.join(",", session.columns))
                .append(",predicted_fraud,fraud_probability,risk_level,decision,detection_reasons\n");
        for (Map<String, Object> result : session.results) {
            @SuppressWarnings("unchecked")
            Map<String, String> original = (Map<String, String>) result.get("original");
            for (int i = 0; i < session.columns.size(); i++) {
                if (i > 0) csv.append(',');
                csv.append(csvValue(original.get(session.columns.get(i))));
            }
            csv.append(',').append(result.get("predictedFraud"))
                    .append(',').append(result.get("fraudProbability"))
                    .append(',').append(result.get("riskLevel"))
                    .append(',').append(result.get("decision"))
                    .append(',').append(csvValue(String.join(" | ", (List<String>) result.get("reasons"))))
                    .append('\n');
        }
        return csv.toString();
    }

    public void delete(String id) {
        if (sessions.remove(id) == null) throw new IllegalArgumentException("Dataset not found");
    }

    private Map<String, Object> profile(DatasetSession session) {
        Map<String, Object> profile = new LinkedHashMap<>();
        List<String> numerical = new ArrayList<>();
        List<String> categorical = new ArrayList<>();
        int missing = 0;
        int duplicates = 0;
        String previous = null;
        for (Map<String, String> row : session.rows) {
            String fingerprint = row.toString();
            if (fingerprint.equals(previous)) duplicates++;
            previous = fingerprint;
            for (String column : session.columns) {
                String value = row.get(column);
                if (value == null || value.isBlank()) missing++;
            }
        }
        for (String column : session.columns) {
            boolean numeric = session.rows.stream().map(row -> row.get(column))
                    .filter(value -> value != null && !value.isBlank())
                    .allMatch(this::isNumber);
            (numeric ? numerical : categorical).add(column);
        }
        profile.put("datasetId", session.id);
        profile.put("name", session.name);
        profile.put("rows", session.rows.size());
        profile.put("columns", session.columns.size());
        profile.put("columnNames", session.columns);
        profile.put("numericalColumns", numerical);
        profile.put("categoricalColumns", categorical);
        profile.put("missingValues", missing);
        profile.put("duplicateRecords", duplicates);
        profile.put("targetColumn", session.targetColumn);
        profile.put("mode", session.targetColumn == null ? "ANOMALY_DETECTION" : "SUPERVISED");
        profile.put("status", session.status);
        return profile;
    }

    private Map<String, Object> results(DatasetSession session) {
        long high = session.results.stream().filter(r -> "HIGH".equals(String.valueOf(r.get("riskLevel")))).count();
        long medium = session.results.stream().filter(r -> "MEDIUM".equals(String.valueOf(r.get("riskLevel")))).count();
        Map<String, Object> response = profile(session);
        response.put("status", session.status);
        response.put("processingMs", session.processingMs);
        response.put("suspicious", high);
        response.put("review", medium);
        response.put("normal", session.results.size() - high - medium);
        response.put("results", session.results);
        return response;
    }

    private TransactionRequest toRequest(Map<String, String> row, List<String> columns, String datasetId, int index) {
        String amount = value(row, columns, "amount", "transaction_amount", "transactionamount", "amt");
        String user = value(row, columns, "user_id", "userid", "customer_id", "customerid", "account_id");
        String merchant = value(row, columns, "merchant", "merchant_category", "merchantcategory", "transaction_type");
        String location = value(row, columns, "location", "country", "city");
        String device = value(row, columns, "device", "device_type", "deviceused");
        String time = value(row, columns, "hour", "hour_of_day", "hourofday", "time", "transaction_time");
        TransactionRequest request = new TransactionRequest(
                datasetId.substring(0, 8) + "-" + (value(row, columns, "transaction_id", "transactionid", "id") == null ? index : value(row, columns, "transaction_id", "transactionid", "id")),
                user == null ? "dataset-user-" + index : user,
                number(amount, 50.0),
                merchant == null ? "UNKNOWN" : merchant,
                location == null ? "UNKNOWN" : location,
                device == null ? "UNKNOWN" : device,
                hour(time),
                number(value(row, columns, "distance_from_home", "distancefromhome"), 0.0),
                (int) number(value(row, columns, "txn_count_last_24h", "txncountlast24h", "transaction_frequency"), 1),
                booleanValue(value(row, columns, "is_international", "isinternational", "international")),
                timestamp(value(row, columns, "timestamp", "transaction_time", "transaction_date", "date"))
        );
        return request;
    }

    private List<Map<String, String>> parse(MultipartFile file) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) return List.of();
            List<String> columns = splitCsv(header);
            List<Map<String, String>> rows = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null && rows.size() < MAX_ROWS) {
                if (line.isBlank()) continue;
                List<String> values = splitCsv(line);
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < columns.size(); i++) row.put(columns.get(i), i < values.size() ? values.get(i).trim() : "");
                rows.add(row);
            }
            return rows;
        }
    }

    private List<String> splitCsv(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') quoted = !quoted;
            else if (c == ',' && !quoted) { values.add(current.toString().replace("\"", "")); current.setLength(0); }
            else current.append(c);
        }
        values.add(current.toString().replace("\"", ""));
        return values;
    }

    private String value(Map<String, String> row, List<String> columns, String... aliases) {
        String column = findColumn(columns, aliases);
        return column == null ? null : row.get(column);
    }

    private String findColumn(List<String> columns, String... aliases) {
        for (String column : columns) for (String alias : aliases)
            if (normal(column).equals(normal(alias))) return column;
        return null;
    }

    private String normal(String value) { return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", ""); }
    private boolean isNumber(String value) { try { Double.parseDouble(value.trim()); return true; } catch (Exception e) { return false; } }
    private double number(String value, double fallback) { return value != null && isNumber(value) ? Double.parseDouble(value) : fallback; }
    private int hour(String value) { return (int) Math.max(0, Math.min(23, number(value, 12))); }
    private boolean booleanValue(String value) { return value != null && (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("yes") || value.equals("1") || value.equalsIgnoreCase("y")); }
    private LocalDateTime timestamp(String value) {
        if (value != null) try { return LocalDateTime.parse(value.replace("Z", "")); } catch (DateTimeParseException ignored) {}
        return LocalDateTime.now();
    }
    private String csvValue(String value) { return value == null ? "" : "\"" + value.replace("\"", "\"\"") + "\""; }
    private DatasetSession get(String id) { DatasetSession session = sessions.get(id); if (session == null) throw new IllegalArgumentException("Dataset not found"); return session; }

    private static final class DatasetSession {
        final String id, name, createdAt;
        final List<String> columns;
        final List<Map<String, String>> rows;
        final String targetColumn;
        String status = "UPLOADED";
        long processingMs;
        List<Map<String, Object>> results = Collections.emptyList();
        DatasetSession(String id, String name, List<String> columns, List<Map<String, String>> rows, String targetColumn) {
            this.id = id; this.name = name == null ? "dataset.csv" : name; this.columns = columns; this.rows = rows;
            this.targetColumn = targetColumn; this.createdAt = LocalDateTime.now().toString();
        }
    }
}
