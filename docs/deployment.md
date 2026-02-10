# Deployment Notes

## Webflow runtime config
Inject before loading `family-tax-advisor.js`:

```html
<script>
window.LTA_CONFIG = {
  webhookUrl: 'https://n8n.lyroshq.com/webhook/family-tax-advisor',
  webhookToken: 'replace-with-strong-token'
};
</script>
```

## n8n configuration
- In `C1 Config`, set `security_config.require_webhook_token=true` in production.
- Set `security_config.webhook_token` from secret manager.
- Keep `allowed_origins` constrained to trusted Webflow origins.
- `dedupe_config` controls duplicate blocking window and cache size.

## Export hygiene
Before committing workflow exports:
1. Remove `pinData`.
2. Redact credentials IDs/names.
3. Ensure no real PII remains in example payloads.
