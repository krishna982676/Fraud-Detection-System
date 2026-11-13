package com.frauddetection.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frauddetection.dto.ApiResponse;
import com.frauddetection.dto.ModelMetricsDto;
import com.frauddetection.dto.ModelVersionDto;
import com.frauddetection.dto.ThresholdSweepDto;
import com.frauddetection.exception.ModelNotReadyException;
import com.frauddetection.ml.WekaFraudClassifier;
import com.frauddetection.model.AnalystFeedbackRecord;
import com.frauddetection.repository.AnalystFeedbackRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/model", "/api/model"})
public class ModelController {

    private final WekaFraudClassifier classifier;
    private final AnalystFeedbackRepository feedbackRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    public ModelController(WekaFraudClassifier classifier,
                           AnalystFeedbackRepository feedbackRepository) {
        this.classifier = classifier;
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping("/train")
    public ResponseEntity<ApiResponse<ModelMetricsDto>> retrainModel() {
        ModelMetricsDto metrics = classifier.trainModel();
        return ResponseEntity.ok(ApiResponse.ok("Model trained and evaluated successfully", metrics));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ModelMetricsDto> getMetrics() {
        ModelMetricsDto metrics = classifier.getLatestMetrics();
        if (metrics == null) {
            File f = new File("models/metrics.json");
            if (!f.exists()) f = new File("models/latest/metrics.json");
            if (!f.exists()) f = new File("models/v2/metrics.json");
            if (f.exists()) {
                try {
                    metrics = objectMapper.readValue(f, ModelMetricsDto.class);
                } catch (Exception ignored) {}
            }
        }
        if (metrics == null) {
            throw new ModelNotReadyException("Model metrics are not available yet. Please train the model.");
        }
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/threshold-sweep")
    public ResponseEntity<List<ThresholdSweepDto>> getThresholdSweep() {
        List<ThresholdSweepDto> sweep = classifier.getThresholdSweep();
        if (sweep == null || sweep.isEmpty()) {
            ModelMetricsDto m = classifier.getLatestMetrics();
            if (m != null && m.getThresholdSweep() != null) {
                sweep = m.getThresholdSweep();
            }
        }
        return ResponseEntity.ok(sweep);
    }

    @GetMapping("/versions")
    public ResponseEntity<List<ModelVersionDto>> getVersions() {
        List<ModelVersionDto> list = new ArrayList<>();
        String currentActive = classifier.getActiveVersion();

        // Check models/v2
        File v2Dir = new File("models/v2");
        if (v2Dir.exists()) {
            ModelMetricsDto m = readMetricsFromDir(v2Dir);
            list.add(new ModelVersionDto(
                    "v2",
                    "Model B (Financial Fraud Dataset)",
                    "10 features, stratified 80/20, optimal threshold 0.20",
                    "v2".equalsIgnoreCase(currentActive),
                    m != null ? m.getAlgorithm() : "RandomForest (50 trees, maxDepth 15)",
                    m != null ? m.getAccuracy() : 0.5160,
                    m != null ? m.getPrecision() : 0.0519,
                    m != null ? m.getRecall() : 0.5120,
                    m != null ? m.getF1() : 0.0943,
                    m != null ? m.getRocAuc() : 0.5234
            ));
        }

        // Check models/v1
        File v1Dir = new File("models/v1");
        if (v1Dir.exists()) {
            ModelMetricsDto m = readMetricsFromDir(v1Dir);
            list.add(new ModelVersionDto(
                    "v1",
                    "Model A (CreditCard Kaggle Dataset)",
                    "29 PCA components + Amount, time-split 80/20, optimal threshold 0.90",
                    "v1".equalsIgnoreCase(currentActive),
                    m != null ? m.getAlgorithm() : "RandomForest (50 trees, maxDepth 15)",
                    m != null ? m.getAccuracy() : 0.9994,
                    m != null ? m.getPrecision() : 0.8868,
                    m != null ? m.getRecall() : 0.6267,
                    m != null ? m.getF1() : 0.7344,
                    m != null ? m.getRocAuc() : 0.9723
            ));
        }

        return ResponseEntity.ok(list);
    }

    @PostMapping("/activate/{version}")
    public ResponseEntity<ApiResponse<ModelMetricsDto>> activateVersion(@PathVariable String version) {
        boolean ok = classifier.activateVersion(version);
        if (!ok) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to activate model version: " + version));
        }
        ModelMetricsDto metrics = classifier.getLatestMetrics();
        return ResponseEntity.ok(ApiResponse.ok("Model version " + version + " activated successfully", metrics));
    }

    @PostMapping("/retrain-from-feedback")
    public ResponseEntity<ApiResponse<ModelMetricsDto>> retrainFromFeedback() {
        List<AnalystFeedbackRecord> feedbackList = feedbackRepository.findAllByOrderByCreatedAtDesc();
        if (feedbackList.isEmpty()) {
            ModelMetricsDto metrics = classifier.trainModel();
            return ResponseEntity.ok(ApiResponse.ok("No feedback labels found; retrained base model", metrics));
        }
        ModelMetricsDto metrics = classifier.retrainWithFeedback(feedbackList);
        return ResponseEntity.ok(ApiResponse.ok(
                String.format("Model retrained successfully with %d analyst feedback samples", feedbackList.size()),
                metrics
        ));
    }

    private ModelMetricsDto readMetricsFromDir(File dir) {
        File f = new File(dir, "metrics.json");
        if (f.exists()) {
            try {
                return objectMapper.readValue(f, ModelMetricsDto.class);
            } catch (Exception ignored) {}
        }
        return null;
    }
}
