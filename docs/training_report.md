# SentinelX Fraud Detection Engine - Model Training & Evaluation Report

**Training Execution Date:** 2026-11-02  
**Framework:** Weka Stable (3.8.6) + Spring Boot 3.2.5 (Java 17)  
**Hardware & Memory Profile:** 64-bit JVM, `-Xmx2g` Memory Ceiling  

---

## 1. Executive Summary & Headline Benchmark

The SentinelX fraud detection system was trained and evaluated on two separate production datasets, maintained as distinct operational models (`Model A` and `Model B`). In fraud detection, **accuracy is a misleading headline metric** because legitimate transactions represent over 95%–99.8% of traffic. A trivial "Always Legit" classifier achieves 99.83% accuracy while catching 0% of fraud.

Our headline evaluation prioritizes **Precision, Recall, F1-Score, and Area Under Precision-Recall Curve (PR-AUC)** on untouched, held-out test splits.

### Final Comparative Metrics Table (Untouched Test Sets)

| Dataset & Model | Split Method | Threshold | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Test Accuracy |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Model A: RandomForest (Ensemble)** | 80/20 Time Split | **0.90** | **88.68%** | **62.67%** | **0.7344** | **0.9723** | **0.7760** | **99.94%** |
| Model A: J48 Decision Tree (Baseline) | 80/20 Time Split | 0.50 | 41.55% | 78.67% | 0.5438 | 0.9031 | 0.3948 | 99.81% |
| Model A: Logistic Regression (Baseline) | 80/20 Time Split | 0.50 | 27.60% | 81.33% | 0.4122 | 0.9823 | 0.7163 | 99.64% |
| *Model A: Trivial Always-Legit (Sanity Check)* | *No Learning* | *N/A* | *0.00%* | *0.00%* | *0.0000* | *0.5000* | *0.0013* | *99.87%* |
| **Model B: RandomForest (Ensemble)** | Stratified 80/20 | **0.20** | **5.19%** | **51.20%** | **0.0943** | **0.5234** | **0.0767** | **51.60%** |
| Model B: J48 Decision Tree (Baseline) | Stratified 80/20 | 0.50 | 0.00% | 0.00% | 0.0000 | 0.5000 | 0.0492 | 95.08% |
| Model B: Logistic Regression (Baseline) | Stratified 80/20 | 0.50 | 0.00% | 0.00% | 0.0000 | 0.5022 | 0.0522 | 95.08% |
| *Model B: Trivial Always-Legit (Sanity Check)* | *No Learning* | *N/A* | *0.00%* | *0.00%* | *0.0000* | *0.5000* | *0.0492* | *95.08%* |

---

## 2. Dataset Profiles & Schema Rules

The two datasets have distinct origins, schemas, and properties. They are strictly segregated into independent model pipelines and never concatenated.

### Dataset A: `creditcard.csv` (Kaggle Benchmark)
- **Source:** Kaggle European cardholder transactions (September 2013).
- **Total Row Count:** 284,807 rows
- **Legitimate Count:** 284,315 (99.8273%)
- **Fraud Count:** 492 (0.1727% base fraud rate)
- **Duplicate Rows:** 1,081
- **Missing Values:** 0 missing values across all 31 columns.
- **Features Used (29):** PCA components `V1` through `V28` + transaction `Amount`.
- **Chronological Ordering:** `Time` indicates seconds elapsed from the first transaction in the dataset.
- **Identifier Removal & Leakage Check:** No user IDs or account numbers present. Zero label leakage detected; feature distributions are PCA transformed.

