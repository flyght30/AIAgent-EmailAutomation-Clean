# AIAgent-EmailAutomation-Clean

Email Automation service (Node + TypeScript) with:
- Template CRUD + preview
- Mailgun provider adapter (graceful when not configured)
- Mailgun webhook with signature verification and event storage
- Simple Campaigns (create/start/stop) with 30s scheduler and batching

## Quickstart
1) Setup
- cp .env.example .env
- Fill MONGO_URL and DB_NAME
- (Optional) set MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_SIGNING_KEY when ready
- yarn install
- yarn dev

2) Seed a sample template
- yarn ts-node src/scripts/seed.ts

3) Try the API (examples use localhost:8085)
- Health: curl http://localhost:8085/health
- List templates: curl http://localhost:8085/api/templates
- Preview template:
  curl -X POST http://localhost:8085/api/templates/preview \
    -H 'Content-Type: application/json' \
    -d '{"slug":"welcome","variables":{"firstName":"Chris","firmName":"CDV Law"}}'
- Create campaign:
  curl -X POST http://localhost:8085/api/campaigns \
    -H 'Content-Type: application/json' \
    -d '{"name":"Test","templateSlug":"welcome","recipients":["you@example.com"]}'
- Start campaign:
  curl -X POST http://localhost:8085/api/campaigns/<campaignId>/start
- Send test email (provider must be configured):
  curl -X POST http://localhost:8085/api/send/test \
    -H 'Content-Type: application/json' \
    -d '{"to":"test@example.com","subject":"Test","html":"<b>Hi</b>"}'

4) Webhooks (Mailgun)
- Configure Mailgun to POST events to: http://<your-domain>/api/webhooks/mailgun
- Signature is verified using MAILGUN_SIGNING_KEY; events are saved to the events collection

## API docs
See docs/API.md for endpoints and payloads. See docs/PROVIDERS.md for Mailgun configuration.

## Security
- Optional API key protection via x-api-key header (set API_KEY in .env)
- No provider keys required to boot; provider_not_configured returned when not set

## Notes
- Scheduler processes running campaigns every 30 seconds in small batches
- Indexes are ensured on startup for templates, campaigns, events