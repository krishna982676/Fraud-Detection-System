package com.frauddetection.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "fraud.detection")
public class FraudProperties {

    private double threshold = 0.70;
    private double mediumThreshold = 0.40;
    private String modelPath = "models/fraud.model";
    private Dataset dataset = new Dataset();
    private Rules rules = new Rules();

    public static class Dataset {
        private int syntheticRows = 20000;
        private double fraudRatio = 0.02;
        private String csvPath = "";

        public int getSyntheticRows() {
            return syntheticRows;
        }

        public void setSyntheticRows(int syntheticRows) {
            this.syntheticRows = syntheticRows;
        }

        public double getFraudRatio() {
            return fraudRatio;
        }

        public void setFraudRatio(double fraudRatio) {
            this.fraudRatio = fraudRatio;
        }

        public String getCsvPath() {
            return csvPath;
        }

        public void setCsvPath(String csvPath) {
            this.csvPath = csvPath;
        }
    }

    public static class Rules {
        private double amountMultiplierThreshold = 10.0;
        private double impossibleTravelKm = 2000.0;
        private int highVelocity24h = 15;
        private int nightHourStart = 1;
        private int nightHourEnd = 5;

        public double getAmountMultiplierThreshold() {
            return amountMultiplierThreshold;
        }

        public void setAmountMultiplierThreshold(double amountMultiplierThreshold) {
            this.amountMultiplierThreshold = amountMultiplierThreshold;
        }

        public double getImpossibleTravelKm() {
            return impossibleTravelKm;
        }

        public void setImpossibleTravelKm(double impossibleTravelKm) {
            this.impossibleTravelKm = impossibleTravelKm;
        }

        public int getHighVelocity24h() {
            return highVelocity24h;
        }

        public void setHighVelocity24h(int highVelocity24h) {
            this.highVelocity24h = highVelocity24h;
        }

        public int getNightHourStart() {
            return nightHourStart;
        }

        public void setNightHourStart(int nightHourStart) {
            this.nightHourStart = nightHourStart;
        }

        public int getNightHourEnd() {
            return nightHourEnd;
        }

        public void setNightHourEnd(int nightHourEnd) {
            this.nightHourEnd = nightHourEnd;
        }
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }

    public double getMediumThreshold() {
        return mediumThreshold;
    }

    public void setMediumThreshold(double mediumThreshold) {
        this.mediumThreshold = mediumThreshold;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public Dataset getDataset() {
        return dataset;
    }

    public void setDataset(Dataset dataset) {
        this.dataset = dataset;
    }

    public Rules getRules() {
        return rules;
    }

    public void setRules(Rules rules) {
        this.rules = rules;
    }
}
