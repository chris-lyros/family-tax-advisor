# Review: `family-tax-advisor-embed.html`

## Overall assessment
Clean sectioned markup with strong naming consistency and good UX flow (quick path + optional deep dive + contact capture).

## Recommendations

### 1) Improve semantic accessibility for chips/radios
- Replace clickable `<div>` controls with native `<button>` or `<input type="radio|checkbox">` patterns.
- Add keyboard interaction support (`Enter`/`Space`) and `aria-checked` state updates.

**Why:** current controls are mouse-friendly but not fully accessible for keyboard and assistive technologies.

### 2) Add explicit `<label for>` associations where possible
- Keep current visual labels, but tie each form input to a real label `for` target.

**Why:** improves screen-reader reliability and click targets.

### 3) Add `type="button"` to navigation buttons
- For all non-submit buttons (`Back`, `Continue`, etc.), set `type="button"` explicitly.

**Why:** prevents accidental form submit behavior if this embed is ever placed inside a `<form>` wrapper in Webflow.

### 4) Add no-JS fallback message
- Include a `<noscript>` block explaining the form requires JavaScript and where to contact support.

**Why:** clearer failure mode for script-blocked users.

### 5) Add hidden honeypot field
- Add one hidden field (e.g., `website`) and reject if populated.

**Why:** low-cost spam reduction before n8n processing.
