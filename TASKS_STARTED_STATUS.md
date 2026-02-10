# Tasks Started Status (without Point #7 dependency)

This document tracks the kickoff of all previously proposed tasks. As requested, work was started without relying on point #7 inputs.

## Started tasks
1. Webhook/frontend integration hardening started:
   - frontend now checks HTTP success status before success UI
   - request timeout/abort added
   - client submission ID added
   - honeypot field added to frontend payload

2. Accessibility task started:
   - keyboard support and ARIA states added for custom chip/radio controls
   - explicit button types added in embed HTML
   - focus-visible CSS styles added
   - reduced-motion CSS support added

3. Data hygiene/privacy task started:
   - example PII in workflow sample payload replaced with placeholders
   - admin lead alert body reduced by removing phone field

4. Runtime configurability started:
   - webhook URL can now be injected via `window.LTA_CONFIG.webhookUrl` with safe fallback

## Tasks that may need additional information later
- Captcha/Turnstile provider selection and secret management in n8n.
- Rate-limiting/WAF configuration at the n8n ingress layer (outside repo).
- Environment variable standards for n8n deployment (no `.env.example`/infra files present).
- Dedupe storage strategy (Sheets vs dedicated datastore) and retention policy confirmation.
- Formal webhook response contract documentation (status/body schema) from deployment environment.

## Why this is still unblocked now
These missing inputs are not required to begin frontend hardening and basic workflow hygiene changes. They become necessary for full production-grade completion of ingress security and idempotency infrastructure.
