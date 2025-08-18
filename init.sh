#!/bin/sh
set -e

echo "[INIT] Bringing up all services..."
docker compose up -d --build

# --- Wait for PD ---
echo "[INIT] Waiting for PD to be healthy..."
for i in $(seq 1 60); do
  if curl -s http://localhost:2379/pd/api/v1/health | grep -q 'health.*true'; then
    echo "[INIT] PD is healthy."
    break
  fi
  sleep 2
  if [ $i -eq 60 ]; then
    echo "[INIT][ERROR] PD not healthy after 2 minutes"
    docker compose logs pd | tail -n 50
    exit 1
  fi
done

# --- Wait for TiDB ---
echo "[INIT] Waiting for TiDB to be healthy..."
for i in $(seq 1 60); do
  if curl -s http://localhost:11080/status | grep -q '"connections"'; then
    echo "[INIT] TiDB is healthy."
    break
  fi
  sleep 2
  if [ $i -eq 60 ]; then
    echo "[INIT][ERROR] TiDB not healthy after 2 minutes"
    docker compose logs tidb | tail -n 50
    exit 1
  fi
done

# --- Wait for TiCDC ---
echo "[INIT] Waiting for TiCDC capture..."
for i in $(seq 1 60); do
  if curl -s http://localhost:8400/api/v2/captures | grep -q 'address'; then
    echo "[INIT] TiCDC is ready."
    break
  fi
  sleep 2
  if [ $i -eq 60 ]; then
    echo "[INIT][ERROR] TiCDC not ready after 2 minutes"
    docker compose logs ticdc | tail -n 50
    exit 1
  fi
done

# --- Ensure Kafka topic exists ---
echo "[INIT] Ensuring Kafka topic 'cdc-events' exists..."
docker compose exec -T kafka kafka-topics.sh \
  --create --if-not-exists \
  --topic cdc-events \
  --bootstrap-server kafka:9092 \
  --partitions 1 \
  --replication-factor 1

# --- Ensure changefeed exists ---
echo "[INIT] Ensuring TiCDC changefeed 'kafka' exists..."
if MSYS_NO_PATHCONV=1 docker compose exec -T ticdc /cdc cli changefeed query \
    --pd=http://pd:2379 \
    --changefeed-id=kafka >/dev/null 2>&1; then
  echo "[INIT] changefeed already exists, resuming..."
  MSYS_NO_PATHCONV=1 docker compose exec -T ticdc /cdc cli changefeed resume \
    --pd=http://pd:2379 \
    --changefeed-id=kafka || true
else
  echo "[INIT] creating changefeed..."
  MSYS_NO_PATHCONV=1 docker compose exec -T ticdc /cdc cli changefeed create \
    --pd=http://pd:2379 \
    --sink-uri="kafka://kafka:9092/cdc-events?protocol=canal-json&partition-num=1" \
    --changefeed-id=kafka
fi

# --- Show changefeeds ---
echo "[INIT] Current changefeeds:"
MSYS_NO_PATHCONV=1 docker compose exec -T ticdc /cdc cli changefeed list --pd=http://pd:2379 || true

echo "[INIT] System ready!"
