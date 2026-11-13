package com.frauddetection.dto;

public class ModelVersionDto {
    private String version;
    private String name;
    private String description;
    private boolean active;
    private String algorithm;
    private Double accuracy;
    private Double precision;
    private Double recall;
    private Double f1;
    private Double rocAuc;

    public ModelVersionDto() {}

    public ModelVersionDto(String version, String name, String description, boolean active,
                           String algorithm, Double accuracy, Double precision, Double recall,
                           Double f1, Double rocAuc) {
        this.version = version;
        this.name = name;
        this.description = description;
        this.active = active;
        this.algorithm = algorithm;
        this.accuracy = accuracy;
        this.precision = precision;
        this.recall = recall;
        this.f1 = f1;
        this.rocAuc = rocAuc;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Double getPrecision() {
        return precision;
    }

    public void setPrecision(Double precision) {
        this.precision = precision;
    }

    public Double getRecall() {
        return recall;
    }

    public void setRecall(Double recall) {
        this.recall = recall;
    }

    public Double getF1() {
        return f1;
    }

    public void setF1(Double f1) {
        this.f1 = f1;
    }

    public Double getRocAuc() {
        return rocAuc;
    }

    public void setRocAuc(Double rocAuc) {
        this.rocAuc = rocAuc;
    }
}

