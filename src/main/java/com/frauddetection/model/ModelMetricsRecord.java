package com.frauddetection.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_metrics", indexes = {
    @Index(name = "idx_metrics_org_id", columnList = "organizationId")
})
public class ModelMetricsRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId = "default-org";

    @Column(nullable = false, length = 64)
    private String algorithm;

    @Column(nullable = false)
    private LocalDateTime trainedAt;

    @Column(nullable = false)
    private Integer datasetRows;

    @Column(nullable = false)
    private Double accuracy;

    @Column(nullable = false)
    private Double precisionVal;

    @Column(nullable = false)
    private Double recallVal;

    @Column(nullable = false)
    private Double f1Val;

    @Column(nullable = false)
    private Double rocAucVal;

    @Column(length = 64)
    private String baselineAlgorithm;

    private Double baselineAccuracy;
    private Double baselinePrecision;
    private Double baselineRecall;
    private Double baselineF1;
    private Double baselineRocAuc;

    @Column(length = 64)
    private String logisticAlgorithm;

    private Double logisticAccuracy;
    private Double logisticPrecision;
    private Double logisticRecall;
    private Double logisticF1;
    private Double logisticRocAuc;

    @Column(length = 4000)
    private String confusionMatrix;

    @Column(length = 4000)
    private String thresholdSweepJson;

    @Column(length = 2000)
    private String featureImportancesJson;

    public ModelMetricsRecord() {
        this.trainedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public LocalDateTime getTrainedAt() {
        return trainedAt;
    }

    public void setTrainedAt(LocalDateTime trainedAt) {
        this.trainedAt = trainedAt;
    }

    public Integer getDatasetRows() {
        return datasetRows;
    }

    public void setDatasetRows(Integer datasetRows) {
        this.datasetRows = datasetRows;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getPrecisionVal() {
        return precisionVal;
    }

    public void setPrecisionVal(Double precisionVal) {
        this.precisionVal = precisionVal;
    }

    public Double getRecallVal() {
        return recallVal;
    }

    public void setRecallVal(Double recallVal) {
        this.recallVal = recallVal;
    }

    public Double getF1Val() {
        return f1Val;
    }

    public void setF1Val(Double f1Val) {
        this.f1Val = f1Val;
    }

    public Double getRocAucVal() {
        return rocAucVal;
    }

    public void setRocAucVal(Double rocAucVal) {
        this.rocAucVal = rocAucVal;
    }

    public String getBaselineAlgorithm() {
        return baselineAlgorithm;
    }

    public void setBaselineAlgorithm(String baselineAlgorithm) {
        this.baselineAlgorithm = baselineAlgorithm;
    }

    public Double getBaselineAccuracy() {
        return baselineAccuracy;
    }

    public void setBaselineAccuracy(Double baselineAccuracy) {
        this.baselineAccuracy = baselineAccuracy;
    }

    public Double getBaselinePrecision() {
        return baselinePrecision;
    }

    public void setBaselinePrecision(Double baselinePrecision) {
        this.baselinePrecision = baselinePrecision;
    }

    public Double getBaselineRecall() {
        return baselineRecall;
    }

    public void setBaselineRecall(Double baselineRecall) {
        this.baselineRecall = baselineRecall;
    }

    public Double getBaselineF1() {
        return baselineF1;
    }

    public void setBaselineF1(Double baselineF1) {
        this.baselineF1 = baselineF1;
    }

    public Double getBaselineRocAuc() {
        return baselineRocAuc;
    }

    public void setBaselineRocAuc(Double baselineRocAuc) {
        this.baselineRocAuc = baselineRocAuc;
    }

    public String getLogisticAlgorithm() {
        return logisticAlgorithm;
    }

    public void setLogisticAlgorithm(String logisticAlgorithm) {
        this.logisticAlgorithm = logisticAlgorithm;
    }

    public Double getLogisticAccuracy() {
        return logisticAccuracy;
    }

    public void setLogisticAccuracy(Double logisticAccuracy) {
        this.logisticAccuracy = logisticAccuracy;
    }

    public Double getLogisticPrecision() {
        return logisticPrecision;
    }

    public void setLogisticPrecision(Double logisticPrecision) {
        this.logisticPrecision = logisticPrecision;
    }

    public Double getLogisticRecall() {
        return logisticRecall;
    }

    public void setLogisticRecall(Double logisticRecall) {
        this.logisticRecall = logisticRecall;
    }

    public Double getLogisticF1() {
        return logisticF1;
    }

    public void setLogisticF1(Double logisticF1) {
        this.logisticF1 = logisticF1;
    }

    public Double getLogisticRocAuc() {
        return logisticRocAuc;
    }

    public void setLogisticRocAuc(Double logisticRocAuc) {
        this.logisticRocAuc = logisticRocAuc;
    }

    public String getConfusionMatrix() {
        return confusionMatrix;
    }

    public void setConfusionMatrix(String confusionMatrix) {
        this.confusionMatrix = confusionMatrix;
    }

    public String getThresholdSweepJson() {
        return thresholdSweepJson;
    }

    public void setThresholdSweepJson(String thresholdSweepJson) {
        this.thresholdSweepJson = thresholdSweepJson;
    }

    public String getFeatureImportancesJson() {
        return featureImportancesJson;
    }

    public void setFeatureImportancesJson(String featureImportancesJson) {
        this.featureImportancesJson = featureImportancesJson;
    }

    public String getOrganizationId() {
        return organizationId != null ? organizationId : "default-org";
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }
}
