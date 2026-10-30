# Deploying stackset.io (GitHub Pages)

Repo: `hyren-stackset/website-main` → GitHub Pages → `stackset.io`.
The site is 100% static: hand-written CSS, vendored GSAP / ScrollTrigger / Lenis / SplitType, self-hosted fonts. **No build step, no npm.**

## Publish this version

From the folder containing this file:

```bash
git init                                   # skip if this is already the clone
git remote add origin git@github.com:hyren-stackset/website-main.git   # skip if present
git add -A
git commit -m "Rebuild stackset.io as the company site (Shelfie + products, security, about, support, legal)"
git branch -M main
git push -u origin main --force-with-lease  # this is a full replacement of the old single-page site
```

Pages redeploys in about a minute. Settings → Pages should already say: Source "Deploy from a branch", branch `main`, folder `/ (root)`, custom domain `stackset.io`, Enforce HTTPS on. The `CNAME` file keeps the custom domain across pushes.

## DNS (already correct at Porkbun, verified 2026-10-30)

| Type | Host | Answer |
|---|---|---|
| A | `@` | 185.199.108.153 / .109.153 / .110.153 / .111.153 |
| CNAME | `www` | `hyren-stackset.github.io` |

Leave the MX / SPF / DKIM / `_da-verify` records alone; they are MXroute email.

## What's in the box

```
index.html                    home
products/index.html           Shelfie + Clipforge, Relayform, Pantryloop
security/index.html           security & infrastructure overview
about/index.html              company, founders, timeline, values
support/index.html            FAQ, contact form (mailto), investors
privacy/index.html            privacy policy
terms/index.html              terms of service
404.html                      styled not-found page (GitHub Pages serves it automatically)
robots.txt  sitemap.xml  humans.txt  .well-known/security.txt
CNAME  .nojekyll  favicon.svg
assets/css/main.css           all styles (edit directly)
assets/js/main.js             motion + nav + forms
assets/vendor/                pinned animation libraries
assets/fonts/                 Inter, Space Grotesk, JetBrains Mono (variable, latin)
assets/og.png                 social share card
```

## Editing

- Pages are plain HTML; header and footer are repeated in each file. If you change the nav or footer, change it in every page (search for `<header id="site-nav"` and `<footer class="footer"`).
- Motion is driven by data attributes: `data-reveal`, `data-card`, `data-stagger`, `data-split`, `data-count`, `data-phone`. Add them to new elements and the animations apply automatically.
- Everything respects `prefers-reduced-motion`.

## Email addresses referenced

`hello@`, `support@`, `privacy@`, `security@`, `partners@`, `legal@`, `founders@stackset.io`. Create these as mailboxes or aliases in MXroute (an alias to brian.ren@stackset.io is enough to start).