### Dataset B: `Fraud Detection Dataset.csv`
- **Total Row Count:** 51,000 rows
- **Legitimate Count:** 48,490 (95.0784%)
- **Fraud Count:** 2,510 (4.9216% base fraud rate)
- **Duplicate Rows:** 881
- **Removed Identifiers:** `Transaction_ID`, `User_ID` were strictly stripped before feature construction to eliminate memorization and leakage.
- **Missing Values Identified & Imputed:**
  - `Transaction_Amount`: 2,520 missing (4.94%) -> Imputed with training median ($2,521.36)
  - `Time_of_Transaction`: 2,552 missing (5.00%) -> Imputed with training median (12.0h)
  - `Device_Used`: 2,473 missing (4.85%) -> Imputed with `"UNKNOWN"`
  - `Location`: 2,547 missing (4.99%) -> Imputed with `"UNKNOWN"`
  - `Payment_Method`: 2,469 missing (4.84%) -> Imputed with `"UNKNOWN"`
  - `Previous_Fraudulent_Transactions`, `Account_Age`, `Number_of_Transactions_Last_24H`: 0 missing.
- **Label Leakage Check:**
  Cross-tabulation confirmed `Previous_Fraudulent_Transactions` (values 0–4) is equally distributed (~4.9% fraud in all buckets). No single feature acts as a proxy for the label.

---

## 3. Train / Validation / Test Splitting Protocol (Zero Leakage)

To guarantee real-world generalization, train, validation, and test splits were prepared with strict prevention of future information leaking into the past:

### Model A Split Protocol
1. **Time-Based Chronological Partitioning:**
   - The dataset was ordered chronologically by `Time`.
   - **First 80%** (227,845 rows): Reserved for training & validation.
   - **Last 20%** (56,962 rows): Untouched Test Set (75 actual frauds).
2. **Validation Slice Carving:**
   - From the end of the 80% train partition, the final 20% (45,569 rows, 52 frauds) was carved out as the validation set.
   - The first 182,276 rows (365 frauds) served as the raw training slice.
3. **Class Imbalance Handling on Training Slice Only:**
   - Majority legitimate transactions were undersampled at a 1:10 ratio (all 365 frauds retained, 3,707 legitimate samples selected).
   - Total balanced training instances: 4,072.
   - **Crucial:** The validation slice (45,569 rows) and test set (56,962 rows) maintained their natural, untouched class distributions (0.11% and 0.13% fraud).

### Model B Split Protocol
1. **Stratified Split:**
   - Because `Time_of_Transaction` in Model B represents a cyclical hour-of-day (0–23) rather than an absolute timestamp, a stratified 80/20 split was performed using a fixed seed (`seed = 42`).
   - **Train Partition (80%):** 40,800 rows (2,008 fraud, 38,792 legit)
   - **Test Set (20%):** 10,200 rows (502 fraud, 9,698 legit)
2. **Validation Slice:**
   - A 20% stratified slice was carved from the training partition:
     - Train slice: 32,641 rows (1,607 fraud, 31,034 legit)
     - Validation slice: 8,159 rows (401 fraud, 7,758 legit)
3. **Imbalance & Imputation:**
   - Medians and mode values were fitted exclusively on the 32,641 train slice.
   - Majority class was undersampled to a 1:4 ratio (1,607 fraud, 6,428 legit = 8,035 total train instances).
   - Validation slice and test set retained their real ~4.92% fraud distribution.

---

## 4. Hyperparameter Calibration & Threshold Sweeps

Weka models evaluated:
- **RandomForest (Main):** 50 trees, max depth 15, seed 42.
- **J48 Decision Tree (Baseline):** Pruned tree, confidence factor 0.25, min objects per leaf = 5.
- **Logistic Regression (Baseline):** Ridge penalized logistic regression, max iterations = 50.

### Threshold Tuning on Validation Slices:
Decision thresholds were swept from 0.05 to 0.95 in 0.05 increments on the validation set to maximize F1-score:

#### Model A Threshold Sweep (Validation Slice):
- **Selected Threshold:** `0.90`
- **Validation F1:** 0.7294 | **Precision:** 93.94% | **Recall:** 59.62%
- Calibrated to prioritize high confidence alerts, eliminating costly analyst triage on false positives.

#### Model B Threshold Sweep (Validation Slice):
- **Selected Threshold:** `0.20`
- **Validation F1:** 0.0957 | **Precision:** 5.28% | **Recall:** 50.87%

---

