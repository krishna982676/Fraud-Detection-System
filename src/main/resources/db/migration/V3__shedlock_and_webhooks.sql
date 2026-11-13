-- V3: Webhook Events (Idempotency) and ShedLock Distributed Locks

CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT,
    processed_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_events (processed_at DESC);

CREATE TABLE IF NOT EXISTS shedlock (
    name VARCHAR(64) PRIMARY KEY,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL
);
