#!/usr/bin/env bash
set -euo pipefail

echo "=== Running API integration tests ==="

cd apps/api
npm test