## 5. Untouched Test Set Evaluation & Confusion Matrices

### Model A: Kaggle CreditCard Test Set (56,962 transactions)

#### Confusion Matrix: RandomForest (Threshold = 0.90)
```
                 Predicted Legit    Predicted Fraud
Actual Legit:             56,881                  6
Actual Fraud:                 28                 47
```
- **True Negatives:** 56,881 (99.99% correct non-fraud classification)
- **False Positives:** Only 6 false alarms across nearly 57,000 transactions!
- **False Negatives:** 28 missed frauds
- **True Positives:** 47 confirmed frauds caught
- **Precision:** `47 / (47 + 6) = 88.68%`
- **Recall:** `47 / (47 + 28) = 62.67%`
- **F1-Score:** `0.7344`
- **ROC-AUC:** `0.9723` | **PR-AUC:** `0.7760`

#### Confusion Matrix: J48 Decision Tree (Threshold = 0.50)
```
                 Predicted Legit    Predicted Fraud
Actual Legit:             56,804                 83
Actual Fraud:                 16                 59
```
- **Precision:** 41.55% | **Recall:** 78.67% | **F1-Score:** 0.5438

#### Confusion Matrix: Logistic Regression (Threshold = 0.50)
```
                 Predicted Legit    Predicted Fraud
Actual Legit:             56,727                160
Actual Fraud:                 14                 61
```
- **Precision:** 27.60% | **Recall:** 81.33% | **F1-Score:** 0.4122

---

## 6. Persisted Artifacts & Rollback Hierarchy

All training outputs are persisted under versioned directories in `models/`:

```
models/
├── v1/                       # Model A (creditcard.csv)
│   ├── fraud.model           # Serialized Weka binary (RandomForest)
│   ├── header.bin            # Serialized Instances schema header
│   ├── feature_schema.json   # 29 features schema description
│   ├── threshold.json        # Calibrated threshold (0.90) & validation sweep
│   ├── metrics.json          # Complete benchmark metrics
│   ├── confusion_matrix.json # Matrix grid [[56881, 6], [28, 47]]
│   ├── confusion_matrix.txt  # Text formatted table
│   └── feature_importances.json # Top features by information gain (V17, V14, V12, V10, V11)
├── v2/                       # Model B (Fraud Detection Dataset.csv)
│   ├── fraud.model           # Serialized Weka binary
│   ├── header.bin            # 9 features schema header
│   ├── feature_schema.json
│   ├── threshold.json        # Calibrated threshold (0.20)
│   ├── metrics.json
│   ├── confusion_matrix.json # [[5006, 4692], [245, 257]]
│   ├── confusion_matrix.txt
│   └── feature_importances.json
├── latest/                   # Mirror of active production model (v2)
├── fraud.model               # Direct symlink/active binary loaded by Spring Boot
├── metrics.json              # Active model metrics served at GET /api/v1/model/metrics
└── threshold.json            # Active decision threshold
```

### Rollback Procedure:
To roll back from `v2` to `v1`:
```bash
cp models/v1/* models/
cp models/v1/* models/latest/
```
The Spring Boot backend reloads `models/fraud.model` and `models/metrics.json` at next boot or reload call.

---

## 7. Limitations & Operational Disclaimers

1. **Synthetic / Anonymized Features:**
   - Model A relies on PCA components (`V1`–`V28`), meaning individual transaction characteristics are abstract transformed variables. Model explainability is limited to mathematical variance rather than business attributes.
   - Model B exhibits near-uniform noise across features (PR-AUC 0.0767), suggesting the dataset is a synthetic demonstration set rather than organic fraud vectors.
2. **Concept Drift & Seasonal Shifts:**
   - Transaction volumes, attack patterns, and merchant distributions change rapidly. Static models must be retrained continuously with incoming analyst feedback.
3. **Regulatory Notice:**
   - This model is intended for automated anomaly scoring and triage alerting only. It is **not** authorized for autonomous real-time financial decisioning, card cancellations, or credit underwriting without human analyst oversight.

