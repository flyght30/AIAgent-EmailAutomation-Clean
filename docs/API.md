# API Reference

Base URL: http://localhost:8085

- GET /health → { status, db, timestamp }

Templates
- GET /api/templates → { templates: [...] }
- GET /api/templates/:slug → { template }
- POST /api/templates → { slug, subject, html }
  body: { slug, subject, html }
- PUT /api/templates/:slug → updates subject/html
  body: { subject?, html? }
- DELETE /api/templates/:slug → { success }
- POST /api/templates/preview → { preview: { subject, html } }
  body: { slug, variables }

Campaigns
- GET /api/campaigns → { campaigns: [...] }
- GET /api/campaigns/:id → { campaign }
- POST /api/campaigns → { campaign }
  body: { name, templateSlug, recipients: string[] }
- POST /api/campaigns/:id/start → { success, status: 'running' }
- POST /api/campaigns/:id/stop → { success, status: 'stopped' }

Send
- POST /api/send/test → { success, id? | error }
  body: { to, subject, html }

Webhooks
- POST /api/webhooks/mailgun → { received }
  - Signature verification using MAILGUN_SIGNING_KEY
  - Saves event to events collection: { ...providerFields, provider: 'mailgun', receivedAt }

Auth (optional)
- Set API_KEY in .env and pass header x-api-key: <key> (or Authorization: Bearer &lt;key&gt;)