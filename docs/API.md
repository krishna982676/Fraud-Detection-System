# SentinelX REST API Specification & Reference

Base URL (Canonical): `http://localhost:8080/api/v1`  
Fallback Base URL: `http://localhost:8080/api`  
Frontend Proxy: `http://localhost:3000/api/v1`  
Format: `application/json`  
Authentication: Optional Bearer JWT (`Authorization: Bearer <token>`) or API Key Header (`X-API-Key: <key>`)

---

## 1. Endpoint Summary Table

| HTTP Method | Path | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/transactions/analyze` | None / Public | Evaluate single transaction in real-time (< 5ms) |
| `POST` | `/api/v1/transactions/batch` | None / Public | Evaluate batch of up to 500 transactions |
| `GET` | `/api/v1/transactions` | None / Public | Server-side paginated transaction audit history |
| `GET` | `/api/v1/transactions/{transactionId}` | None / Public | Fetch single transaction telemetry by ID |
| `GET` | `/api/v1/transactions/user/{userId}` | None / Public | Retrieve behavioral baseline & transaction history for user |
| `GET` | `/api/v1/alerts` | None / Public | Retrieve alerts filtered by status (`OPEN`, `REVIEWED`, etc.) |
| `GET` | `/api/v1/alerts/{id}` | None / Public | Fetch individual alert detail by ID |
| `PATCH` | `/api/v1/alerts/{id}` | None / Public | Update alert status (`OPEN`, `REVIEWED`, `DISMISSED`, `ESCALATED`) |
| `PUT` | `/api/v1/alerts/{id}` | None / Public | Alias to PATCH for updating alert status |
| `POST` | `/api/v1/alerts/feedback` | None / Public | Submit structured analyst feedback for continuous retraining |
| `GET` | `/api/v1/model/metrics` | None / Public | Return active model evaluation metrics & benchmark |
| `GET` | `/api/v1/model/threshold-sweep` | None / Public | Return empirical Precision-Recall sweep curve |
| `GET` | `/api/v1/model/versions` | None / Public | Return registered models (`v1` Kaggle, `v2` Financial) |
| `POST` | `/api/v1/model/activate/{version}` | None / Public | Hot-swap active classifier (`v1` or `v2`) with zero downtime |
| `POST` | `/api/v1/model/train` | None / Public | Trigger full model training & cross-validation |
| `POST` | `/api/v1/model/retrain-from-feedback` | None / Public | Retrain model incorporating analyst feedback records |
| `GET` | `/api/v1/settings` | None / Public | Retrieve dynamic engine thresholds & operational policies |
| `POST` | `/api/v1/settings` | None / Public | Update engine thresholds, dedup window, and scoring cutoffs |
| `GET` | `/api/v1/stats` | None / Public | Aggregated system stats, threat rate, and category breakdowns |
| `POST` | `/api/v1/demo-requests` | None / Public | Enterprise lead capture with 5/hour rate limiting |
| `GET` | `/actuator/health` | None / Public | Spring Boot Actuator component health & disk space check |
| `WS` | `/ws/alerts` | None / STOMP | Real-time WebSocket connection (`/topic/transactions`, `/topic/alerts`) |

---

## 2. Transactions API

### 2.1 Analyze Single Transaction
**Endpoint:** `POST /api/v1/transactions/analyze`

**Request Headers:**
```http
Content-Type: application/json
Accept: application/json
```

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `userId` | string | Yes | Not blank | Customer or account identifier |
| `amount` | number | Yes | Min: `0.01` | Transaction monetary value in USD |
| `merchantCategory` | string | Yes | Not blank | Merchant category (e.g. `GROCERY`, `LUXURY`, `TRANSFER`) |
| `location` | string | Yes | Not blank | Transaction city (e.g. `NEW_YORK`, `DUBAI`, `LONDON`) |
| `deviceType` | string | Yes | Not blank | Device channel (`MOBILE`, `WEB`, `POS`, `ATM`) |
| `hourOfDay` | integer | Yes | Range: `0` to `23` | Hour of transaction in local time |
| `distanceFromHome` | number | Yes | Min: `0.0` | Distance from user home base in kilometers |
| `txnCountLast24h` | integer | Yes | Min: `0` | Velocity count of transactions in past 24 hours |
| `isInternational` | boolean | Yes | `true` or `false` | Cross-border transaction indicator |
| `transactionId` | string | No | Optional | Unique ID (auto-generated if omitted) |
| `timestamp` | string | No | ISO-8601 | Transaction timestamp (defaults to current time) |

**Sample Request:**
```bash
curl -X POST http://localhost:8080/api/v1/transactions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER-1025",
    "amount": 4800.00,
    "merchantCategory": "LUXURY",
    "location": "DUBAI",
    "deviceType": "MOBILE",
    "hourOfDay": 3,
    "distanceFromHome": 2500.0,
    "txnCountLast24h": 8,
    "isInternational": true
  }'
