# Providers Setup (Mailgun)

Set environment variables in .env:
- MAILGUN_API_KEY=key-xxx
- MAILGUN_DOMAIN=mg.yourdomain.com
- MAILGUN_SIGNING_KEY=xxx (for webhook signature verification)

Sending
- API: POST /api/send/test with { to, subject, html }
- Campaigns use MailgunProvider under the hood; when not configured, responses show { success:false, error:'provider_not_configured' }

Webhooks
- Endpoint: POST /api/webhooks/mailgun
- Configure in Mailgun (Routes / Webhooks) to send events to your public URL
- Required fields: signature.timestamp, signature.token, signature.signature
- We verify signature: HMAC-SHA256 over timestamp+token with MAILGUN_SIGNING_KEY
- On success, event is stored in the events collection with provider:'mailgun'

Troubleshooting
- 401 invalid_signature → check MAILGUN_SIGNING_KEY and event payload
- Send test returns provider_not_configured → set MAILGUN_API_KEY and MAILGUN_DOMAIN