# Recommendations for `backup/family-tax-advisor-embed.html`

## Inline-comment follow-up
No explicit inline comments were provided. This is a concrete upgrade checklist.

## Required improvements
1. **Accessibility for custom controls**
   - Convert chip/radio `<div>` elements to semantic controls (`button` or native inputs).
   - Ensure keyboard support (`Tab`, `Space`, `Enter`) and `aria-checked` updates.

2. **Button safety**
   - Add `type="button"` to all non-submit action buttons (`Back`, `Continue`, etc.).

3. **No-JS fallback**
   - Add `<noscript>` helper text with support email and alternate contact route.

4. **Spam reduction honeypot**
   - Add hidden field `website` (left blank by humans).
   - Reject submissions server-side when populated.

5. **Improve form semantics**
   - Add `<label for="...">` links on every input/select.
   - Add `aria-describedby` where hints/errors are present.
