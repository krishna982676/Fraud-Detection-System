package com.frauddetection.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;

import java.io.File;
import java.io.PrintWriter;
import java.util.*;

@Component
public class SyntheticDataGenerator {

    private static final Logger log = LoggerFactory.getLogger(SyntheticDataGenerator.class);

    public static final List<String> MERCHANT_CATEGORIES = List.of(
            "GROCERY", "ENTERTAINMENT", "ELECTRONICS", "TRAVEL", "LUXURY", "DINING", "UTILITIES", "TRANSFER"
    );

    public static final List<String> LOCATIONS = List.of(
            "NEW_YORK", "LONDON", "TOKYO", "PARIS", "SYDNEY", "BERLIN", "MUMBAI",
            "NEW_DELHI", "BENGALURU", "HYDERABAD", "INDIA", "TORONTO", "DUBAI", "SINGAPORE"
    );

    public static final List<String> DEVICE_TYPES = List.of(
            "MOBILE", "WEB", "POS", "ATM"
    );

    public static final List<String> INTERNATIONAL_VALUES = List.of("N", "Y");
    public static final List<String> LABEL_VALUES = List.of("LEGIT", "FRAUD");

    public SyntheticDataGenerator() {}

    public ArrayList<Attribute> getAttributes() {
        return createAttributes();
    }

    private ArrayList<Attribute> createAttributes() {
        ArrayList<Attribute> attrs = new ArrayList<>();
        attrs.add(new Attribute("amount"));
        attrs.add(new Attribute("merchantCategory", MERCHANT_CATEGORIES));
        attrs.add(new Attribute("location", LOCATIONS));
        attrs.add(new Attribute("deviceType", DEVICE_TYPES));
        attrs.add(new Attribute("hourOfDay"));
        attrs.add(new Attribute("distanceFromHome"));
        attrs.add(new Attribute("txnCountLast24h"));
        attrs.add(new Attribute("isInternational", INTERNATIONAL_VALUES));
        attrs.add(new Attribute("label", LABEL_VALUES));
        return attrs;
    }

    public Instances generateDataset(int totalRows, double fraudRatio) {
        log.info("Generating {} realistic synthetic transactions (fraud ratio: {}) with overlapping noise distributions",
                totalRows, fraudRatio);
        ArrayList<Attribute> attrs = createAttributes();
        Instances dataset = new Instances("FraudDetectionTransactions", attrs, totalRows);
        dataset.setClassIndex(attrs.size() - 1);

        Random random = new Random(42);
        int targetFraudCount = (int) Math.round(totalRows * fraudRatio);
        int targetLegitCount = totalRows - targetFraudCount;

        int currentFraudCount = 0;
        int currentLegitCount = 0;

        for (int i = 0; i < totalRows; i++) {
            boolean isFraud;
            if (currentFraudCount < targetFraudCount && currentLegitCount < targetLegitCount) {
                isFraud = random.nextDouble() < fraudRatio;
            } else if (currentFraudCount < targetFraudCount) {
                isFraud = true;
            } else {
                isFraud = false;
            }

            if (isFraud) {
                currentFraudCount++;
            } else {
                currentLegitCount++;
            }

            DenseInstance inst = createSingleInstance(dataset, isFraud, random);
            dataset.add(inst);
        }

        log.info("Synthetic dataset generated: total={}, legit={}, fraud={}",
                dataset.numInstances(), currentLegitCount, currentFraudCount);
        return dataset;
    }

