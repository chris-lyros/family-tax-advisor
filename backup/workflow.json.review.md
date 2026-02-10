# Review: `workflow.json`

## Overall assessment
Strong, production-minded n8n pipeline with clear staging (parse → route → L1/L2/L3 → normalize → deliver), explicit DLQ branches, and useful audit metadata. The structure is maintainable and already includes several guardrails.

## Recommendations

### 1) Protect the public webhook endpoint
- Add an anti-abuse layer in front of `POST /webhook/family-tax-advisor` (Cloudflare Turnstile/hCaptcha token, rate-limiting, and basic bot filtering).
- In n8n, verify captcha token before running LLM calls.

**Why:** this endpoint is public and directly triggers cost-heavy LLM nodes.

### 2) Externalize environment-specific config
- Move sheet IDs, admin email, and model names from `C1 Config` into environment variables/credentials.
- Keep only defaults in workflow JSON.

**Why:** safer deployments across staging/prod and easier secret/config rotation.

### 3) Enforce HTTP response validity before parsing
- Ensure L1/L2/L3 HTTP nodes branch on non-2xx responses and malformed JSON before downstream parse nodes.
- Add explicit fallback fields and a single shared `error_code` taxonomy in `meta.errors`.

**Why:** current flow is robust but still depends on parser-level recovery; explicit response contracts improve reliability.

### 4) Add idempotency for duplicate submissions
- Generate and store a deterministic fingerprint (e.g., email + timestamp bucket + payload hash) and suppress duplicates within a short window.

**Why:** protects against accidental double-submits and repeated webhook retries.

### 5) Data minimization and retention policy
- Add retention windows for PII in Sheets (or move to a DB with TTL/anonymization jobs).
- Consider storing only hashed email in cost/error sheets where possible.

**Why:** lower privacy risk and easier compliance posture.

### 6) Add model-failure fallback path
- If L2/L3 fails, optionally send a simplified “quick snapshot” email from L1 output.

**Why:** better UX than full failure in partial-outage scenarios.

### 7) Improve observability
- Emit a compact run summary row with: run_id, form_type, latency per stage, tokens per stage, fail_reason.
- Add alert thresholds (error rate spikes, token-cost spikes).

**Why:** makes it easier to diagnose regressions and manage spend.
