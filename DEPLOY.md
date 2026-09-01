# Deploying stackset.io to GitHub Pages

The site is 100% static and self-contained (fonts + animation libraries are vendored — no CDNs, no build step needed to deploy). Total hosting cost: $0.

## 1 · Push to GitHub

1. Create a new repository on github.com (e.g. `stackset/website` or `<your-username>/stackset.io`). Public repos get free Pages; private repos need a paid plan for Pages.
2. From this folder:

```bash
git init
git add -A
git commit -m "Stackset marketing site"
git branch -M main
git remote add origin git@github.com:<YOUR_USER_OR_ORG>/<REPO>.git
git push -u origin main
```

## 2 · Turn on GitHub Pages

Repo → **Settings → Pages**:

- **Source**: "Deploy from a branch"
- **Branch**: `main`, folder `/ (root)` → Save

The `CNAME` file in this repo already tells Pages the site belongs to `stackset.io`, so the Custom domain box should fill itself in (if not, type `stackset.io` and Save).

Optional but recommended: **Settings → Pages → Verify domain** — add the `_github-pages-challenge-...` TXT record it gives you at Porkbun. This stops anyone else from claiming stackset.io on Pages.

## 3 · Point DNS at GitHub (at Porkbun)

In Porkbun's DNS editor for stackset.io:

**Remove** the two parking records (they conflict):
- `ALIAS  stackset.io → pixie.porkbun.com`
- `CNAME  *.stackset.io → pixie.porkbun.com`

**Add** (apex → GitHub's Pages servers):

| Type | Host | Answer |
|------|------|--------|
| A | *(blank)* | 185.199.108.153 |
| A | *(blank)* | 185.199.109.153 |
| A | *(blank)* | 185.199.110.153 |
| A | *(blank)* | 185.199.111.153 |
| CNAME | www | `<YOUR_USER_OR_ORG>.github.io` |

⚠️ **Leave every other record alone** — the MX, SPF (`v=spf1...`), DKIM (`x._domainkey`), and `_da-verify` TXT records are your MXroute email; they are independent of web hosting and must stay.

## 4 · HTTPS

Back in **Settings → Pages**, wait for the DNS check to go green (minutes to ~1 hour), then tick **Enforce HTTPS**. GitHub issues a free Let's Encrypt certificate automatically.

## Updating the site later

Edit files → commit → `git push`. Pages redeploys automatically in ~1 minute.

If you change any Tailwind classes in `index.html`, rebuild the CSS first:

```bash
npm install          # once
npm run build:css    # regenerates assets/css/main.css
```

## What's in the box

```
index.html            the whole site (single page)
404.html              styled not-found page
CNAME                 tells GitHub Pages the custom domain
.nojekyll             disables Jekyll processing
favicon.svg
assets/css/main.css   compiled + minified Tailwind v4
assets/js/main.js     animation logic (GSAP + ScrollTrigger + Lenis + SplitType)
assets/vendor/        pinned, self-hosted animation libraries
assets/fonts/         self-hosted variable fonts (Inter, Space Grotesk, JetBrains Mono)
assets/og.png         social-share card
src/input.css         Tailwind source (edit here, then rebuild)
```

## The animation stack (for future tinkering)

- **GSAP 3.15 + ScrollTrigger** — timelines, scroll-linked reveals, stat counters
- **Lenis 1.3** — buttery smooth scrolling, driven off GSAP's ticker
- **SplitType** — splits the hero headline into words for the staggered entrance
- Everything is disabled automatically for users with `prefers-reduced-motion`.
