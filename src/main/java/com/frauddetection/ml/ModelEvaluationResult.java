package com.frauddetection.ml;

public class ModelEvaluationResult {

    private String algorithm;
    private double threshold;
    private long totalInstances;
    private long trueNegatives;
    private long falsePositives;
    private long falseNegatives;
    private long truePositives;
    private double precision;
    private double recall;
    private double f1;
    private double rocAuc;
    private double prAuc;
    private double accuracy;

    public ModelEvaluationResult() {}

    public ModelEvaluationResult(String algorithm, double threshold, long tn, long fp, long fn, long tp,
                                 double rocAuc, double prAuc) {
        this.algorithm = algorithm;
        this.threshold = threshold;
        this.trueNegatives = tn;
        this.falsePositives = fp;
        this.falseNegatives = fn;
        this.truePositives = tp;
        this.totalInstances = tn + fp + fn + tp;

        this.precision = (tp + fp > 0) ? ((double) tp / (tp + fp)) : 0.0;
        this.recall = (tp + fn > 0) ? ((double) tp / (tp + fn)) : 0.0;
        this.f1 = (precision + recall > 0) ? (2.0 * precision * recall / (precision + recall)) : 0.0;
        this.accuracy = (totalInstances > 0) ? ((double) (tp + tn) / totalInstances) : 0.0;
        this.rocAuc = rocAuc;
        this.prAuc = prAuc;
    }

    public static ModelEvaluationResult trivialAlwaysLegit(long totalInstances, long actualFrauds) {
        long tn = totalInstances - actualFrauds;
        long fn = actualFrauds;
        long tp = 0;
        long fp = 0;
        double baseRate = totalInstances > 0 ? ((double) actualFrauds / totalInstances) : 0.0;
        return new ModelEvaluationResult("Trivial 'Always Legit' (ZeroR)", 0.50, tn, fp, fn, tp, 0.50, baseRate);
    }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    public double getThreshold() { return threshold; }
    public void setThreshold(double threshold) { this.threshold = threshold; }
    public long getTotalInstances() { return totalInstances; }
    public long getTrueNegatives() { return trueNegatives; }
    public long getFalsePositives() { return falsePositives; }
    public long getFalseNegatives() { return falseNegatives; }
    public long getTruePositives() { return truePositives; }
    public double getPrecision() { return precision; }
    public double getRecall() { return recall; }
    public double getF1() { return f1; }
    public double getRocAuc() { return rocAuc; }
    public double getPrAuc() { return prAuc; }
    public double getAccuracy() { return accuracy; }

    public int[][] getConfusionMatrixGrid() {
        return new int[][] {
                {(int) trueNegatives, (int) falsePositives},
                {(int) falseNegatives, (int) truePositives}
        };
    }

    public String toConfusionMatrixString() {
        return String.format(
                "                 Predicted Legit    Predicted Fraud%n" +
                "Actual Legit:    %,15d    %,15d%n" +
                "Actual Fraud:    %,15d    %,15d%n",
                trueNegatives, falsePositives, falseNegatives, truePositives
        );
    }
}

