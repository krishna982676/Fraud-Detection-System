package com.frauddetection.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ModelMetricsDto {

    private String algorithm;
    private String modelType;
    private String trainedAt;
    private int datasetRows;
    private double accuracy;
    private double precision;
    private double recall;
    private double f1;
    private double rocAuc;
    private double prAuc;
    private double decisionThreshold = 0.50;

    private String baselineAlgorithm;
    private double baselineAccuracy;
    private double baselinePrecision;
    private double baselineRecall;
    private double baselineF1;
    private double baselineRocAuc;

    private String logisticAlgorithm;
    private double logisticAccuracy;
    private double logisticPrecision;
    private double logisticRecall;
    private double logisticF1;
    private double logisticRocAuc;

    private double trivialAccuracy;
    private double trivialPrecision;
    private double trivialRecall;
    private double trivialF1;

    private String confusionMatrixText;
    private int[][] confusionMatrix;

    private List<ThresholdSweepDto> thresholdSweep = new ArrayList<>();
    private Map<String, Double> featureImportances = new HashMap<>();

    public ModelMetricsDto() {}

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
        this.modelType = algorithm;
    }

    public String getModelType() {
        return modelType != null ? modelType : algorithm;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
        if (this.algorithm == null) this.algorithm = modelType;
    }

    public double getF1Score() {
        return f1;
    }

    public void setF1Score(double f1Score) {
        this.f1 = f1Score;
    }

    public double getPrAuc() {
        return prAuc;
    }

    public void setPrAuc(double prAuc) {
        this.prAuc = prAuc;
    }

    public double getDecisionThreshold() {
        return decisionThreshold;
    }

    public void setDecisionThreshold(double decisionThreshold) {
        this.decisionThreshold = decisionThreshold;
    }

    public double getTrivialAccuracy() { return trivialAccuracy; }
    public void setTrivialAccuracy(double trivialAccuracy) { this.trivialAccuracy = trivialAccuracy; }
    public double getTrivialPrecision() { return trivialPrecision; }
    public void setTrivialPrecision(double trivialPrecision) { this.trivialPrecision = trivialPrecision; }
    public double getTrivialRecall() { return trivialRecall; }
    public void setTrivialRecall(double trivialRecall) { this.trivialRecall = trivialRecall; }
    public double getTrivialF1() { return trivialF1; }
    public void setTrivialF1(double trivialF1) { this.trivialF1 = trivialF1; }

    public double getBaselineJ48Accuracy() { return baselineAccuracy; }
    public void setBaselineJ48Accuracy(double v) { this.baselineAccuracy = v; }
    public double getBaselineJ48Precision() { return baselinePrecision; }
    public void setBaselineJ48Precision(double v) { this.baselinePrecision = v; }
    public double getBaselineJ48Recall() { return baselineRecall; }
    public void setBaselineJ48Recall(double v) { this.baselineRecall = v; }
    public double getBaselineJ48F1() { return baselineF1; }
    public void setBaselineJ48F1(double v) { this.baselineF1 = v; }
    public double getBaselineJ48RocAuc() { return baselineRocAuc; }
    public void setBaselineJ48RocAuc(double v) { this.baselineRocAuc = v; }

    public double getBaselineLogisticAccuracy() { return logisticAccuracy; }
    public void setBaselineLogisticAccuracy(double v) { this.logisticAccuracy = v; }
    public double getBaselineLogisticPrecision() { return logisticPrecision; }
    public void setBaselineLogisticPrecision(double v) { this.logisticPrecision = v; }
    public double getBaselineLogisticRecall() { return logisticRecall; }
    public void setBaselineLogisticRecall(double v) { this.logisticRecall = v; }
    public double getBaselineLogisticF1() { return logisticF1; }
    public void setBaselineLogisticF1(double v) { this.logisticF1 = v; }
    public double getBaselineLogisticRocAuc() { return logisticRocAuc; }
    public void setBaselineLogisticRocAuc(double v) { this.logisticRocAuc = v; }

    public int[][] getConfusionMatrix() {
        return confusionMatrix;
    }

    public void setConfusionMatrix(int[][] confusionMatrix) {
        this.confusionMatrix = confusionMatrix;
    }

    public String getConfusionMatrixText() {
        return confusionMatrixText;
    }

    public void setConfusionMatrixText(String confusionMatrixText) {
        this.confusionMatrixText = confusionMatrixText;
    }

    public String getTrainedAt() {
        return trainedAt;
    }

    public void setTrainedAt(Object trainedAt) {
        if (trainedAt != null) {
            this.trainedAt = trainedAt.toString();
        }
    }

    public int getDatasetRows() {
        return datasetRows;
    }

    public void setDatasetRows(int datasetRows) {
        this.datasetRows = datasetRows;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public double getPrecision() {
        return precision;
    }

    public void setPrecision(double precision) {
        this.precision = precision;
    }

    public double getRecall() {
        return recall;
    }

    public void setRecall(double recall) {
        this.recall = recall;
    }

    public double getF1() {
        return f1;
    }

    public void setF1(double f1) {
        this.f1 = f1;
    }

    public double getRocAuc() {
        return rocAuc;
    }

    public void setRocAuc(double rocAuc) {
        this.rocAuc = rocAuc;
    }

    public String getBaselineAlgorithm() {
        return baselineAlgorithm;
    }

    public void setBaselineAlgorithm(String baselineAlgorithm) {
        this.baselineAlgorithm = baselineAlgorithm;
    }

    public double getBaselineAccuracy() {
        return baselineAccuracy;
    }

    public void setBaselineAccuracy(double baselineAccuracy) {
        this.baselineAccuracy = baselineAccuracy;
    }

    public double getBaselinePrecision() {
        return baselinePrecision;
    }

    public void setBaselinePrecision(double baselinePrecision) {
        this.baselinePrecision = baselinePrecision;
    }

    public double getBaselineRecall() {
        return baselineRecall;
    }

    public void setBaselineRecall(double baselineRecall) {
        this.baselineRecall = baselineRecall;
    }

    public double getBaselineF1() {
        return baselineF1;
    }

    public void setBaselineF1(double baselineF1) {
        this.baselineF1 = baselineF1;
    }

    public double getBaselineRocAuc() {
        return baselineRocAuc;
    }

    public void setBaselineRocAuc(double baselineRocAuc) {
        this.baselineRocAuc = baselineRocAuc;
    }

    public String getLogisticAlgorithm() {
        return logisticAlgorithm;
    }

    public void setLogisticAlgorithm(String logisticAlgorithm) {
        this.logisticAlgorithm = logisticAlgorithm;
    }

    public double getLogisticAccuracy() {
        return logisticAccuracy;
    }

    public void setLogisticAccuracy(double logisticAccuracy) {
        this.logisticAccuracy = logisticAccuracy;
    }

    public double getLogisticPrecision() {
        return logisticPrecision;
    }

    public void setLogisticPrecision(double logisticPrecision) {
        this.logisticPrecision = logisticPrecision;
    }

    public double getLogisticRecall() {
        return logisticRecall;
    }

    public void setLogisticRecall(double logisticRecall) {
        this.logisticRecall = logisticRecall;
    }

    public double getLogisticF1() {
        return logisticF1;
    }

    public void setLogisticF1(double logisticF1) {
        this.logisticF1 = logisticF1;
    }

    public double getLogisticRocAuc() {
        return logisticRocAuc;
    }

    public void setLogisticRocAuc(double logisticRocAuc) {
        this.logisticRocAuc = logisticRocAuc;
    }

    public List<ThresholdSweepDto> getThresholdSweep() {
        return thresholdSweep;
    }

    public void setThresholdSweep(List<ThresholdSweepDto> thresholdSweep) {
        this.thresholdSweep = thresholdSweep;
    }

    public Map<String, Double> getFeatureImportances() {
        return featureImportances;
    }

    public void setFeatureImportances(Map<String, Double> featureImportances) {
        this.featureImportances = featureImportances;
    }
}