    private DenseInstance createSingleInstance(Instances dataset, boolean isFraud, Random random) {
        double amount;
        String merchantCategory;
        String location = LOCATIONS.get(random.nextInt(LOCATIONS.size()));
        String deviceType;
        int hourOfDay;
        double distanceFromHome;
        int txnCountLast24h;
        String isInternational;

        if (isFraud) {
            // 10-15% of fraud looks completely normal/subtle (low-value sleeper fraud)
            boolean isSubtleFraud = random.nextDouble() < 0.12;

            if (isSubtleFraud) {
                amount = Math.round((15.0 + random.nextDouble() * 120.0) * 100.0) / 100.0;
                merchantCategory = List.of("GROCERY", "DINING", "ENTERTAINMENT").get(random.nextInt(3));
                deviceType = random.nextDouble() < 0.6 ? "MOBILE" : "POS";
                hourOfDay = 8 + random.nextInt(14); // daytime
                distanceFromHome = Math.round((1.0 + random.nextDouble() * 25.0) * 10.0) / 10.0;
                txnCountLast24h = 1 + random.nextInt(4);
                isInternational = "N";
            } else {
                // Typical fraud patterns with continuous variance
                if (random.nextDouble() < 0.70) {
                    amount = Math.round((350.0 + random.nextDouble() * 3200.0) * 100.0) / 100.0;
                } else {
                    amount = Math.round((80.0 + random.nextDouble() * 450.0) * 100.0) / 100.0;
                }

                if (random.nextDouble() < 0.60) {
                    List<String> fraudCats = List.of("LUXURY", "TRANSFER", "ELECTRONICS");
                    merchantCategory = fraudCats.get(random.nextInt(fraudCats.size()));
                } else {
                    merchantCategory = MERCHANT_CATEGORIES.get(random.nextInt(MERCHANT_CATEGORIES.size()));
                }

                deviceType = random.nextDouble() < 0.50 ? "WEB" : (random.nextDouble() < 0.5 ? "ATM" : "MOBILE");

                // Elevated nocturnal probability, but with healthy daytime overlap
                if (random.nextDouble() < 0.40) {
                    hourOfDay = 1 + random.nextInt(5);
                } else {
                    hourOfDay = random.nextInt(24);
                }

                // Distance variation
                if (random.nextDouble() < 0.65) {
                    distanceFromHome = Math.round((800.0 + random.nextDouble() * 5500.0) * 10.0) / 10.0;
                } else {
                    distanceFromHome = Math.round((10.0 + random.nextDouble() * 250.0) * 10.0) / 10.0;
                }

                // Velocity variation
                if (random.nextDouble() < 0.55) {
                    txnCountLast24h = 8 + random.nextInt(20);
                } else {
                    txnCountLast24h = 2 + random.nextInt(6);
                }

                isInternational = (random.nextDouble() < 0.55) ? "Y" : "N";
            }
        } else {
            // 2-3% of legit transactions look suspicious (e.g. buying a laptop or traveling)
            boolean isSuspiciousLegit = random.nextDouble() < 0.03;

            if (isSuspiciousLegit) {
                amount = Math.round((600.0 + random.nextDouble() * 1800.0) * 100.0) / 100.0;
                merchantCategory = List.of("ELECTRONICS", "TRAVEL", "LUXURY").get(random.nextInt(3));
                deviceType = random.nextDouble() < 0.5 ? "WEB" : "POS";
                hourOfDay = random.nextInt(24);
                distanceFromHome = Math.round((300.0 + random.nextDouble() * 2200.0) * 10.0) / 10.0;
                txnCountLast24h = 4 + random.nextInt(6);
                isInternational = random.nextDouble() < 0.35 ? "Y" : "N";
            } else {
                // Typical legit transactions
                amount = Math.round((8.0 + random.nextDouble() * 140.0 + Math.pow(random.nextDouble(), 3) * 200.0) * 100.0) / 100.0;
                merchantCategory = List.of("GROCERY", "DINING", "ENTERTAINMENT", "UTILITIES").get(random.nextInt(4));
                deviceType = random.nextDouble() < 0.55 ? "MOBILE" : (random.nextDouble() < 0.6 ? "POS" : "WEB");

                // Normal daytime hours (7 AM - 11 PM) with slight nocturnal tail
                if (random.nextDouble() < 0.90) {
                    hourOfDay = 7 + random.nextInt(16);
                } else {
                    hourOfDay = random.nextInt(24);
                }

                distanceFromHome = Math.round((0.5 + random.nextDouble() * 30.0) * 10.0) / 10.0;
                txnCountLast24h = 1 + random.nextInt(4);
                isInternational = (random.nextDouble() < 0.03) ? "Y" : "N";
            }
        }

        DenseInstance inst = new DenseInstance(dataset.numAttributes());
        inst.setDataset(dataset);
        inst.setValue(dataset.attribute("amount"), amount);
        inst.setValue(dataset.attribute("merchantCategory"), merchantCategory);
        inst.setValue(dataset.attribute("location"), location);
        inst.setValue(dataset.attribute("deviceType"), deviceType);
        inst.setValue(dataset.attribute("hourOfDay"), hourOfDay);
        inst.setValue(dataset.attribute("distanceFromHome"), distanceFromHome);
        inst.setValue(dataset.attribute("txnCountLast24h"), txnCountLast24h);
        inst.setValue(dataset.attribute("isInternational"), isInternational);
        inst.setValue(dataset.attribute("label"), isFraud ? "FRAUD" : "LEGIT");

        return inst;
    }

    public void exportToCsv(Instances dataset, String filePath) {
        try (PrintWriter writer = new PrintWriter(new File(filePath))) {
            writer.println("transactionId,userId,amount,merchantCategory,location,deviceType,hourOfDay,distanceFromHome,txnCountLast24h,isInternational,label");
            Random r = new Random(101);
            for (int i = 0; i < dataset.numInstances(); i++) {
                weka.core.Instance inst = dataset.instance(i);
                String txnId = "TXN-" + (100000 + i);
                String userId = "USER-" + (1000 + r.nextInt(100));
                writer.printf("%s,%s,%.2f,%s,%s,%s,%d,%.1f,%d,%s,%s%n",
                        txnId,
                        userId,
                        inst.value(0),
                        inst.stringValue(1),
                        inst.stringValue(2),
                        inst.stringValue(3),
                        (int) inst.value(4),
                        inst.value(5),
                        (int) inst.value(6),
                        inst.stringValue(7),
                        inst.stringValue(8)
                );
            }
            log.info("Exported synthetic dataset to {}", filePath);
        } catch (Exception e) {
            log.error("Failed to export dataset to CSV: {}", e.getMessage(), e);
        }
    }
}
