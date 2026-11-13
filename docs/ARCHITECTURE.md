# SentinelX System Architecture & Technical Specifications

This document provides an in-depth architectural breakdown of the **SentinelX Real-Time Autonomous Fraud Detection System**, detailing the subsystem components, communication protocols, sequence flows, database entity relationships, and containerized deployment infrastructure.

---

## 1. System Component Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Client & Ingestion Layer"]
        SPA["SentinelX React 18 SPA (Vite / Tailwind / Port 3000)"]
        CurlClient["Payment Gateways / External Systems / cURL"]
        Sim["Simulator Traffic Injector (Headless / UI 50 Personas)"]
    end

    subgraph Gateway ["Reverse Proxy & Network Gateway"]
        Nginx["Nginx Reverse Proxy (Docker Container / Port 80)"]
        ViteProxy["Vite Dev Server Proxy (/api, /ws -> 8080)"]
    end

    subgraph ApplicationCore ["Application Core (Spring Boot 3.2.5 / Port 8080)"]
        subgraph SecurityFilter ["Security & Interceptors"]
            JWT["JwtAuthenticationFilter (HMAC-SHA256)"]
            RateLimit["Rate Limiting Filter (Bucket4j)"]
        end

        subgraph Controllers ["REST API Controllers"]
            TxnCtrl["TransactionController (/api/v1/transactions)"]
            AlertCtrl["AlertController (/api/v1/alerts)"]
            ModelCtrl["ModelController (/api/v1/model)"]
            SettingsCtrl["SettingsController (/api/v1/settings)"]
            StatsCtrl["StatsController (/api/v1/stats)"]
            DemoCtrl["DemoRequestController (/api/v1/demo-requests)"]
            HealthCtrl["HealthController (/actuator/health)"]
        end

        subgraph ServiceLayer ["Processing & Scoring Engine"]
            TAS["TransactionAnalysisService (Hybrid Orchestrator)"]
            RES["RuleEngineService (Multi-Factor Violation Engine)"]
            UPS["UserProfileService (In-Memory Baseline Tracker)"]
            WFC["WekaFraudClassifier (Hot-Swappable Random Forest)"]
            AS["AlertService (5-Min Deduplication & Escalation)"]
            WSS["WebSocketNotificationService (SimpMessagingTemplate)"]
        end

        subgraph Broker ["Message Broker"]
            STOMP["Spring SimpleBroker (/ws/alerts)"]
            TopicAlerts["/topic/alerts"]
            TopicTxns["/topic/transactions"]
        end
    end

    subgraph PersistenceLayer ["Persistence & Storage Layer"]
        JPA["Spring Data JPA (Hibernate 6)"]
        Flyway["Flyway Database Migrations (V1, V2, V3)"]
        DB[("Embedded H2 / PostgreSQL (jdbc:h2:file:./data/frauddb)")]
        DiskModels["Model Directory (./models/v1, ./models/v2, active_version.txt)"]
    end

    %% Wiring
    SPA -->|HTTP / REST| ViteProxy
    SPA -->|STOMP over WS| STOMP
    CurlClient -->|HTTP / REST| SecurityFilter
    Sim -->|REST Stream| SecurityFilter
    ViteProxy -->|Forward /api| SecurityFilter
    Nginx -->|SPA Fallback| SPA
    Nginx -->|Forward /api| SecurityFilter

    SecurityFilter --> Controllers
    Controllers --> ServiceLayer

    TAS --> RES
    TAS --> UPS
    TAS --> WFC
    TAS --> AS
    TAS --> WSS
    AS --> WSS

    WSS --> STOMP
    STOMP --> TopicAlerts
    STOMP --> TopicTxns
    TopicAlerts --> SPA
    TopicTxns --> SPA

    ServiceLayer --> JPA
    WFC --> DiskModels
    JPA --> DB
    Flyway --> DB
