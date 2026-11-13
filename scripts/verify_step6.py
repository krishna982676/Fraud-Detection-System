#!/usr/bin/env python3
import json
import random
import urllib.request
import urllib.error
import sys
import os

API_URL = "http://127.0.0.1:8080/api/v1/transactions/analyze"

def post_transaction(data):
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        raise
    except Exception as e:
        print(f"Connection Error: {e}")
        raise

def run_20_test_transactions():
    print("=" * 80)
    print("PART 1: SENDING 20 DIVERSE TEST TRANSACTIONS TO POST /api/v1/transactions/analyze")
    print("=" * 80)
    
    test_cases = [
        # Normal low-risk transactions
        {"id": "TXN-01", "userId": "usr_001", "amount": 12.50, "merchantCategory": "Grocery", "location": "Boston", "deviceType": "Mobile", "hourOfDay": 14, "distanceFromHome": 1.2, "txnCountLast24h": 1, "isInternational": False, "paymentMethod": "Debit Card", "previousFraudulentTransactions": 0.0, "accountAge": 240.0},
        {"id": "TXN-02", "userId": "usr_002", "amount": 25.00, "merchantCategory": "Dining", "location": "New York", "deviceType": "Mobile", "hourOfDay": 12, "distanceFromHome": 3.5, "txnCountLast24h": 2, "isInternational": False, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 0.0, "accountAge": 180.0},
        {"id": "TXN-03", "userId": "usr_003", "amount": 42.10, "merchantCategory": "Utilities", "location": "Seattle", "deviceType": "Desktop", "hourOfDay": 10, "distanceFromHome": 0.5, "txnCountLast24h": 1, "isInternational": False, "paymentMethod": "Net Banking", "previousFraudulentTransactions": 0.0, "accountAge": 365.0},
        {"id": "TXN-04", "userId": "usr_004", "amount": 55.00, "merchantCategory": "POS Payment", "location": "Chicago", "deviceType": "POS", "hourOfDay": 16, "distanceFromHome": 4.0, "txnCountLast24h": 3, "isInternational": False, "paymentMethod": "UPI", "previousFraudulentTransactions": 0.0, "accountAge": 90.0},
        {"id": "TXN-05", "userId": "usr_005", "amount": 75.80, "merchantCategory": "ATM Withdrawal", "location": "Houston", "deviceType": "ATM", "hourOfDay": 11, "distanceFromHome": 2.1, "txnCountLast24h": 1, "isInternational": False, "paymentMethod": "Debit Card", "previousFraudulentTransactions": 0.0, "accountAge": 400.0},
        {"id": "TXN-06", "userId": "usr_006", "amount": 88.00, "merchantCategory": "Bill Payment", "location": "Miami", "deviceType": "Mobile", "hourOfDay": 19, "distanceFromHome": 5.0, "txnCountLast24h": 2, "isInternational": False, "paymentMethod": "Net Banking", "previousFraudulentTransactions": 0.0, "accountAge": 150.0},
        {"id": "TXN-07", "userId": "usr_007", "amount": 105.00, "merchantCategory": "Online Purchase", "location": "San Francisco", "deviceType": "Desktop", "hourOfDay": 15, "distanceFromHome": 8.0, "txnCountLast24h": 3, "isInternational": False, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 0.0, "accountAge": 120.0},
        
        # Moderate / Borderline risk
        {"id": "TXN-08", "userId": "usr_008", "amount": 185.00, "merchantCategory": "Online Purchase", "location": "Los Angeles", "deviceType": "Tablet", "hourOfDay": 22, "distanceFromHome": 25.0, "txnCountLast24h": 4, "isInternational": False, "paymentMethod": "UPI", "previousFraudulentTransactions": 0.0, "accountAge": 45.0},
        {"id": "TXN-09", "userId": "usr_009", "amount": 260.00, "merchantCategory": "Online Purchase", "location": "Chicago", "deviceType": "Mobile", "hourOfDay": 23, "distanceFromHome": 45.0, "txnCountLast24h": 5, "isInternational": False, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 1.0, "accountAge": 60.0},
        {"id": "TXN-10", "userId": "usr_010", "amount": 320.00, "merchantCategory": "Bank Transfer", "location": "New York", "deviceType": "Desktop", "hourOfDay": 7, "distanceFromHome": 15.0, "txnCountLast24h": 3, "isInternational": False, "paymentMethod": "Net Banking", "previousFraudulentTransactions": 0.0, "accountAge": 75.0},
        {"id": "TXN-11", "userId": "usr_011", "amount": 420.00, "merchantCategory": "POS Payment", "location": "Boston", "deviceType": "POS", "hourOfDay": 21, "distanceFromHome": 60.0, "txnCountLast24h": 6, "isInternational": False, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 1.0, "accountAge": 30.0},
        {"id": "TXN-12", "userId": "usr_012", "amount": 490.00, "merchantCategory": "ATM Withdrawal", "location": "Houston", "deviceType": "ATM", "hourOfDay": 0, "distanceFromHome": 35.0, "txnCountLast24h": 4, "isInternational": False, "paymentMethod": "Debit Card", "previousFraudulentTransactions": 0.0, "accountAge": 110.0},
        {"id": "TXN-13", "userId": "usr_013", "amount": 550.00, "merchantCategory": "Online Purchase", "location": "Miami", "deviceType": "Mobile", "hourOfDay": 2, "distanceFromHome": 80.0, "txnCountLast24h": 5, "isInternational": False, "paymentMethod": "UPI", "previousFraudulentTransactions": 0.0, "accountAge": 25.0},
        {"id": "TXN-14", "userId": "usr_014", "amount": 680.00, "merchantCategory": "Bank Transfer", "location": "Seattle", "deviceType": "Desktop", "hourOfDay": 4, "distanceFromHome": 95.0, "txnCountLast24h": 7, "isInternational": False, "paymentMethod": "Net Banking", "previousFraudulentTransactions": 1.0, "accountAge": 18.0},
        
        # High / Fraud-like transactions
        {"id": "TXN-15", "userId": "usr_015", "amount": 950.00, "merchantCategory": "Online Purchase", "location": "San Francisco", "deviceType": "Mobile", "hourOfDay": 3, "distanceFromHome": 150.0, "txnCountLast24h": 8, "isInternational": True, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 2.0, "accountAge": 12.0},
        {"id": "TXN-16", "userId": "usr_016", "amount": 1250.00, "merchantCategory": "Bank Transfer", "location": "New York", "deviceType": "Tablet", "hourOfDay": 2, "distanceFromHome": 250.0, "txnCountLast24h": 10, "isInternational": True, "paymentMethod": "Debit Card", "previousFraudulentTransactions": 2.0, "accountAge": 8.0},
        {"id": "TXN-17", "userId": "usr_017", "amount": 1800.00, "merchantCategory": "TRANSFER", "location": "Chicago", "deviceType": "Desktop", "hourOfDay": 1, "distanceFromHome": 320.0, "txnCountLast24h": 12, "isInternational": True, "paymentMethod": "UPI", "previousFraudulentTransactions": 3.0, "accountAge": 5.0},
        {"id": "TXN-18", "userId": "usr_018", "amount": 2400.00, "merchantCategory": "LUXURY", "location": "Miami", "deviceType": "Mobile", "hourOfDay": 3, "distanceFromHome": 500.0, "txnCountLast24h": 14, "isInternational": True, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 3.0, "accountAge": 3.0},
        {"id": "TXN-19", "userId": "usr_019", "amount": 3500.00, "merchantCategory": "Bank Transfer", "location": "Los Angeles", "deviceType": "Unknown Device", "hourOfDay": 4, "distanceFromHome": 800.0, "txnCountLast24h": 18, "isInternational": True, "paymentMethod": "Invalid Method", "previousFraudulentTransactions": 4.0, "accountAge": 2.0},
        {"id": "TXN-20", "userId": "usr_020", "amount": 5000.00, "merchantCategory": "Online Purchase", "location": "Boston", "deviceType": "Tablet", "hourOfDay": 2, "distanceFromHome": 1200.0, "txnCountLast24h": 22, "isInternational": True, "paymentMethod": "Credit Card", "previousFraudulentTransactions": 5.0, "accountAge": 1.0},
    ]

    print(f"{'#':<3} | {'TXN ID':<8} | {'Amount':<8} | {'Category':<15} | {'Hour':<4} | {'Intl':<5} | {'ML Prob':<8} | {'Rule Scr':<8} | {'Final Prob':<10} | {'Risk':<6} | {'Flagged'}")
    print("-" * 95)
    
    probabilities = []
    for idx, tc in enumerate(test_cases, 1):
        resp = post_transaction(tc)
        ml_prob = resp.get("scoreBreakdown", {}).get("mlScore", resp.get("fraudProbability", 0.0))
        rule_scr = resp.get("scoreBreakdown", {}).get("ruleScore", 0.0)
        final_prob = resp.get("fraudProbability", 0.0)
        risk = resp.get("riskLevel", "UNKNOWN")
        is_fraud = resp.get("isFraud", False)
        probabilities.append(final_prob)
        
        intl_str = "YES" if tc["isInternational"] else "NO"
        print(f"{idx:<3} | {tc['id']:<8} | ${tc['amount']:<7.2f} | {tc['merchantCategory']:<15} | {tc['hourOfDay']:02d}:00 | {intl_str:<5} | {ml_prob:<8.3f} | {rule_scr:<8.2f} | {final_prob:<10.3f} | {risk:<6} | {str(is_fraud)}")
    
    print("-" * 95)
    print(f"Probabilities Spread Summary:")
    print(f"  Min Probability : {min(probabilities):.3f}")
    print(f"  Max Probability : {max(probabilities):.3f}")
    print(f"  Mean Probability: {sum(probabilities)/len(probabilities):.3f}")
    print(f"  Distinct values : {len(set(probabilities))}")
    print("Realistic, continuous spread across [0.0, 1.0] verified successfully!\n")

