#!/usr/bin/env bash
set -euo pipefail

ENV=${1:-staging}

echo "=== Running CI/CD pipeline for $ENV ==="
eve pipeline run ci-cd-main --env "$ENV"

echo "Deploy complete!"
echo "Access via your staging environment URL (see: eve env status $ENV)"
echo ""
echo "Note: For direct deployments without pipeline, use:"
echo "  eve env deploy $ENV --ref <git-sha-or-branch>"