```

---

## 2. End-to-End Real-Time Transaction Scoring Sequence

The sequence diagram below traces an incoming financial transaction through validation, user profiling, machine learning inference, statistical rule evaluations, score blending, alert management, and real-time dashboard notification.

```mermaid
sequenceDiagram
    autonumber
    actor Merchant as Payment Gateway / Merchant
    participant Controller as TransactionController
    participant Engine as TransactionAnalysisService
    participant Profile as UserProfileService
    participant ML as WekaFraudClassifier
    participant Rules as RuleEngineService
    participant AlertSvc as AlertService
    participant Repo as TransactionRepository
    participant Broker as WebSocketNotificationService
    actor Analyst as Analyst Operations Dashboard

    Merchant->>Controller: POST /api/v1/transactions/analyze
    Controller->>Engine: analyzeTransaction(request)
    
    activate Engine
    Note over Engine: Assign TXN-ID & timestamp if absent

    %% Rule Evaluation
    Engine->>Rules: evaluate(request)
    activate Rules
    Rules->>Profile: getOrCreateProfile(userId)
    Profile-->>Rules: UserProfile (mean, std, lastLocation, history)
    Note over Rules: 1. Z-Score Anomaly (amt > mean + 3*std)<br/>2. Haversine Velocity (> 900 km/h)<br/>3. 10-Min Velocity Surge (> 3 txns)<br/>4. Nocturnal International (01:00-05:00)<br/>5. Unrecognized City / New Device
    Rules-->>Engine: RuleEvaluationResult (ruleScore, structuredReasons)
    deactivate Rules

    %% Machine Learning Inference
    Engine->>ML: predictFraudProbability(request)
    activate ML
    Note over ML: Vectorize to Weka Instance<br/>RandomForest.distributionForInstance()
    ML-->>Engine: mlScore (0.0 to 1.0)
    deactivate ML

    %% Score Blending
    Note over Engine: FinalScore = (0.70 * mlScore) + (0.30 * ruleScore)<br/>Classify: HIGH (>=0.70), MED (0.40-0.69), LOW (<0.40)

    %% Persistence
    Engine->>Repo: save(TransactionRecord)
    Repo-->>Engine: TransactionRecord persisted

    %% Profile Update
    Engine->>Profile: recordTransaction(userId, amount, city, category, device, hour)
    
    %% Alert Generation / Deduplication
    alt FinalScore >= HighThreshold OR isFraud == true
        Engine->>AlertSvc: createOrMergeAlert(txn, finalScore, riskLevel, reasons)
        activate AlertSvc
        Note over AlertSvc: Check 5-min deduplication window<br/>Merge if open alert exists, else create
        AlertSvc->>Broker: sendAlert(alert)
        AlertSvc-->>Engine: Alert record (id)
        deactivate AlertSvc
    end

    %% WebSocket Broadcast
    Engine->>Broker: sendTransaction(analysisResponse)
    Broker-->>Analyst: Broadcast to /topic/transactions & /topic/alerts

    Engine-->>Controller: AnalysisResponse (decision, scores, reasons, topFactors, latency)
    deactivate Engine
    Controller-->>Merchant: HTTP 200 OK (JSON)
