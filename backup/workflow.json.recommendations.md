# Recommendations for `backup/workflow.json`

## Inline-comment follow-up
No inline review comments were present in the provided diff metadata, so this file converts prior high-level notes into concrete, implementation-ready actions.

## Priority 1 (ship first)
1. **Protect webhook from abuse**
   - Add captcha token in frontend payload (`captcha_token`).
   - Add verification node immediately after webhook.
   - Route failures to DLQ with `error_code=security.captcha_failed`.

2. **Only show success on true webhook success**
   - Ensure webhook response is non-2xx on validation/security failure.
   - Frontend can then reliably show retry UI.

3. **Add request idempotency**
   - Compute `submission_fingerprint = sha256(email + first_name + day_bucket + state)`.
   - Lookup in leads sheet/database before LLM calls.
   - If duplicate within N minutes, short-circuit with `duplicate=true`.

## Priority 2 (reliability/cost)
4. **Centralize config in env/credentials**
   - Move sheet IDs/admin email/model names out of raw JSON defaults.
   - Keep workflow portable across dev/staging/prod.

5. **Hard-stop on malformed LLM responses**
   - Add branch nodes after each HTTP node for:
     - non-2xx
     - missing expected JSON key
     - truncation marker detected
   - Route to DLQ + alert with stage-specific `error_code`.

6. **Fallback report path**
   - If L2/L3 fails, email a reduced "quick snapshot" report using L1 only.
   - Mark `report_mode=fallback_l1_only` for transparency.

## Priority 3 (ops/privacy)
7. **Observability summary row**
   - Persist run row: `run_id, form_type, stage_latency_ms, l1_tokens, l2_tokens, l3_tokens, total_cost_est, fail_reason`.

8. **Data retention minimization**
   - Keep PII columns only where needed.
   - Add scheduled purge/anonymization for old rows.
