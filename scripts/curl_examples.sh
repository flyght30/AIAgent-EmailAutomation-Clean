#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8085"

curl -s $BASE/health | jq . || true

curl -s $BASE/api/templates | jq . || true

curl -s -X POST $BASE/api/templates/preview \
  -H 'Content-Type: application/json' \
  -d '{"slug":"welcome","variables":{"firstName":"Chris","firmName":"CDV Law"}}' | jq . || true

curl -s -X POST $BASE/api/campaigns \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","templateSlug":"welcome","recipients":["you@example.com"]}' | jq . || true