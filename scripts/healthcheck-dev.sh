#!/usr/bin/env bash
set -euo pipefail
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/health || true)
if [ "$HTTP_STATUS" != "200" ]; then
  echo "Healthcheck failed: $HTTP_STATUS"
  exit 1
fi
echo "Healthcheck OK"
