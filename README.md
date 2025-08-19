# AIAgent-EmailAutomation-Clean

Email Automation service (Node + TypeScript) with:
- Template CRUD + preview
- Mailgun provider adapter (graceful when not configured), supports FROM_EMAIL env and sandbox default (postmaster@&lt;domain&gt;)
- Mailgun webhook with dual HMAC verification (headers or body) and event storage
- Simple Campaigns (create/start/stop) with 30s scheduler and batching
- Events listing endpoint for quick debugging

## Quickstart (Local)
1) Setup
- cp .env.example .env
- Set: MONGO_URL, DB_NAME
- Set: MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_SIGNING_KEY
- Optional: FROM_EMAIL (otherwise defaults to postmaster@&lt;sandbox-domain&gt; or noreply@&lt;domain&gt;)
- yarn install
- yarn dev

2) Seed a sample template
- yarn ts-node src/scripts/seed.ts

3) Try the API (localhost:8085)
- Health: GET /health
- Templates: GET /api/templates
- Preview: POST /api/templates/preview { slug:"welcome", variables:{ firstName, firmName } }
- Campaigns: POST /api/campaigns { name, templateSlug:"welcome", recipients:["you@example.com"] }, then POST /api/campaigns/:id/start
- Send test: POST /api/send/test { to, subject, html }
- Events: GET /api/events?limit=20

4) Webhooks (Mailgun)
- POST /api/webhooks/mailgun
- We verify HMAC via MAILGUN_SIGNING_KEY using either request headers (X-Mailgun-*) or body.signature fields.
- Events are stored into the events collection.

## Deploy on Emergent (Kubernetes)
We support path-based ingress at /email-api.

1) Build & Push Docker Image (GitHub Actions)
- On merge to main, CI builds and pushes: ghcr.io/&lt;owner&gt;/aiagent-emailautomation-clean:latest
- Workflow: .github/workflows/build.yml

2) Configure Kubernetes manifests (k8s/)
- k8s/configmap.yaml: non-secret config (PORT, DB_NAME)
- k8s/secret.example.yaml: copy to secret.yaml and insert real values
  - MONGO_URL
  - MAILGUN_API_KEY
  - MAILGUN_DOMAIN
  - MAILGUN_SIGNING_KEY
  - FROM_EMAIL (recommended for sandbox)
- k8s/deployment.yaml: set image to your GHCR image
- k8s/service.yaml
- k8s/ingress.yaml: set your host (YOUR_DOMAIN_HERE)

3) Apply (order)
- kubectl apply -f k8s/configmap.yaml
- kubectl apply -f k8s/secret.yaml
- kubectl apply -f k8s/deployment.yaml
- kubectl apply -f k8s/service.yaml
- kubectl apply -f k8s/ingress.yaml

4) Verify
- GET https://YOUR_DOMAIN/email-api/health
- GET https://YOUR_DOMAIN/email-api/api/templates
- POST https://YOUR_DOMAIN/email-api/api/send/test
- Configure Mailgun webhooks to: https://YOUR_DOMAIN/email-api/api/webhooks/mailgun
- GET https://YOUR_DOMAIN/email-api/api/events?limit=20

## Security
- Use repo secrets for CI & Kubernetes Secret for runtime
- Never commit keys; rotate keys periodically