```

**Sample Response (HTTP 200 OK):**
```json
{
  "transactionId": "TXN-21DC660C",
  "userId": "USER-1025",
  "amount": 4800.0,
  "merchantCategory": "LUXURY",
  "location": "DUBAI",
  "fraudProbability": 0.351,
  "isFraud": true,
  "riskLevel": "HIGH",
  "decision": "BLOCK",
  "modelVersion": "RandomForest (50 trees, maxDepth 15)",
  "thresholdUsed": 0.2,
  "reasons": [
    "Unusually elevated transaction amount ($4800.00) on unseasoned profile",
    "Distance from home location is 2500.0 km",
    "Nocturnal international transaction attempted at 03:00 hours",
    "High-risk merchant category 'LUXURY' with elevated volume ($4800.00)"
  ],
  "structuredReasons": [
    {
      "code": "HIGH_INITIAL_AMOUNT",
      "severity": "MED",
      "message": "Unusually elevated transaction amount ($4800.00) on unseasoned profile",
      "weight": 0.2
    },
    {
      "code": "EXTREME_DISTANCE_FROM_HOME",
      "severity": "MED",
      "message": "Distance from home location is 2500.0 km",
      "weight": 0.2
    },
    {
      "code": "NOCTURNAL_INTERNATIONAL",
      "severity": "MED",
      "message": "Nocturnal international transaction attempted at 03:00 hours",
      "weight": 0.22
    },
    {
      "code": "HIGH_RISK_CATEGORY_VOLUME",
      "severity": "MED",
      "message": "High-risk merchant category 'LUXURY' with elevated volume ($4800.00)",
      "weight": 0.18
    }
  ],
  "scoreBreakdown": {
    "mlScore": 0.159,
    "ruleScore": 0.8,
    "finalScore": 0.351,
    "riskLevel": "HIGH"
  },
  "topFactors": [
    {
      "feature": "Transaction Amount",
      "importance": 1.0,
      "impact": "INCREASES_RISK",
      "value": "$4800.00 (Baseline: $65)"
    },
    {
      "feature": "Distance from Home",
      "importance": 1.0,
      "impact": "INCREASES_RISK",
      "value": "2500.0 km (Baseline: 8 km)"
    },
    {
      "feature": "Nocturnal Hour",
      "importance": 0.45,
      "impact": "INCREASES_RISK",
      "value": "03:00 (Night hours)"
    }
  ],
  "alertGenerated": true,
  "alertId": 228,
  "timestamp": "2026-11-02T22:40:09.320954",
  "mlScore": 0.159,
  "ruleScore": 0.8,
  "finalScore": 0.351
}
```

---

### 2.2 Analyze Batch Transactions
**Endpoint:** `POST /api/v1/transactions/batch` (Maximum 500 items per request)

**Sample Request:**
```bash
curl -X POST http://localhost:8080/api/v1/transactions/batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "userId": "USER-1001",
      "amount": 14.50,
      "merchantCategory": "GROCERY",
      "location": "NEW_YORK",
      "deviceType": "MOBILE",
      "hourOfDay": 11,
      "distanceFromHome": 1.2,
      "txnCountLast24h": 1,
      "isInternational": false
    },
    {
      "userId": "USER-1002",
      "amount": 3500.00,
      "merchantCategory": "TRANSFER",
      "location": "TOKYO",
      "deviceType": "WEB",
      "hourOfDay": 2,
      "distanceFromHome": 9200.0,
      "txnCountLast24h": 18,
      "isInternational": true
    }
  ]'