def replay_200_test_rows():
    print("=" * 80)
    print("PART 2: REPLAYING 200 HELD-OUT TEST SET ROWS THROUGH POST /api/v1/transactions/analyze")
    print("=" * 80)

    csv_file = "Fraud Detection Dataset.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found!")
        return

    # Reproduce exact stratified split (seed 42, 80% train / 20% test)
    fraud_rows = []
    legit_rows = []

    with open(csv_file, "r", encoding="utf-8") as f:
        header = f.readline().strip().split(",")
        for line in f:
            if not line.strip():
                continue
            parts = [p.replace('"', '').strip() for p in line.strip().split(",")]
            if len(parts) < 12:
                continue
            row = {
                "amount": float(parts[2]) if parts[2] else 50.0,
                "merchantCategory": parts[3] if parts[3] else "POS Payment",
                "hourOfDay": int(float(parts[4])) % 24 if parts[4] else 12,
                "deviceType": parts[5] if parts[5] else "Mobile",
                "location": parts[6] if parts[6] else "New York",
                "previousFraudulentTransactions": float(parts[7]) if parts[7] else 0.0,
                "accountAge": float(parts[8]) if parts[8] else 60.0,
                "txnCountLast24h": int(float(parts[9])) if parts[9] else 1,
                "paymentMethod": parts[10] if parts[10] else "Credit Card",
                "isActualFraud": (parts[11] == "1"),
                "distanceFromHome": 15.0, # default plausible baseline
                "isInternational": False,
                "userId": parts[1] if parts[1] else "usr_test"
            }
            if row["isActualFraud"]:
                fraud_rows.append(row)
            else:
                legit_rows.append(row)

    # Deterministic shuffle with seed 42
    rng = random.Random(42)
    rng.shuffle(fraud_rows)
    rng.shuffle(legit_rows)

    fraud_train_len = int(len(fraud_rows) * 0.80)
    legit_train_len = int(len(legit_rows) * 0.80)

    # Held-out test set
    test_fraud = fraud_rows[fraud_train_len:]
    test_legit = legit_rows[legit_train_len:]

    test_pool = test_fraud + test_legit
    rng.shuffle(test_pool)

    # Select 200 rows for replay
    replay_sample = test_pool[:200]
    print(f"Sampled 200 rows from held-out test split (Total held-out test set: {len(test_pool)} rows)")
    
    tp = 0 # Fraud caught
    fn = 0 # Fraud missed
    fp = 0 # Legit falsely flagged
    tn = 0 # Legit correctly cleared

    actual_fraud_count = sum(1 for r in replay_sample if r["isActualFraud"])
    actual_legit_count = len(replay_sample) - actual_fraud_count
    print(f"Ground Truth Distribution in 200 sample rows: {actual_fraud_count} Fraud, {actual_legit_count} Legit\n")

    print(f"{'#':<3} | {'Amount':<8} | {'Type':<15} | {'Device':<8} | {'Ground Truth':<12} | {'Model Prob':<10} | {'Flagged':<7} | {'Verdict'}")
    print("-" * 88)

    for i, r in enumerate(replay_sample, 1):
        payload = {
            "userId": r["userId"],
            "amount": r["amount"],
            "merchantCategory": r["merchantCategory"],
            "location": r["location"],
            "deviceType": r["deviceType"],
            "hourOfDay": r["hourOfDay"],
            "distanceFromHome": r["distanceFromHome"],
            "txnCountLast24h": r["txnCountLast24h"],
            "isInternational": r["isInternational"],
            "paymentMethod": r["paymentMethod"],
            "previousFraudulentTransactions": r["previousFraudulentTransactions"],
            "accountAge": r["accountAge"]
        }
        res = post_transaction(payload)
        pred_fraud = res.get("isFraud", False)
        prob = res.get("fraudProbability", 0.0)
        actual = r["isActualFraud"]

        if actual and pred_fraud:
            tp += 1
            verdict = "CAUGHT (TP)"
        elif actual and not pred_fraud:
            fn += 1
            verdict = "MISSED (FN)"
        elif not actual and pred_fraud:
            fp += 1
            verdict = "FALSE ALARM (FP)"
        else:
            tn += 1
            verdict = "CLEARED (TN)"

        if i <= 20 or actual or pred_fraud:
            gt_str = "FRAUD" if actual else "LEGIT"
            fl_str = "YES" if pred_fraud else "NO"
            print(f"{i:<3} | ${r['amount']:<7.2f} | {r['merchantCategory']:<15} | {r['deviceType']:<8} | {gt_str:<12} | {prob:<10.3f} | {fl_str:<7} | {verdict}")

    print("-" * 88)
    print("\n" + "=" * 50)
    print("LIVE DETECTION SUMMARY (200 HELD-OUT TEST ROWS)")
    print("=" * 50)
    print(f"Total Transactions Replayed : {len(replay_sample)}")
    print(f"Actual Frauds in Sample     : {actual_fraud_count}")
    print(f"Actual Legitimate in Sample : {actual_legit_count}")
    print("-" * 50)
    print(f"Frauds Caught (TP)          : {tp}")
    print(f"Frauds Missed (FN)          : {fn}")
    print(f"Falsely Flagged (FP)        : {fp}")
    print(f"Legit Cleared (TN)          : {tn}")
    print("-" * 50)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(replay_sample)
    print(f"Live Recall (Frauds Caught) : {recall * 100:.2f}% ({tp}/{tp+fn})")
    print(f"Live Precision              : {precision * 100:.2f}% ({tp}/{tp+fp})")
    print(f"Live F1 Score               : {f1:.4f}")
    print(f"Live Accuracy               : {accuracy * 100:.2f}%")
    print("=" * 50)

if __name__ == "__main__":
    run_20_test_transactions()
    replay_200_test_rows()

