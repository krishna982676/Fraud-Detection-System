package com.frauddetection.dto;

import java.util.List;

public class BatchAnalysisResponse {

    private int totalProcessed;
    private int fraudCount;
    private int alertCount;
    private List<AnalysisResponse> results;

    public BatchAnalysisResponse() {}

    public BatchAnalysisResponse(int totalProcessed, int fraudCount, int alertCount, List<AnalysisResponse> results) {
        this.totalProcessed = totalProcessed;
        this.fraudCount = fraudCount;
        this.alertCount = alertCount;
        this.results = results;
    }

    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public int getFraudCount() {
        return fraudCount;
    }

    public void setFraudCount(int fraudCount) {
        this.fraudCount = fraudCount;
    }

    public int getAlertCount() {
        return alertCount;
    }

    public void setAlertCount(int alertCount) {
        this.alertCount = alertCount;
    }

    public List<AnalysisResponse> getResults() {
        return results;
    }

    public void setResults(List<AnalysisResponse> results) {
        this.results = results;
    }
}