```

**Sample Response (HTTP 200 OK):**
```json
{
  "totalProcessed": 2,
  "fraudDetected": 1,
  "alertsCreated": 1,
  "processingTimeMs": 6,
  "results": [
    {
      "transactionId": "TXN-A1024BC9",
      "userId": "USER-1001",
      "amount": 14.5,
      "riskLevel": "LOW",
      "isFraud": false,
      "finalScore": 0.04
    },
    {
      "transactionId": "TXN-B8820EF1",
      "userId": "USER-1002",
      "amount": 3500.0,
      "riskLevel": "HIGH",
      "isFraud": true,
      "finalScore": 0.82
    }
  ]
}
```

---

### 2.3 Paginated Transaction History
**Endpoint:** `GET /api/v1/transactions?page=0&size=20`

**Sample Request:**
```bash
curl -s "http://localhost:8080/api/v1/transactions?page=0&size=2"
```

**Sample Response (HTTP 200 OK):**
```json
{
  "content": [
    {
      "id": 686,
      "organizationId": "default-org",
      "transactionId": "TXN-21DC660C",
      "userId": "USER-1025",
      "amount": 4800.0,
      "merchantCategory": "LUXURY",
      "location": "DUBAI",
      "deviceType": "MOBILE",
      "hourOfDay": 3,
      "distanceFromHome": 2500.0,
      "txnCountLast24h": 8,
      "isInternational": true,
      "fraudProbability": 0.351,
      "mlScore": 0.159,
      "ruleScore": 0.8,
      "finalScore": 0.351,
      "isFraud": true,
      "riskLevel": "HIGH",
      "reasons": "Unusually elevated transaction amount ($4800.00) on unseasoned profile | Distance from home location is 2500.0 km | Nocturnal international transaction attempted at 03:00 hours | High-risk merchant category 'LUXURY' with elevated volume ($4800.00)",
      "structuredReasonsJson": "[...]",
      "createdAt": "2026-11-02T22:40:09.320954"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 2,
    "sort": { "sorted": false, "unsorted": true, "empty": true }
  },
  "totalElements": 686,
  "totalPages": 343,
  "last": false,
  "size": 2,
  "number": 0
}
```

---

### 2.4 Get Transaction By ID
**Endpoint:** `GET /api/v1/transactions/{transactionId}`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/transactions/TXN-21DC660C
```

**Sample Response (HTTP 200 OK):**
```json
{
  "id": 686,
  "organizationId": "default-org",
  "transactionId": "TXN-21DC660C",
  "userId": "USER-1025",
  "amount": 4800.0,
  "merchantCategory": "LUXURY",
  "location": "DUBAI",
  "deviceType": "MOBILE",
  "hourOfDay": 3,
  "distanceFromHome": 2500.0,
  "txnCountLast24h": 8,
  "isInternational": true,
  "fraudProbability": 0.351,
  "mlScore": 0.159,
  "ruleScore": 0.8,
  "finalScore": 0.351,
  "isFraud": true,
  "riskLevel": "HIGH",
  "createdAt": "2026-11-02T22:40:09.320954"
}
```

---

### 2.5 Get User Behavioral Profile & Baseline
**Endpoint:** `GET /api/v1/transactions/user/{userId}`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/transactions/user/USER-1002
```

**Sample Response (HTTP 200 OK):**
```json
{
  "profile": {
    "userId": "USER-1002",
    "avgAmount": 895.16,
    "stdDevAmount": 1565.47,
    "txnCount": 6,
    "usualCities": ["TOKYO", "LONDON", "DUBAI"],
    "usualCategories": ["ENTERTAINMENT", "TRANSFER", "DINING"],
    "lastLocation": "LONDON",
    "lastTxnTime": "2026-11-02T17:10:01"
  },
  "recentTransactions": [
    {
      "id": 682,
      "transactionId": "TXN-21003B9A",
      "userId": "USER-1002",
      "amount": 40.96,
      "merchantCategory": "DINING",
      "location": "LONDON",
      "finalScore": 0.221,
      "riskLevel": "HIGH",
      "createdAt": "2026-11-02T17:10:01"
    }
  ]
}
```

---

## 3. Alerts API

### 3.1 Retrieve Alerts by Status
**Endpoint:** `GET /api/v1/alerts?status={OPEN|REVIEWED|DISMISSED|ESCALATED}`

**Sample Request:**
```bash
curl -s "http://localhost:8080/api/v1/alerts?status=REVIEWED"
```

**Sample Response (HTTP 200 OK):**
```json
[
  {
    "id": 228,
    "organizationId": "default-org",
    "transactionId": "TXN-21DC660C",
    "userId": "USER-1025",
    "amount": 4800.0,
    "merchantCategory": "LUXURY",
    "location": "DUBAI",
    "fraudProbability": 0.351,
    "riskLevel": "HIGH",
    "reasons": "Unusually elevated transaction amount ($4800.00) on unseasoned profile | Distance from home location is 2500.0 km | Nocturnal international transaction attempted at 03:00 hours | High-risk merchant category 'LUXURY' with elevated volume ($4800.00)",
    "structuredReasonsJson": "[{\"code\":\"HIGH_INITIAL_AMOUNT\",\"severity\":\"MED\",\"message\":\"Unusually elevated transaction amount ($4800.00) on unseasoned profile\",\"weight\":0.2},{\"code\":\"EXTREME_DISTANCE_FROM_HOME\",\"severity\":\"MED\",\"message\":\"Distance from home location is 2500.0 km\",\"weight\":0.2},{\"code\":\"NOCTURNAL_INTERNATIONAL\",\"severity\":\"MED\",\"message\":\"Nocturnal international transaction attempted at 03:00 hours\",\"weight\":0.22},{\"code\":\"HIGH_RISK_CATEGORY_VOLUME\",\"severity\":\"MED\",\"message\":\"High-risk merchant category 'LUXURY' with elevated volume ($4800.00)\",\"weight\":0.18}]",
    "count": 1,
    "status": "REVIEWED",
    "createdAt": "2026-11-02T22:40:09.320954",
    "lastEventAt": "2026-11-02T22:40:09.320954",
    "updatedAt": "2026-11-02T22:49:58.417385"
  }
]
```

---

### 3.2 Update Alert Status
**Endpoint:** `PATCH /api/v1/alerts/{id}` or `PUT /api/v1/alerts/{id}`

**Sample Request:**
```bash
curl -X PATCH http://localhost:8080/api/v1/alerts/228 \
  -H "Content-Type: application/json" \
  -d '{"status": "REVIEWED"}'
```

**Sample Response (HTTP 200 OK):**
```json
{
  "id": 228,
  "transactionId": "TXN-21DC660C",
  "userId": "USER-1025",
  "amount": 4800.0,
  "status": "REVIEWED",
  "updatedAt": "2026-11-02T22:49:58.417385"
}
```

---

### 3.3 Submit Analyst Feedback
**Endpoint:** `POST /api/v1/alerts/feedback`

**Sample Request:**
```bash
curl -X POST http://localhost:8080/api/v1/alerts/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "alertId": 228,
    "isActualFraud": true,
    "notes": "Confirmed unauthorized nocturnal card-not-present transaction."
  }'
