#!/usr/bin/env bash
# Continuous headless traffic generator for SentinelX
# Usage: ./scripts/stream-traffic.sh [speed_seconds] [fraud_percent]

SPEED=${1:-0.5}   # default: 1 transaction every 0.5s (2 txns/sec)
FRAUD_PCT=${2:-10} # default: 10% fraud injection rate

echo "🚀 Starting SentinelX real-time traffic stream..."
echo "Speed: 1 transaction every ${SPEED}s | Fraud rate: ${FRAUD_PCT}%"
echo "Target: http://localhost:8080/api/v1/transactions/analyze"
echo "Press Ctrl+C to halt."
echo "---------------------------------------------------------"

CITIES=("NEW_YORK" "LONDON" "TOKYO" "PARIS" "SYDNEY" "BERLIN" "MUMBAI" "TORONTO" "DUBAI" "SINGAPORE")
CATEGORIES=("GROCERY" "DINING" "ENTERTAINMENT" "ELECTRONICS" "TRAVEL" "LUXURY" "TRANSFER" "UTILITIES")
DEVICES=("MOBILE" "WEB" "POS" "ATM")

COUNT=0

while true; do
  COUNT=$((COUNT + 1))
  USER_ID="USER-$((1000 + RANDOM % 50))"
  CITY=${CITIES[$RANDOM % ${#CITIES[@]}]}
  CATEGORY=${CATEGORIES[$RANDOM % ${#CATEGORIES[@]}]}
  DEVICE=${DEVICES[$RANDOM % ${#DEVICES[@]}]}
  IS_FRAUD=$((RANDOM % 100 < FRAUD_PCT))

  if [ "$IS_FRAUD" -eq 1 ]; then
    # Attack payload
    AMOUNT=$((3000 + RANDOM % 3000)).$((RANDOM % 100))
    DIST=$((4000 + RANDOM % 6000)).0
    HOUR=$((RANDOM % 5))
    TXN24=$((15 + RANDOM % 20))
    INTL="true"
    CATEGORY="LUXURY"
  else
    # Nominal payload
    AMOUNT=$((10 + RANDOM % 120)).$((RANDOM % 100))
    DIST=$((1 + RANDOM % 15)).$((RANDOM % 10))
    HOUR=$((8 + RANDOM % 14))
    TXN24=$((1 + RANDOM % 4))
    INTL="false"
  fi

  PAYLOAD=$(cat <<EOF
{
  "userId": "$USER_ID",
  "amount": $AMOUNT,
  "merchantCategory": "$CATEGORY",
  "location": "$CITY",
  "deviceType": "$DEVICE",
  "hourOfDay": $HOUR,
  "distanceFromHome": $DIST,
  "txnCountLast24h": $TXN24,
  "isInternational": $INTL
}
EOF
)

  RES=$(curl -s -X POST http://localhost:8080/api/v1/transactions/analyze \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  TXN_ID=$(echo "$RES" | grep -o '"transactionId":"[^"]*' | cut -d'"' -f4)
  RISK=$(echo "$RES" | grep -o '"riskLevel":"[^"]*' | cut -d'"' -f4)
  SCORE=$(echo "$RES" | grep -o '"finalScore":[0-9.]*' | cut -d':' -f2)

  if [ "$RISK" == "HIGH" ]; then
    echo "🚨 [#$COUNT] $TXN_ID | $USER_ID | \$$AMOUNT | $CITY | RISK: $RISK ($SCORE) -> ALERT GENERATED"
  else
    echo "✅ [#$COUNT] $TXN_ID | $USER_ID | \$$AMOUNT | $CITY | RISK: $RISK ($SCORE)"
  fi

  sleep "$SPEED"
done

