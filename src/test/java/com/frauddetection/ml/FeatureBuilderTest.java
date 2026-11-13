package com.frauddetection.ml;

import com.frauddetection.dto.TransactionRequest;
import org.junit.jupiter.api.Test;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FeatureBuilderTest {

    @Test
    void testDynamicSchemaMappingModelB() {
        // Setup schema B
        ArrayList<Attribute> attrs = new ArrayList<>();
        attrs.add(new Attribute("Transaction_Amount"));
        attrs.add(new Attribute("Transaction_Type", List.of("ATM Withdrawal", "Bill Payment", "UNKNOWN")));
        attrs.add(new Attribute("Time_of_Transaction"));
        attrs.add(new Attribute("Device_Used", List.of("Mobile", "Tablet", "UNKNOWN")));
        attrs.add(new Attribute("Location", List.of("New York", "San Francisco", "UNKNOWN")));
        attrs.add(new Attribute("Previous_Fraudulent_Transactions"));
        attrs.add(new Attribute("Account_Age"));
        attrs.add(new Attribute("Number_of_Transactions_Last_24H"));
        attrs.add(new Attribute("Payment_Method", List.of("Credit Card", "Debit Card", "UNKNOWN")));
        attrs.add(new Attribute("Fraudulent", List.of("LEGIT", "FRAUD")));

        Instances dataset = new Instances("TestSchemaB", attrs, 0);
        dataset.setClassIndex(attrs.size() - 1);

        TransactionRequest req = new TransactionRequest();
        req.setAmount(1250.50);
        req.setMerchantCategory("ATM Withdrawal");
        req.setHourOfDay(14);
        req.setDeviceType("Mobile");
        req.setLocation("New York");
        req.setPreviousFraudulentTransactions(2.0);
        req.setAccountAge(45.0);
        req.setTxnCountLast24h(5);
        req.setPaymentMethod("Credit Card");

        DenseInstance inst = new DenseInstance(attrs.size());
        inst.setDataset(dataset);
        inst.setValue(0, req.getAmount());
        inst.setValue(1, req.getMerchantCategory());
        inst.setValue(2, req.getHourOfDay());
        inst.setValue(3, req.getDeviceType());
        inst.setValue(4, req.getLocation());
        inst.setValue(5, req.getPreviousFraudulentTransactions());
        inst.setValue(6, req.getAccountAge());
        inst.setValue(7, req.getTxnCountLast24h());
        inst.setValue(8, req.getPaymentMethod());
        inst.setMissing(9);

        assertEquals(1250.50, inst.value(0));
        assertEquals("ATM Withdrawal", inst.stringValue(1));
        assertEquals(14.0, inst.value(2));
        assertEquals("Mobile", inst.stringValue(3));
        assertEquals("New York", inst.stringValue(4));
        assertEquals(2.0, inst.value(5));
        assertEquals(45.0, inst.value(6));
        assertEquals(5.0, inst.value(7));
        assertEquals("Credit Card", inst.stringValue(8));
        assertTrue(inst.isMissing(9));
    }

    @Test
    void testDynamicSchemaMappingModelA() {
        ArrayList<Attribute> attrs = new ArrayList<>();
        for (int i = 1; i <= 28; i++) {
            attrs.add(new Attribute("V" + i));
        }
        attrs.add(new Attribute("Amount"));
        attrs.add(new Attribute("Class", List.of("LEGIT", "FRAUD")));

        Instances dataset = new Instances("TestSchemaA", attrs, 0);
        dataset.setClassIndex(attrs.size() - 1);

        TransactionRequest req = new TransactionRequest();
        req.setAmount(49.99);
        req.handleDynamicProperty("V1", -1.3598);
        req.handleDynamicProperty("V2", 0.0728);

        DenseInstance inst = new DenseInstance(attrs.size());
        inst.setDataset(dataset);
        inst.setValue(0, req.getPcaFeatures().getOrDefault("V1", 0.0));
        inst.setValue(1, req.getPcaFeatures().getOrDefault("V2", 0.0));
        inst.setValue(28, req.getAmount());

        assertEquals(-1.3598, inst.value(0), 0.0001);
        assertEquals(0.0728, inst.value(1), 0.0001);
        assertEquals(49.99, inst.value(28), 0.0001);
    }
}

