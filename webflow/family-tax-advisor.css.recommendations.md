# Recommendations for `webflow/family-tax-advisor.css`

## Inline-comment follow-up
No inline comments were supplied. This file converts the prior review into actionable CSS changes.

## Required improvements
1. **Fix encoding artifacts**
   - Normalize file to UTF-8 and replace mojibake (`â€”`, `â†’`, `âœ“`) with correct characters.

2. **Add visible keyboard focus**
   - Add `:focus-visible` styles for `.lta-chip`, `.lta-radio`, `.lta-btn`, `.lta-input`, `.lta-select`.

3. **Respect reduced motion**
   - Add:
   ```css
   @media (prefers-reduced-motion: reduce) {
     * { animation: none !important; transition: none !important; }
   }
   ```

4. **Small-text contrast audit**
   - Validate `--text-dim` and helper text contrast ratios on dark background.
   - Raise contrast where ratio fails for 11–13px text.
