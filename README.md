# Family Tax Advantage Finder

**Owner:** Lyros Pty Ltd (ACN 689 015 165)  
**Website:** [lyros.com.au](https://lyros.com.au)  
**Version:** 2.0.0  
**Updated:** 2026-02-08

---

## What This Is

Frontend form for the Family Tax Advantage Finder tool on lyros.com.au. Users complete a multi-step questionnaire about their household, income, property, and deductions. On submit, the form POSTs to an n8n webhook which runs an LLM analysis pipeline and emails a personalised tax advantage report.

## Repo Structure

```
├── webflow/
│   ├── family-tax-advisor.css    # All form styles
│   └── family-tax-advisor.js     # All form logic + webhook submit
├── backup/
│   └── family-tax-advisor-embed.html   # HTML markup (paste into Webflow embed)
└── README.md
```

## How It's Used

The CSS and JS are served via **jsDelivr CDN** (pointed at this repo) and loaded in Webflow Page Settings. The HTML is pasted directly into a Webflow HTML Embed element on the page.

### CDN URLs (via jsDelivr)

```
CSS: https://cdn.jsdelivr.net/gh/chris-lyros/family-tax-advisor@main/webflow/family-tax-advisor.css
JS:  https://cdn.jsdelivr.net/gh/chris-lyros/family-tax-advisor@main/webflow/family-tax-advisor.js
```

### Webflow Setup

See the **Webflow Integration Guide** section below.

## Webflow Integration Guide

### 1. Page Settings → Custom Code → Head Code

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/chris-lyros/family-tax-advisor@main/webflow/family-tax-advisor.css" />
```

### 2. Page Settings → Custom Code → Footer Code

```html
<script src="https://cdn.jsdelivr.net/gh/chris-lyros/family-tax-advisor@main/webflow/family-tax-advisor.js"></script>
```


Optional runtime config override before loading JS:

```html
<script>
  window.LTA_CONFIG = {
    webhookUrl: 'https://n8n.lyroshq.com/webhook/family-tax-advisor',
    webhookToken: 'replace-with-strong-token'
  };
</script>
```


### 3. Page Body → HTML Embed Element

Paste the contents of `backup/family-tax-advisor-embed.html` into a Webflow HTML Embed element.

## Cache Busting

jsDelivr caches files aggressively. After pushing updates, either:

- **Wait ~24 hours** for the cache to clear naturally, or
- **Purge manually** at `https://purge.jsdelivr.net/gh/chris-lyros/family-tax-advisor@main/webflow/family-tax-advisor.css` (and same for `.js`), or
- **Pin to a commit hash** for instant updates: `@{commit_sha}` instead of `@main`

## Webhook

- **Endpoint:** `POST https://n8n.lyroshq.com/webhook/family-tax-advisor`
- **Schema:** `trigger.v1.family_tax_form`
- **Content-Type:** `application/json`

## Important

This tool provides **general information only** and does not constitute personal financial, tax, or legal advice. Lyros Pty Ltd is not a registered tax agent or holder of an Australian Financial Services Licence.

## Dependencies

None. The form is self-contained vanilla HTML/CSS/JS. The only external resources are Google Fonts (DM Sans, JetBrains Mono).


See `docs/deployment.md` and `.env.example` for production configuration guidance.
