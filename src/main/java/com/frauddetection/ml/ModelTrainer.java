package com.frauddetection.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import weka.attributeSelection.CorrelationAttributeEval;
import weka.attributeSelection.InfoGainAttributeEval;
import weka.attributeSelection.Ranker;
import weka.classifiers.Classifier;
import weka.classifiers.Evaluation;
import weka.classifiers.functions.Logistic;
import weka.classifiers.trees.J48;
import weka.classifiers.trees.RandomForest;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.SerializationHelper;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class ModelTrainer {

    private static final ObjectMapper MAPPER = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("  SENTINELX FRAUD DETECTION - DUAL-DATASET Weka ML PIPELINE");
        System.out.println("================================================================================\n");

        try {
            File creditCardFile = new File("data/creditcard.csv");
            File fraudDatasetFile = new File("Fraud Detection Dataset.csv");

            if (!creditCardFile.exists()) {
                System.err.println("ERROR: data/creditcard.csv does not exist. Please unzip creditcard.csv.zip first.");
                System.exit(1);
            }
            if (!fraudDatasetFile.exists()) {
                System.err.println("ERROR: Fraud Detection Dataset.csv not found in root.");
                System.exit(1);
            }

            // STEP 1: PROFILING
            System.out.println(">>> STEP 1: PROFILING BOTH DATASETS <<<\n");
            DatasetProfile profileA = DatasetProfile.profile("Model A: Kaggle CreditCard", creditCardFile, "Class", List.of());
            profileA.printSummary();

            DatasetProfile profileB = DatasetProfile.profile("Model B: Financial Fraud Dataset", fraudDatasetFile, "Fraudulent",
                    List.of("Transaction_ID", "User_ID"));
            profileB.printSummary();

            // STEP 2 & 3: TRAIN & EVALUATE MODEL A (creditcard.csv)
            System.out.println(">>> STEP 2 & 3: TRAINING & EVALUATING MODEL A (creditcard.csv) <<<\n");
            PipelineResult resultA = trainAndEvaluateModelA(creditCardFile, profileA);

            // STEP 2 & 3: TRAIN & EVALUATE MODEL B (Fraud Detection Dataset.csv)
            System.out.println(">>> STEP 2 & 3: TRAINING & EVALUATING MODEL B (Fraud Detection Dataset.csv) <<<\n");
            PipelineResult resultB = trainAndEvaluateModelB(fraudDatasetFile, profileB);

            // STEP 4: SAVE ARTIFACTS
            System.out.println(">>> STEP 4: SAVING ARTIFACTS <<<\n");
            saveArtifacts("models/v1", resultA);
            saveArtifacts("models/v2", resultB);

            // Set v2 as latest model for runtime web app (schema matches application transactions)
            saveActiveModel("models/v2");

            // PRINT FINAL COMPARATIVE SUMMARY
            printFinalSummary(resultA, resultB);

        } catch (Exception e) {
            System.err.println("PIPELINE EXECUTION FAILED:");
            e.printStackTrace();
            System.exit(1);
        }
    }

    // =========================================================================
    // MODEL A: creditcard.csv (Time-sorted split, V1..V28, Amount, Class)
    // =========================================================================
    private static PipelineResult trainAndEvaluateModelA(File csvFile, DatasetProfile profile) throws Exception {
        System.out.println("Streaming and sorting data/creditcard.csv by Time...");

        // Define Weka Attributes for Model A
        ArrayList<Attribute> attributes = new ArrayList<>();
        for (int i = 1; i <= 28; i++) {
            attributes.add(new Attribute("V" + i));
        }
        attributes.add(new Attribute("Amount"));
        List<String> classValues = List.of("LEGIT", "FRAUD");
        attributes.add(new Attribute("Class", classValues));

        Instances header = new Instances("CreditCardFraud", attributes, 0);
        header.setClassIndex(attributes.size() - 1);

        // Load CSV rows, keep Time for sorting
        List<CreditCardRow> allRows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile))) {
            String headerLine = reader.readLine(); // skip header
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] p = line.split(",");
                double time = Double.parseDouble(p[0].replace("\"", "").trim());
                double[] features = new double[29]; // V1..V28 + Amount
                for (int i = 0; i < 28; i++) {
                    features[i] = Double.parseDouble(p[i + 1].replace("\"", "").trim());
                }
                features[28] = Double.parseDouble(p[29].replace("\"", "").trim()); // Amount
                int label = "1".equals(p[30].replace("\"", "").trim()) ? 1 : 0;
                allRows.add(new CreditCardRow(time, features, label));
            }
        }

        // Sort by Time ascending (chronological split)
        allRows.sort(Comparator.comparingDouble(r -> r.time));
        int totalRows = allRows.size();

        // 80% train partition, 20% test partition
        int trainPartitionCutoff = (int) (totalRows * 0.80); // 227,845
        int valSliceSize = (int) (trainPartitionCutoff * 0.20); // 45,569
        int trainSliceCutoff = trainPartitionCutoff - valSliceSize; // 182,276

        System.out.printf("Chronological Split:%n  Train Slice: rows 0 to %,d (%,d total)%n  Val Slice:   rows %,d to %,d (%,d total)%n  Test Slice:  rows %,d to %,d (%,d total)%n",
                trainSliceCutoff - 1, trainSliceCutoff,
                trainSliceCutoff, trainPartitionCutoff - 1, valSliceSize,
                trainPartitionCutoff, totalRows - 1, totalRows - trainPartitionCutoff);

        // Class imbalance handling on TRAIN SET ONLY:
        // Keep all fraud cases; subsample legit cases to ratio of 1:10 (e.g. 10 legit per 1 fraud)
        Random rng = new Random(42);
        Instances trainInstances = new Instances(header, 5000);
        int trainFrauds = 0;
        int trainLegits = 0;

        for (int i = 0; i < trainSliceCutoff; i++) {
            CreditCardRow r = allRows.get(i);
            if (r.label == 1) {
                trainFrauds++;
                trainInstances.add(toInstance(header, r));
            }
        }

        int targetLegit = Math.min(trainSliceCutoff - trainFrauds, trainFrauds * 10);
        double legitSampleRate = (double) targetLegit / (trainSliceCutoff - trainFrauds);

        for (int i = 0; i < trainSliceCutoff; i++) {
            CreditCardRow r = allRows.get(i);
            if (r.label == 0) {
                if (rng.nextDouble() < legitSampleRate) {
                    trainLegits++;
                    trainInstances.add(toInstance(header, r));
                }
            }
        }
        System.out.printf("Train set after undersampling majority class (1:10 ratio): %,d instances (%,d fraud, %,d legit)%n",
                trainInstances.numInstances(), trainFrauds, trainLegits);

        // Validation slice: natural distribution
        Instances valInstances = new Instances(header, valSliceSize);
        long valFrauds = 0;
        for (int i = trainSliceCutoff; i < trainPartitionCutoff; i++) {
            CreditCardRow r = allRows.get(i);
            if (r.label == 1) valFrauds++;
            valInstances.add(toInstance(header, r));
        }
        System.out.printf("Validation set (natural distribution): %,d instances (%,d fraud, %.4f%%)%n",
                valInstances.numInstances(), valFrauds, (valFrauds * 100.0 / valInstances.numInstances()));

        // Test set: natural distribution
        Instances testInstances = new Instances(header, totalRows - trainPartitionCutoff);
        long testFrauds = 0;
        for (int i = trainPartitionCutoff; i < totalRows; i++) {
            CreditCardRow r = allRows.get(i);
            if (r.label == 1) testFrauds++;
            testInstances.add(toInstance(header, r));
        }
        System.out.printf("Test set (untouched, natural distribution): %,d instances (%,d fraud, %.4f%%)%n",
                testInstances.numInstances(), testFrauds, (testFrauds * 100.0 / testInstances.numInstances()));

        // Train 3 models
        System.out.println("\nTraining Main Model: RandomForest (50 trees, maxDepth 15)...");
        RandomForest rf = new RandomForest();
        rf.setNumIterations(50);
        rf.setMaxDepth(15);
        rf.setSeed(42);
        rf.buildClassifier(trainInstances);

        System.out.println("Training Baseline 1: J48 Decision Tree...");
        J48 j48 = new J48();
        j48.setConfidenceFactor(0.25f);
        j48.setMinNumObj(5);
        j48.buildClassifier(trainInstances);

        System.out.println("Training Baseline 2: Logistic Regression...");
        Logistic logReg = new Logistic();
        logReg.setMaxIts(50);
        logReg.buildClassifier(trainInstances);

        // Calibrate threshold on VALIDATION slice
        System.out.println("Tuning Decision Threshold on Validation Slice (maximizing F1)...");
        ThresholdCalibration calib = tuneThreshold(rf, valInstances, 1);
        System.out.printf("Optimal Validation Threshold: %.2f (Validation F1: %.4f, Precision: %.4f, Recall: %.4f)%n",
                calib.optimalThreshold, calib.bestF1, calib.precisionAtOptimal, calib.recallAtOptimal);

        // Evaluate all on TEST set
        System.out.println("\nEvaluating all models on UNTOUCHED Test Set...");
        ModelEvaluationResult rfTest = evaluateCustomThreshold(rf, testInstances, 1, calib.optimalThreshold, "RandomForest (Main)");
        ModelEvaluationResult j48Test = evaluateStandard(j48, testInstances, 1, "J48 Decision Tree (Baseline)");
        ModelEvaluationResult logTest = evaluateStandard(logReg, testInstances, 1, "Logistic Regression (Baseline)");
        ModelEvaluationResult trivialTest = ModelEvaluationResult.trivialAlwaysLegit(testInstances.numInstances(), testFrauds);

        // Feature importances
        Map<String, Double> importances = computeInfoGain(trainInstances);

        return new PipelineResult("Model A (creditcard.csv)", header, rf, j48, logReg, calib,
                rfTest, j48Test, logTest, trivialTest, importances, profile);
    }

    private static DenseInstance toInstance(Instances dataset, CreditCardRow r) {
        DenseInstance inst = new DenseInstance(dataset.numAttributes());
        inst.setDataset(dataset);
        for (int i = 0; i < 29; i++) {
            inst.setValue(i, r.features[i]);
        }
        inst.setValue(29, r.label == 1 ? "FRAUD" : "LEGIT");
        return inst;
    }

    private static class CreditCardRow {
        double time;
        double[] features;
        int label;

        CreditCardRow(double time, double[] features, int label) {
            this.time = time;
            this.features = features;
            this.label = label;
        }
    }

    // =========================================================================
    // MODEL B: Fraud Detection Dataset.csv (Stratified 80/20, Imputation on Train)
    // =========================================================================
    private static PipelineResult trainAndEvaluateModelB(File csvFile, DatasetProfile profile) throws Exception {
        System.out.println("Preparing Model B from Fraud Detection Dataset.csv...");

        // Define attributes (excluding Transaction_ID, User_ID)
        List<String> types = List.of("ATM Withdrawal", "Bill Payment", "POS Payment", "Bank Transfer", "Online Purchase");
        List<String> devices = List.of("Tablet", "Mobile", "Desktop", "Unknown Device", "UNKNOWN");
        List<String> locations = List.of("Boston", "New York", "Seattle", "Chicago", "Houston", "Los Angeles", "Miami", "San Francisco", "UNKNOWN");
        List<String> methods = List.of("UPI", "Debit Card", "Net Banking", "Credit Card", "Invalid Method", "UNKNOWN");
        List<String> labelValues = List.of("LEGIT", "FRAUD");

        ArrayList<Attribute> attributes = new ArrayList<>();
        attributes.add(new Attribute("Transaction_Amount"));
        attributes.add(new Attribute("Transaction_Type", types));
        attributes.add(new Attribute("Time_of_Transaction"));
        attributes.add(new Attribute("Device_Used", devices));
        attributes.add(new Attribute("Location", locations));
        attributes.add(new Attribute("Previous_Fraudulent_Transactions"));
        attributes.add(new Attribute("Account_Age"));
        attributes.add(new Attribute("Number_of_Transactions_Last_24H"));
        attributes.add(new Attribute("Payment_Method", methods));
        attributes.add(new Attribute("Fraudulent", labelValues));

        Instances header = new Instances("FinancialFraudDataset", attributes, 0);
        header.setClassIndex(attributes.size() - 1);

        // Read all rows into raw memory
        List<RawRowB> allRows = new ArrayList<>();
        List<RawRowB> fraudRows = new ArrayList<>();
        List<RawRowB> legitRows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(csvFile))) {
            String headerLine = reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] p = line.split(",", -1);
                RawRowB row = new RawRowB();
                // 0: Transaction_ID, 1: User_ID (both ignored)
                String amtStr = p[2].replace("\"", "").trim();
                row.amount = amtStr.isEmpty() ? null : Double.parseDouble(amtStr);
                String typeStr = p[3].replace("\"", "").trim();
                row.type = typeStr.isEmpty() ? "UNKNOWN" : typeStr;
                String timeStr = p[4].replace("\"", "").trim();
                row.time = timeStr.isEmpty() ? null : Double.parseDouble(timeStr);
                String devStr = p[5].replace("\"", "").trim();
                row.device = devStr.isEmpty() ? "UNKNOWN" : devStr;
                String locStr = p[6].replace("\"", "").trim();
                row.location = locStr.isEmpty() ? "UNKNOWN" : locStr;
                String prevStr = p[7].replace("\"", "").trim();
                row.prevFraud = prevStr.isEmpty() ? 0.0 : Double.parseDouble(prevStr);
                String ageStr = p[8].replace("\"", "").trim();
                row.accountAge = ageStr.isEmpty() ? 0.0 : Double.parseDouble(ageStr);
                String txnsStr = p[9].replace("\"", "").trim();
                row.txns24h = txnsStr.isEmpty() ? 0.0 : Double.parseDouble(txnsStr);
                String payStr = p[10].replace("\"", "").trim();
                row.paymentMethod = payStr.isEmpty() ? "UNKNOWN" : payStr;
                row.isFraud = "1".equals(p[11].replace("\"", "").trim());

                allRows.add(row);
                if (row.isFraud) {
                    fraudRows.add(row);
                } else {
                    legitRows.add(row);
                }
            }
        }

        // Stratified 80/20 train/test split with seed 42
        Random rng = new Random(42);
        Collections.shuffle(fraudRows, rng);
        Collections.shuffle(legitRows, rng);

        int fraudTrainCount = (int) (fraudRows.size() * 0.80); // 2008
        int legitTrainCount = (int) (legitRows.size() * 0.80); // 38792

        List<RawRowB> trainPartition = new ArrayList<>();
        trainPartition.addAll(fraudRows.subList(0, fraudTrainCount));
        trainPartition.addAll(legitRows.subList(0, legitTrainCount));
        Collections.shuffle(trainPartition, rng);

        List<RawRowB> testSet = new ArrayList<>();
        testSet.addAll(fraudRows.subList(fraudTrainCount, fraudRows.size()));
        testSet.addAll(legitRows.subList(legitTrainCount, legitRows.size()));
        Collections.shuffle(testSet, rng);

        // From trainPartition (40,800), carve 20% validation slice (8,160)
        int valFraudTarget = (int) (fraudTrainCount * 0.20);
        int valLegitTarget = (int) (legitTrainCount * 0.20);

        List<RawRowB> valSlice = new ArrayList<>();
        List<RawRowB> trainSlice = new ArrayList<>();

        int vf = 0, vl = 0;
        for (RawRowB r : trainPartition) {
            if (r.isFraud) {
                if (vf < valFraudTarget) { valSlice.add(r); vf++; }
                else { trainSlice.add(r); }
            } else {
                if (vl < valLegitTarget) { valSlice.add(r); vl++; }
                else { trainSlice.add(r); }
            }
        }

        System.out.printf("Model B Stratified Splits:%n  Train Slice: %,d rows (%d fraud, %.2f%%)%n  Val Slice:   %,d rows (%d fraud, %.2f%%)%n  Test Set:    %,d rows (%d fraud, %.2f%%)%n",
                trainSlice.size(), (fraudTrainCount - valFraudTarget), (fraudTrainCount - valFraudTarget) * 100.0 / trainSlice.size(),
                valSlice.size(), valFraudTarget, valFraudTarget * 100.0 / valSlice.size(),
                testSet.size(), fraudRows.size() - fraudTrainCount, (fraudRows.size() - fraudTrainCount) * 100.0 / testSet.size());

        // Compute median imputations on TRAIN SLICE ONLY (no data leakage)
        List<Double> trainAmounts = new ArrayList<>();
        List<Double> trainTimes = new ArrayList<>();
        for (RawRowB r : trainSlice) {
            if (r.amount != null) trainAmounts.add(r.amount);
            if (r.time != null) trainTimes.add(r.time);
        }
        Collections.sort(trainAmounts);
        Collections.sort(trainTimes);
        double medianAmount = trainAmounts.get(trainAmounts.size() / 2);
        double medianTime = trainTimes.get(trainTimes.size() / 2);
        System.out.printf("Train Imputations: Median Amount = $%.2f, Median Time = %.1fh%n", medianAmount, medianTime);

        // Undersample majority class on TRAIN SLICE ONLY (1:4 ratio)
        int sliceFrauds = fraudTrainCount - valFraudTarget;
        int targetLegit = sliceFrauds * 4; // 1:4 ratio
        List<RawRowB> balancedTrain = new ArrayList<>();
        int addedLegit = 0;
        for (RawRowB r : trainSlice) {
            if (r.isFraud) {
                balancedTrain.add(r);
            } else if (addedLegit < targetLegit) {
                balancedTrain.add(r);
                addedLegit++;
            }
        }
        Collections.shuffle(balancedTrain, rng);

        // Build Instances
        Instances trainInstances = buildInstancesB(header, balancedTrain, medianAmount, medianTime);
        Instances valInstances = buildInstancesB(header, valSlice, medianAmount, medianTime);
        Instances testInstances = buildInstancesB(header, testSet, medianAmount, medianTime);

        System.out.printf("Model B Balanced Train instances: %,d (Frauds: %,d, Legit: %,d)%n",
                trainInstances.numInstances(), sliceFrauds, addedLegit);

        // Train models
        System.out.println("\nTraining Main Model: RandomForest (50 trees, maxDepth 15)...");
        RandomForest rf = new RandomForest();
        rf.setNumIterations(50);
        rf.setMaxDepth(15);
        rf.setSeed(42);
        rf.buildClassifier(trainInstances);

        System.out.println("Training Baseline 1: J48 Decision Tree...");
        J48 j48 = new J48();
        j48.setConfidenceFactor(0.25f);
        j48.setMinNumObj(5);
        j48.buildClassifier(trainInstances);

        System.out.println("Training Baseline 2: Logistic Regression...");
        Logistic logReg = new Logistic();
        logReg.setMaxIts(50);
        logReg.buildClassifier(trainInstances);

        // Tune threshold on validation slice
        System.out.println("Tuning Decision Threshold on Validation Slice (maximizing F1)...");
        ThresholdCalibration calib = tuneThreshold(rf, valInstances, 1);
        System.out.printf("Optimal Validation Threshold: %.2f (Validation F1: %.4f, Precision: %.4f, Recall: %.4f)%n",
                calib.optimalThreshold, calib.bestF1, calib.precisionAtOptimal, calib.recallAtOptimal);

        // Evaluate all on untouched Test set
        System.out.println("\nEvaluating all models on UNTOUCHED Test Set...");
        ModelEvaluationResult rfTest = evaluateCustomThreshold(rf, testInstances, 1, calib.optimalThreshold, "RandomForest (Main)");
        ModelEvaluationResult j48Test = evaluateStandard(j48, testInstances, 1, "J48 Decision Tree (Baseline)");
        ModelEvaluationResult logTest = evaluateStandard(logReg, testInstances, 1, "Logistic Regression (Baseline)");
        long testFraudCount = fraudRows.size() - fraudTrainCount;
        ModelEvaluationResult trivialTest = ModelEvaluationResult.trivialAlwaysLegit(testInstances.numInstances(), testFraudCount);

        Map<String, Double> importances = computeInfoGain(trainInstances);

        return new PipelineResult("Model B (Fraud Detection Dataset.csv)", header, rf, j48, logReg, calib,
                rfTest, j48Test, logTest, trivialTest, importances, profile);
    }

    private static Instances buildInstancesB(Instances header, List<RawRowB> rows, double medianAmount, double medianTime) {
        Instances data = new Instances(header, rows.size());
        for (RawRowB r : rows) {
            DenseInstance inst = new DenseInstance(header.numAttributes());
            inst.setDataset(data);
            inst.setValue(0, r.amount != null ? r.amount : medianAmount);
            inst.setValue(1, safeNominal(header.attribute(1), r.type));
            inst.setValue(2, r.time != null ? r.time : medianTime);
            inst.setValue(3, safeNominal(header.attribute(3), r.device));
            inst.setValue(4, safeNominal(header.attribute(4), r.location));
            inst.setValue(5, r.prevFraud);
            inst.setValue(6, r.accountAge);
            inst.setValue(7, r.txns24h);
            inst.setValue(8, safeNominal(header.attribute(8), r.paymentMethod));
            inst.setValue(9, r.isFraud ? "FRAUD" : "LEGIT");
            data.add(inst);
        }
        return data;
    }

    private static class RawRowB {
        Double amount;
        String type;
        Double time;
        String device;
        String location;
        double prevFraud;
        double accountAge;
        double txns24h;
        String paymentMethod;
        boolean isFraud;
    }

    private static String safeNominal(Attribute attr, String val) {
        if (val == null) return attr.value(attr.numValues() - 1);
        for (int i = 0; i < attr.numValues(); i++) {
            if (attr.value(i).equalsIgnoreCase(val.trim())) return attr.value(i);
        }
        return attr.value(attr.numValues() - 1); // fallback to UNKNOWN
    }

    // =========================================================================
    // THRESHOLD CALIBRATION & EVALUATION
    // =========================================================================
    private static ThresholdCalibration tuneThreshold(Classifier classifier, Instances valSet, int fraudIndex) throws Exception {
        double bestThreshold = 0.50;
        double bestF1 = -1.0;
        double precAtBest = 0.0;
        double recAtBest = 0.0;

        List<ThresholdPoint> points = new ArrayList<>();

        for (double t = 0.05; t <= 0.95; t += 0.05) {
            long tp = 0, fp = 0, fn = 0, tn = 0;
            for (int i = 0; i < valSet.numInstances(); i++) {
                double[] dist = classifier.distributionForInstance(valSet.instance(i));
                double pFraud = dist[fraudIndex];
                boolean actualFraud = (int) valSet.instance(i).classValue() == fraudIndex;
                boolean predFraud = pFraud >= t;

                if (predFraud && actualFraud) tp++;
                else if (predFraud && !actualFraud) fp++;
                else if (!predFraud && actualFraud) fn++;
                else tn++;
            }

            double prec = (tp + fp > 0) ? ((double) tp / (tp + fp)) : 0.0;
            double rec = (tp + fn > 0) ? ((double) tp / (tp + fn)) : 0.0;
            double f1 = (prec + rec > 0) ? (2.0 * prec * rec / (prec + rec)) : 0.0;

            points.add(new ThresholdPoint(round2(t), round4(prec), round4(rec), round4(f1)));

            if (f1 > bestF1) {
                bestF1 = f1;
                bestThreshold = t;
                precAtBest = prec;
                recAtBest = rec;
            }
        }

        ThresholdCalibration result = new ThresholdCalibration();
        result.optimalThreshold = round2(bestThreshold);
        result.bestF1 = round4(bestF1);
        result.precisionAtOptimal = round4(precAtBest);
        result.recallAtOptimal = round4(recAtBest);
        result.sweepPoints = points;
        return result;
    }

    private static ModelEvaluationResult evaluateCustomThreshold(Classifier classifier, Instances testSet,
                                                                 int fraudIndex, double threshold, String name) throws Exception {
        long tp = 0, fp = 0, fn = 0, tn = 0;
        Evaluation eval = new Evaluation(testSet);

        for (int i = 0; i < testSet.numInstances(); i++) {
            double[] dist = classifier.distributionForInstance(testSet.instance(i));
            double pFraud = dist[fraudIndex];
            boolean actualFraud = (int) testSet.instance(i).classValue() == fraudIndex;
            boolean predFraud = pFraud >= threshold;

            if (predFraud && actualFraud) tp++;
            else if (predFraud && !actualFraud) fp++;
            else if (!predFraud && actualFraud) fn++;
            else tn++;

            eval.evaluateModelOnceAndRecordPrediction(classifier, testSet.instance(i));
        }

        double rocAuc = eval.areaUnderROC(fraudIndex);
        double prAuc = eval.areaUnderPRC(fraudIndex);

        return new ModelEvaluationResult(name, threshold, tn, fp, fn, tp, rocAuc, prAuc);
    }

    private static ModelEvaluationResult evaluateStandard(Classifier classifier, Instances testSet, int fraudIndex, String name) throws Exception {
        Evaluation eval = new Evaluation(testSet);
        eval.evaluateModel(classifier, testSet);

        double[][] m = eval.confusionMatrix();
        // m[actual][predicted]
        long tn = (long) m[0][0];
        long fp = (long) m[0][1];
        long fn = (long) m[1][0];
        long tp = (long) m[1][1];

        double rocAuc = eval.areaUnderROC(fraudIndex);
        double prAuc = eval.areaUnderPRC(fraudIndex);

        return new ModelEvaluationResult(name, 0.50, tn, fp, fn, tp, rocAuc, prAuc);
    }

    private static Map<String, Double> computeInfoGain(Instances data) {
        Map<String, Double> map = new LinkedHashMap<>();
        try {
            InfoGainAttributeEval eval = new InfoGainAttributeEval();
            eval.buildEvaluator(data);
            List<Map.Entry<String, Double>> scores = new ArrayList<>();
            for (int i = 0; i < data.numAttributes() - 1; i++) {
                double score = eval.evaluateAttribute(i);
                scores.add(new AbstractMap.SimpleEntry<>(data.attribute(i).name(), Math.max(0.0, score)));
            }
            scores.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
            for (Map.Entry<String, Double> e : scores) {
                map.put(e.getKey(), round4(e.getValue()));
            }
        } catch (Exception e) {
            System.err.println("InfoGain computation warning: " + e.getMessage());
        }
        return map;
    }

    // =========================================================================
    // ARTIFACT SAVING & SYNC
    // =========================================================================
    private static void saveArtifacts(String targetDirStr, PipelineResult res) throws Exception {
        File dir = new File(targetDirStr);
        dir.mkdirs();

        // 1. Model binary
        File modelFile = new File(dir, "fraud.model");
        SerializationHelper.write(modelFile.getAbsolutePath(), res.mainModel);

        // 2. Dataset Header binary (for feature structure reconstruction)
        File headerFile = new File(dir, "header.bin");
        SerializationHelper.write(headerFile.getAbsolutePath(), res.header);

        // 3. Feature Schema JSON
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("datasetName", res.name);
        schema.put("numAttributes", res.header.numAttributes());
        List<Map<String, Object>> attrList = new ArrayList<>();
        for (int i = 0; i < res.header.numAttributes(); i++) {
            Attribute a = res.header.attribute(i);
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("index", i);
            info.put("name", a.name());
            info.put("type", a.isNumeric() ? "NUMERIC" : "NOMINAL");
            if (a.isNominal()) {
                List<String> vals = new ArrayList<>();
                for (int v = 0; v < a.numValues(); v++) vals.add(a.value(v));
                info.put("values", vals);
            }
            attrList.add(info);
        }
        schema.put("attributes", attrList);
        MAPPER.writeValue(new File(dir, "feature_schema.json"), schema);

        // 4. Threshold JSON
        Map<String, Object> threshMap = new LinkedHashMap<>();
        threshMap.put("optimalThreshold", res.calibration.optimalThreshold);
        threshMap.put("validationBestF1", res.calibration.bestF1);
        threshMap.put("precisionAtOptimal", res.calibration.precisionAtOptimal);
        threshMap.put("recallAtOptimal", res.calibration.recallAtOptimal);
        threshMap.put("sweep", res.calibration.sweepPoints);
        MAPPER.writeValue(new File(dir, "threshold.json"), threshMap);

        // 5. Feature Importances JSON
        MAPPER.writeValue(new File(dir, "feature_importances.json"), res.featureImportances);

        // 6. Confusion Matrix JSON & text
        Map<String, Object> cmJson = new LinkedHashMap<>();
        cmJson.put("matrix", res.rfTest.getConfusionMatrixGrid());
        cmJson.put("labels", List.of("LEGIT", "FRAUD"));
        cmJson.put("trueNegatives", res.rfTest.getTrueNegatives());
        cmJson.put("falsePositives", res.rfTest.getFalsePositives());
        cmJson.put("falseNegatives", res.rfTest.getFalseNegatives());
        cmJson.put("truePositives", res.rfTest.getTruePositives());
        MAPPER.writeValue(new File(dir, "confusion_matrix.json"), cmJson);

        try (PrintWriter pw = new PrintWriter(new FileWriter(new File(dir, "confusion_matrix.txt")))) {
            pw.println("=== TEST SET CONFUSION MATRIX: " + res.name + " ===");
            pw.println(res.rfTest.toConfusionMatrixString());
        }

        // 7. Metrics JSON (full metrics representation compatible with frontend & API)
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("modelType", "RandomForest (50 trees, maxDepth 15)");
        metrics.put("algorithm", "RandomForest (50 trees, maxDepth 15)");
        metrics.put("trainedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        metrics.put("datasetRows", res.profile.getTotalRows());
        metrics.put("decisionThreshold", res.calibration.optimalThreshold);

        metrics.put("accuracy", round4(res.rfTest.getAccuracy()));
        metrics.put("precision", round4(res.rfTest.getPrecision()));
        metrics.put("recall", round4(res.rfTest.getRecall()));
        metrics.put("f1", round4(res.rfTest.getF1()));
        metrics.put("f1Score", round4(res.rfTest.getF1()));
        metrics.put("rocAuc", round4(res.rfTest.getRocAuc()));
        metrics.put("prAuc", round4(res.rfTest.getPrAuc()));
        metrics.put("confusionMatrix", res.rfTest.getConfusionMatrixGrid());
        metrics.put("confusionMatrixText", res.rfTest.toConfusionMatrixString());

        // Baseline J48
        metrics.put("baselineAlgorithm", "J48 Decision Tree");
        metrics.put("baselineJ48Accuracy", round4(res.j48Test.getAccuracy()));
        metrics.put("baselineJ48Precision", round4(res.j48Test.getPrecision()));
        metrics.put("baselineJ48Recall", round4(res.j48Test.getRecall()));
        metrics.put("baselineJ48F1", round4(res.j48Test.getF1()));
        metrics.put("baselineJ48RocAuc", round4(res.j48Test.getRocAuc()));

        // Baseline Logistic
        metrics.put("logisticAlgorithm", "Logistic Regression");
        metrics.put("baselineLogisticAccuracy", round4(res.logTest.getAccuracy()));
        metrics.put("baselineLogisticPrecision", round4(res.logTest.getPrecision()));
        metrics.put("baselineLogisticRecall", round4(res.logTest.getRecall()));
        metrics.put("baselineLogisticF1", round4(res.logTest.getF1()));
        metrics.put("baselineLogisticRocAuc", round4(res.logTest.getRocAuc()));

        // Trivial baseline
        metrics.put("trivialAccuracy", round4(res.trivialTest.getAccuracy()));
        metrics.put("trivialPrecision", 0.0);
        metrics.put("trivialRecall", 0.0);
        metrics.put("trivialF1", 0.0);

        metrics.put("thresholdSweep", res.calibration.sweepPoints);
        metrics.put("featureImportances", res.featureImportances);

        MAPPER.writeValue(new File(dir, "metrics.json"), metrics);

        System.out.println("Artifacts successfully written to " + dir.getAbsolutePath());
    }

    private static void saveActiveModel(String sourceVersionDir) throws Exception {
        File src = new File(sourceVersionDir);
        File rootModels = new File("models");
        rootModels.mkdirs();

        // Copy active artifacts to models/ for direct app pickup
        Files.copy(new File(src, "fraud.model").toPath(), new File(rootModels, "fraud.model").toPath(), StandardCopyOption.REPLACE_EXISTING);
        Files.copy(new File(src, "header.bin").toPath(), new File(rootModels, "header.bin").toPath(), StandardCopyOption.REPLACE_EXISTING);
        Files.copy(new File(src, "metrics.json").toPath(), new File(rootModels, "metrics.json").toPath(), StandardCopyOption.REPLACE_EXISTING);
        Files.copy(new File(src, "threshold.json").toPath(), new File(rootModels, "threshold.json").toPath(), StandardCopyOption.REPLACE_EXISTING);
        Files.copy(new File(src, "feature_schema.json").toPath(), new File(rootModels, "feature_schema.json").toPath(), StandardCopyOption.REPLACE_EXISTING);

        // Keep a copy in models/latest/ as well
        File latestDir = new File("models/latest");
        latestDir.mkdirs();
        for (File f : Objects.requireNonNull(src.listFiles())) {
            Files.copy(f.toPath(), new File(latestDir, f.getName()).toPath(), StandardCopyOption.REPLACE_EXISTING);
        }
        System.out.println("Active model set from " + sourceVersionDir + " -> models/ and models/latest/\n");
    }

    private static void printFinalSummary(PipelineResult a, PipelineResult b) {
        System.out.println("==========================================================================================================");
        System.out.println("                         FINAL TEST SET EVALUATION BENCHMARK SUMMARY");
        System.out.println("==========================================================================================================");
        System.out.printf("%-35s | %-12s | %-10s | %-10s | %-10s | %-10s | %-10s%n",
                "Model & Dataset", "Threshold", "Precision", "Recall", "F1-Score", "ROC-AUC", "PR-AUC");
        System.out.println("----------------------------------------------------------------------------------------------------------");

        // Model A
        printRow("Model A: RandomForest (creditcard)", String.format("%.2f", a.calibration.optimalThreshold), a.rfTest);
        printRow("Model A: J48 Decision Tree", "0.50", a.j48Test);
        printRow("Model A: Logistic Regression", "0.50", a.logTest);
        printRow("Model A: Trivial 'Always Legit'", "N/A", a.trivialTest);
        System.out.println("----------------------------------------------------------------------------------------------------------");

        // Model B
        printRow("Model B: RandomForest (Fraud Dataset)", String.format("%.2f", b.calibration.optimalThreshold), b.rfTest);
        printRow("Model B: J48 Decision Tree", "0.50", b.j48Test);
        printRow("Model B: Logistic Regression", "0.50", b.logTest);
        printRow("Model B: Trivial 'Always Legit'", "N/A", b.trivialTest);
        System.out.println("==========================================================================================================\n");
    }

    private static void printRow(String name, String thresholdStr, ModelEvaluationResult r) {
        System.out.printf("%-35s | %-12s | %9.2f%% | %9.2f%% | %10.4f | %10.4f | %10.4f%n",
                name, thresholdStr, r.getPrecision() * 100.0, r.getRecall() * 100.0, r.getF1(), r.getRocAuc(), r.getPrAuc());
    }

    public static class PipelineResult {
        String name;
        Instances header;
        Classifier mainModel;
        Classifier j48Model;
        Classifier logModel;
        ThresholdCalibration calibration;
        ModelEvaluationResult rfTest;
        ModelEvaluationResult j48Test;
        ModelEvaluationResult logTest;
        ModelEvaluationResult trivialTest;
        Map<String, Double> featureImportances;
        DatasetProfile profile;

        PipelineResult(String name, Instances header, Classifier mainModel, Classifier j48Model, Classifier logModel,
                       ThresholdCalibration calibration, ModelEvaluationResult rfTest, ModelEvaluationResult j48Test,
                       ModelEvaluationResult logTest, ModelEvaluationResult trivialTest,
                       Map<String, Double> featureImportances, DatasetProfile profile) {
            this.name = name;
            this.header = header;
            this.mainModel = mainModel;
            this.j48Model = j48Model;
            this.logModel = logModel;
            this.calibration = calibration;
            this.rfTest = rfTest;
            this.j48Test = j48Test;
            this.logTest = logTest;
            this.trivialTest = trivialTest;
            this.featureImportances = featureImportances;
            this.profile = profile;
        }
    }

    public static class ThresholdCalibration {
        public double optimalThreshold;
        public double bestF1;
        public double precisionAtOptimal;
        public double recallAtOptimal;
        public List<ThresholdPoint> sweepPoints;
    }

    public static class ThresholdPoint {
        public double threshold;
        public double precision;
        public double recall;
        public double f1Score;

        public ThresholdPoint() {}
        public ThresholdPoint(double threshold, double precision, double recall, double f1Score) {
            this.threshold = threshold;
            this.precision = precision;
            this.recall = recall;
            this.f1Score = f1Score;
        }
    }

    private static double round4(double v) {
        if (Double.isNaN(v) || Double.isInfinite(v)) return 0.0;
        return Math.round(v * 10000.0) / 10000.0;
    }

    private static double round2(double v) {
        if (Double.isNaN(v) || Double.isInfinite(v)) return 0.0;
        return Math.round(v * 100.0) / 100.0;
    }
}