```

**Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Analyst feedback recorded successfully",
  "data": "Recorded",
  "timestamp": "2026-11-03T08:00:00"
}
```

---

## 4. Machine Learning & Model Governance API

### 4.1 Get Model Metrics
**Endpoint:** `GET /api/v1/model/metrics`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/model/metrics
```

**Sample Response (HTTP 200 OK):**
```json
{
  "algorithm": "RandomForest (50 trees, maxDepth 15)",
  "modelType": "RandomForest (50 trees, maxDepth 15)",
  "trainedAt": "2026-11-02T19:56:32.942342",
  "datasetRows": 284807,
  "accuracy": 0.9994,
  "precision": 0.8868,
  "recall": 0.6267,
  "f1": 0.7344,
  "f1Score": 0.7344,
  "rocAuc": 0.9723,
  "prAuc": 0.776,
  "decisionThreshold": 0.9,
  "confusionMatrix": [[56881, 6], [28, 47]],
  "baselineAlgorithm": "J48 Decision Tree",
  "baselineAccuracy": 0.9983,
  "baselinePrecision": 0.4155,
  "baselineRecall": 0.7867,
  "baselineF1": 0.5438,
  "baselineRocAuc": 0.9031,
  "logisticAlgorithm": "Logistic Regression",
  "logisticAccuracy": 0.9969,
  "logisticPrecision": 0.276,
  "logisticRecall": 0.8133,
  "logisticF1": 0.4122,
  "logisticRocAuc": 0.9823,
  "trivialAccuracy": 0.9987,
  "trivialPrecision": 0.0,
  "trivialRecall": 0.0,
  "trivialF1": 0.0
}
```

---

### 4.2 Precision-Recall Threshold Sweep
**Endpoint:** `GET /api/v1/model/threshold-sweep`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/model/threshold-sweep
```

