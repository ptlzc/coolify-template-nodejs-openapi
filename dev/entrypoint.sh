#!/bin/sh
set -e
cd /app
LOCK=pnpm-lock.yaml
STAMP=.pnpm-lock.sha
if [ -f "$LOCK" ]; then
  SHA=$(sha1sum "$LOCK" | awk '{print $1}')
  OLD=""
  [ -f "$STAMP" ] && OLD=$(cat "$STAMP")
  if [ "$SHA" != "$OLD" ] || [ ! -d node_modules ]; then
    echo "[entrypoint] lock changed or node_modules missing, running pnpm install..."
    pnpm install --frozen-lockfile
    echo "$SHA" > "$STAMP"
  fi
fi
exec "$@"
