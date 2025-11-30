#!/bin/sh
set -e
cd /app
OPENAPI_URL=${OPENAPI_URL:-http://api:4000/docs/json}
HEALTH_URL=${HEALTH_URL:-http://api:4000/healthz}
MAX_WAIT=${MAX_WAIT:-60}
waited=0
until curl -sf "$HEALTH_URL" >/dev/null 2>&1; do
  waited=$((waited+2))
  if [ $waited -ge $MAX_WAIT ]; then
    echo "[web] api health not ready after ${MAX_WAIT}s, continue anyway";
    break
  fi
  echo "[web] waiting api health... ($waited s)"
  sleep 2
done
waited=0
until curl -sf "$OPENAPI_URL" >/dev/null 2>&1; do
  waited=$((waited+2))
  if [ $waited -ge $MAX_WAIT ]; then
    echo "[web] openapi not ready after ${MAX_WAIT}s, skip generation"
    break
  fi
  echo "[web] waiting openapi at $OPENAPI_URL ... ($waited s)"
  sleep 2
done
pnpm gen:api || echo "[web] gen:api failed, continue to dev (check logs)"
exec pnpm nx run web:dev -- --host 0.0.0.0 --port 5173