**Sample Response (HTTP 200 OK):**
```json
[
  { "threshold": 0.05, "precision": 0.0099, "recall": 0.9423, "f1": 0.0196, "f1Score": 0.0196 },
  { "threshold": 0.1, "precision": 0.0222, "recall": 0.8846, "f1": 0.0434, "f1Score": 0.0434 },
  { "threshold": 0.2, "precision": 0.0782, "recall": 0.8269, "f1": 0.1429, "f1Score": 0.1429 },
  { "threshold": 0.5, "precision": 0.4659, "recall": 0.7885, "f1": 0.5857, "f1Score": 0.5857 },
  { "threshold": 0.7, "precision": 0.6964, "recall": 0.75, "f1": 0.7222, "f1Score": 0.7222 },
  { "threshold": 0.8, "precision": 0.7255, "recall": 0.7115, "f1": 0.7184, "f1Score": 0.7184 },
  { "threshold": 0.9, "precision": 0.9394, "recall": 0.5962, "f1": 0.7294, "f1Score": 0.7294 }
]
```

---

### 4.3 Model Versions & Hot-Swap
**Endpoints:**  
- List Versions: `GET /api/v1/model/versions`
- Hot-Swap Version: `POST /api/v1/model/activate/{version}`

**Sample Request (List Versions):**
```bash
curl -s http://localhost:8080/api/v1/model/versions
```

**Sample Response:**
```json
[
  {
    "version": "v1",
    "name": "Model A (CreditCard Kaggle Dataset)",
    "description": "29 PCA components + Amount, time-split 80/20, optimal threshold 0.90",
    "active": true,
    "algorithm": "RandomForest (50 trees, maxDepth 15)",
    "accuracy": 0.9994,
    "precision": 0.8868,
    "recall": 0.6267,
    "f1": 0.7344,
    "rocAuc": 0.9723
  },
  {
    "version": "v2",
    "name": "Model B (Financial Fraud Dataset)",
    "description": "10 features, stratified 80/20, optimal threshold 0.20",
    "active": false,
    "algorithm": "RandomForest (50 trees, maxDepth 15)",
    "accuracy": 0.516,
    "precision": 0.0519,
    "recall": 0.512,
    "f1": 0.0943,
    "rocAuc": 0.5234
  }
]
```

