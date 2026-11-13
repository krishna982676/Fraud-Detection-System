package com.frauddetection.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ThresholdSweepDto {
    private double threshold;
    private double precision;
    private double recall;
    private double f1;

    public ThresholdSweepDto() {}

    public ThresholdSweepDto(double threshold, double precision, double recall, double f1) {
        this.threshold = threshold;
        this.precision = precision;
        this.recall = recall;
        this.f1 = f1;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
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

    public double getF1Score() {
        return f1;
    }

    public void setF1Score(double f1Score) {
        this.f1 = f1Score;
    }
}