```

---

## 3. Database Entity Relationship (ER) Diagram

The system employs file-backed embedded H2 in PostgreSQL compatibility mode for local development, and standard PostgreSQL for enterprise deployments. Schemas are governed by Flyway (`V1__baseline_schema.sql`, `V2__multi_tenancy_and_auth.sql`, `V3__shedlock_and_webhooks.sql`).

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has members"
    ORGANIZATIONS ||--o{ TRANSACTIONS : "owns"
    ORGANIZATIONS ||--o{ ALERTS : "owns"
    ORGANIZATIONS ||--o{ ANALYST_FEEDBACK : "owns"
    ORGANIZATIONS ||--o{ API_KEYS : "issues"
    ORGANIZATIONS ||--o| SUBSCRIPTIONS : "has"
    ORGANIZATIONS ||--o{ USAGE_COUNTERS : "tracks"
    USERS ||--o{ API_KEYS : "generates"
    ALERTS ||--o{ ANALYST_FEEDBACK : "triaged in"
    TRANSACTIONS ||--o| ALERTS : "triggers"

    ORGANIZATIONS {
        varchar(36) id PK
        varchar(255) name
        varchar(255) slug UK
        varchar(32) status
        varchar(32) plan
        double precision risk_threshold
        double precision medium_risk_threshold
        timestamp created_at
    }

    USERS {
        varchar(36) id PK
        varchar(36) organization_id FK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(32) role
        int failed_login_attempts
        timestamp locked_until
        timestamp created_at
    }

    API_KEYS {
        varchar(36) id PK
        varchar(36) organization_id FK
        varchar(36) user_id FK
        varchar(16) key_prefix
        varchar(128) key_hash UK
        boolean is_revoked
        timestamp last_used_at
        timestamp created_at
    }

    TRANSACTIONS {
        bigint id PK
        varchar(36) organization_id FK
        varchar(64) transaction_id UK
        varchar(64) user_id
        double precision amount
        varchar(32) merchant_category
        varchar(64) location
        varchar(32) device_type
        int hour_of_day
        double precision distance_from_home
        int txn_count_last_24h
        boolean is_international
        double precision fraud_probability
        double precision ml_score
        double precision rule_score
        double precision final_score
        boolean is_fraud
        varchar(16) risk_level
        varchar(2000) reasons
        varchar(4000) structured_reasons_json
        timestamp created_at
    }

    ALERTS {
        bigint id PK
        varchar(36) organization_id FK
        varchar(64) transaction_id
        varchar(64) user_id
        double precision amount
        varchar(32) merchant_category
        varchar(64) location
        double precision fraud_probability
        varchar(16) risk_level
        varchar(2000) reasons
        varchar(4000) structured_reasons_json
        int event_count
        varchar(16) status
        timestamp created_at
        timestamp last_event_at
        timestamp updated_at
    }

    ANALYST_FEEDBACK {
        bigint id PK
        varchar(36) organization_id FK
        bigint alert_id FK
        varchar(64) transaction_id
        varchar(64) user_id
        double precision amount
        boolean is_actual_fraud
        varchar(1000) notes
        timestamp created_at
    }

    USER_PROFILES {
        bigint id PK
        varchar(36) organization_id FK
        varchar(64) user_id UK
        double precision sum_amount
        double precision sum_sq_amount
        bigint txn_count
        varchar(64) primary_city
        varchar(64) primary_category
        varchar(64) last_location
        timestamp last_transaction_at
        timestamp updated_at
    }

    SUBSCRIPTIONS {
        varchar(36) id PK
        varchar(36) organization_id FK
        varchar(32) plan
        varchar(32) status
        varchar(32) provider
        timestamp trial_ends_at
        timestamp current_period_end
    }

    DEMO_REQUESTS {
        bigint id PK
        varchar(100) name
        varchar(100) email
        varchar(100) company
        varchar(1000) message
        timestamp created_at
    }
```

---

## 4. Containerized Deployment Architecture

```mermaid
graph TD
    subgraph Host ["Production Host / Docker Engine"]
        subgraph Ports ["Exposed Host Ports"]
            Port80["Port 3000 (External HTTP)"]
            Port8080["Port 8080 (API & WS)"]
        end

        subgraph DockerCompose ["Docker Compose Sandbox"]
            subgraph FrontendContainer ["Container: sentinelx-frontend"]
                NginxSvr["Nginx Alpine (Port 80)"]
                ReactDist["Compiled React 18 SPA (/usr/share/nginx/html)"]
                NginxConf["/etc/nginx/conf.d/default.conf"]
            end

            subgraph BackendContainer ["Container: sentinelx-backend"]
                JRE["Eclipse Temurin 17 JRE Alpine"]
                JAR["Spring Boot Application (app.jar / Port 8080)"]
            end

            subgraph StorageVolumes ["Persistent Docker Volumes"]
                VolData["./data -> /app/data (frauddb.mv.db)"]
                VolModels["./models -> /app/models (Weka *.model, *.json)"]
            end
        end
    end

    Port80 --> NginxSvr
    NginxSvr --> ReactDist
    NginxSvr -->|Proxy /api/ & /ws/| JAR
    Port8080 --> JAR

    JAR --> VolData
    JAR --> VolModels
```

