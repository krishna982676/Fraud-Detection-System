package com.frauddetection.dto;

import com.frauddetection.model.RiskLevel;

public class ScoreBreakdown {
    private double mlScore;
    private double ruleScore;
    private double finalScore;
    private RiskLevel riskLevel;

    public ScoreBreakdown() {}

    public ScoreBreakdown(double mlScore, double ruleScore, double finalScore, RiskLevel riskLevel) {
        this.mlScore = mlScore;
        this.ruleScore = ruleScore;
        this.finalScore = finalScore;
        this.riskLevel = riskLevel;
    }

    public double getMlScore() {
        return mlScore;
    }

    public void setMlScore(double mlScore) {
        this.mlScore = mlScore;
    }

    public double getRuleScore() {
        return ruleScore;
    }

    public void setRuleScore(double ruleScore) {
        this.ruleScore = ruleScore;
    }

    public double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(double finalScore) {
        this.finalScore = finalScore;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }
}
