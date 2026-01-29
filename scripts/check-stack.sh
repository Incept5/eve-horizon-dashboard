#!/usr/bin/env bash
set -euo pipefail

echo "=== Checking local Docker Compose ==="
docker compose ps >/dev/null 2>&1 || { echo "Compose services not running. Start with: docker compose up"; exit 1; }
docker compose ps -q --status running | grep -q . || { echo "Compose services not running. Start with: docker compose up"; exit 1; }

echo "Compose services are running!"
