#!/usr/bin/env bash
set -euo pipefail

echo "=== Eve Starter Setup ==="
echo "Checking prerequisites..."

command -v eve >/dev/null 2>&1 || { echo "Eve CLI not found. Install with: npm i -g @eve-horizon/cli"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker not found. Install Docker Desktop."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose not found. Update Docker Desktop."; exit 1; }

echo "Installing skills..."
eve skills install

echo "Setup complete! Run: ./scripts/deploy.sh"
