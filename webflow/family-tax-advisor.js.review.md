# Review: `family-tax-advisor.js`

## Overall assessment
Solid client-side orchestration with clear flow state and simple payload construction. Good conditional logic and deep-dive toggling.

## Recommendations

### 1) Check `fetch` response status before success UI
- In `.then`, validate `response.ok` (and optionally parse response JSON) before showing success.
- Treat non-2xx as errors and show retry state.

**Why:** current code shows success for any resolved HTTP response, including 4xx/5xx.

### 2) Add request timeout + abort
- Use `AbortController` with a timeout (e.g., 15–25s).

**Why:** avoids hanging requests on flaky mobile networks.

### 3) Add submission correlation ID
- Generate a `client_submission_id` in JS and include it in payload.

**Why:** improves traceability between frontend events and n8n runs.

### 4) Harden webhook URL configuration
- Move `WEBHOOK_URL` to an injected runtime variable (Webflow page setting or global config), with environment-aware values.

**Why:** avoids hardcoded production endpoints in static JS.

### 5) Improve accessibility for custom toggles
- Add keyboard handlers and ARIA state updates for chip/radio custom controls.

**Why:** current controls are largely click-only.

### 6) Improve duplicate-submit handling
- Keep `isSubmitting = true` until definitive success/failure and consider local cooldown persistence.

**Why:** current logic is mostly safe, but can still be improved for rapid retries across refreshes/tabs.
