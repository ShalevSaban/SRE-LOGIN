#!/bin/sh
set -e

echo "[init-db] waiting for TiDB..."
until mysql -h tidb -P 4000 -u root -e "SELECT 1" >/dev/null 2>&1; do
  sleep 4
done
echo "[init-db] TiDB is up, applying schema..."

mysql -h tidb -P 4000 -u root < /docker-entrypoint-initdb.d/db.sql

echo "[init-db] done."