**Sample Request (Activate Version v2):**
```bash
curl -X POST http://localhost:8080/api/v1/model/activate/v2
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Model version v2 activated successfully",
  "data": {
    "algorithm": "RandomForest (50 trees, maxDepth 15)",
    "trainedAt": "2026-11-02T19:56:33.007602",
    "accuracy": 0.516,
    "precision": 0.0519,
    "recall": 0.512,
    "f1": 0.0943,
    "rocAuc": 0.5234,
    "decisionThreshold": 0.2
  }
}
```

---

## 5. Operational Settings API

### 5.1 Get Operational Policies
**Endpoint:** `GET /api/v1/settings`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/settings
```

**Sample Response:**
```json
{
  "highThreshold": 0.7,
  "medThreshold": 0.4,
  "dedupWindowMinutes": 5,
  "escalationLimitMinutes": 10,
  "highContrastMode": false,
  "audioAlertsEnabled": false
}
```

### 5.2 Update Operational Policies Dynamically
**Endpoint:** `POST /api/v1/settings`

**Sample Request:**
```bash
curl -X POST http://localhost:8080/api/v1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "highThreshold": 0.75,
    "medThreshold": 0.40,
    "dedupWindowMinutes": 10,
    "escalationLimitMinutes": 15
  }'
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Operational settings and scoring policies updated successfully",
  "data": {
    "highThreshold": 0.75,
    "medThreshold": 0.4,
    "dedupWindowMinutes": 10,
    "escalationLimitMinutes": 15,
    "highContrastMode": false,
    "audioAlertsEnabled": false
  }
}
```

---

## 6. System Telemetry & Statistics API

### 6.1 Get System Stats
**Endpoint:** `GET /api/v1/stats`

**Sample Request:**
```bash
curl -s http://localhost:8080/api/v1/stats
```

**Sample Response:**
```json
{
  "totalTransactions": 686,
  "fraudTransactions": 162,
  "legitTransactions": 524,
  "fraudRatePercentage": 23.62,
  "deltaFraudRate": 0.0,
  "totalAlerts": 128,
  "openAlerts": 1,
  "reviewedAlerts": 3,
  "dismissedAlerts": 1,
  "escalatedAlerts": 123,
  "alertsLastHour": 1,
  "activeThreshold": 0.2,
  "riskDistribution": {
    "HIGH": 162,
    "MEDIUM": 130,
    "LOW": 394
  },
  "categoryBreakdown": {
    "LUXURY": 14,
    "GROCERY": 12,
    "TRANSFER": 19,
    "DINING": 5
  }
}
```

---

## 7. Webhook & STOMP WebSocket Protocol

### 7.1 WebSocket Connection Setup
- **Endpoint:** `ws://localhost:8080/ws/alerts` (or `http://localhost:8080/ws/alerts` for SockJS fallback)
- **STOMP Protocol:** Connect frame sends heartbeat `4000,4000`

### 7.2 Subscriptions
- `/topic/transactions`: Streams every scored `AnalysisResponse` object.
- `/topic/alerts`: Streams newly generated or merged `Alert` objects.

**Sample Message Payload (`/topic/alerts`):**
```json
{
  "id": 229,
  "transactionId": "TXN-E33F9A20",
  "userId": "USER-1044",
  "amount": 5200.0,
  "merchantCategory": "TRANSFER",
  "location": "MUMBAI",
  "fraudProbability": 0.89,
  "riskLevel": "HIGH",
  "eventCount": 1,
  "status": "OPEN",
  "createdAt": "2026-11-03T08:00:15.123456"
}
```