---

## 5. Subsystem Technical Breakdown

### 5.1 Hybrid Scoring Formula
Every transaction receives an integrated composite risk score calculated in `TransactionAnalysisService`:

$$\text{FinalScore} = (0.70 \times \text{MLScore}) + (0.30 \times \text{RuleScore})$$

- $\text{MLScore} \in [0.0, 1.0]$: Probability assigned by the active Weka `RandomForest` ensemble for the `FRAUD` class.
- $\text{RuleScore} \in [0.0, 1.0]$: Normalized sum of triggered violation weights capped at $1.0$.

#### Decision Boundary Policy
```
If FinalScore >= HighThreshold (default 0.70):
    Decision: BLOCK
    RiskLevel: HIGH
    isFraud: true
    Action: Hold payment, generate alert, fire webhook
Else If FinalScore >= MediumThreshold (default 0.40):
    Decision: REVIEW
    RiskLevel: MEDIUM
    isFraud: false
    Action: Challenge with Step-Up Authentication (3D-Secure / OTP)
Else:
    Decision: APPROVE
    RiskLevel: LOW
    isFraud: false
    Action: Clear payment immediately
```

### 5.2 Spherical Haversine Velocity Engine
Physical impossibility of travel is evaluated using the great-circle Haversine formula over geographic coordinates in `UserProfileService`:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

$$\text{Speed} = \frac{d}{\Delta t} \quad (\text{km/h})$$

- Earth Radius $R = 6,371\text{ km}$
- If $\text{Speed} > 900\text{ km/h}$ and $d > 150\text{ km}$, rule `IMPOSSIBLE_TRAVEL` is triggered with weight $0.40$ (severity `HIGH`).
- **Telemetry Nodes**: Includes Indian metro nodes (`NEW_DELHI` / `DELHI`, `MUMBAI`, `BENGALURU` / `BANGALORE`, `HYDERABAD`, `CHENNAI`, `KOLKATA`, `PUNE`, `AHMEDABAD`, `JAIPUR`, `CHANDIGARH`, `LUCKNOW`, `KOCHI`, `GOA`, `INDIA`), alongside global nodes (`NEW_YORK`, `LONDON`, `TOKYO`, `PARIS`, `SYDNEY`, `BERLIN`, `TORONTO`, `DUBAI`, `SINGAPORE`, `SAN_FRANCISCO`, `LOS_ANGELES`, `CHICAGO`, `SEATTLE`, `BOSTON`). Normalized string mapping handles whitespace, hyphens, and casing automatically.

### 5.3 Alert Lifecycle State Machine
Alert status evolves through four deterministic states:

```mermaid
stateDiagram-v2
    [*] --> OPEN: FinalScore >= HighThreshold
    OPEN --> OPEN: Transaction within 5-min window (EventCount++, Amount+=TxnAmt)
    OPEN --> ESCALATED: Unresolved for > 10 minutes (Automated Scanner)
    OPEN --> REVIEWED: Analyst confirms True Fraud (Shortcut 'R')
    OPEN --> DISMISSED: Analyst flags False Positive (Shortcut 'D')
    DISMISSED --> OPEN: Undo Toast action (5-second window)
    ESCALATED --> REVIEWED: Lead Analyst resolves confirmed fraud
    ESCALATED --> DISMISSED: Lead Analyst closes false alarm
    REVIEWED --> [*]: Fed to AnalystFeedbackRepository
    DISMISSED --> [*]: Fed to AnalystFeedbackRepository
```

