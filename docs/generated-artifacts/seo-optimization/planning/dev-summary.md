# Technical Development Summary: SEO 10/10 Optimization

## 1. Feature Identification
- **Feature Slug:** `seo-optimization`
- **Epic Reference:** `SEO-EPIC-01`
- **Lead / Technical Authority:** Technical Tasks Agent (Tech Lead)
- **Target Application:** NEETFORGE (`https://neetforge.in`)
- **SDLC Stage:** Ready for Execution (`@code`)

---

## 2. Architectural Context & Current Gap
NEETFORGE is built as a single-page application (SPA) using Vite, React 18, React Router v6, Tailwind CSS, and deployed on Vercel Edge. A 360° technical SEO audit (`neetforge_seo_deep_dive_audit.md`) revealed critical blockers:
1. **The Canonical Cannibalization Trap:** Every raw HTML response serves `<link rel="canonical" href="https://neetforge.in/" />`, causing search engines to treat all 13 subpages as duplicates and de-index them.
2. **Missing Head Static Assets:** `og-image.png`, `favicon.svg`, `apple-touch-icon.png`, and `manifest.json` do not exist in `/public`, causing Vercel's SPA wildcard rewrite to serve 5.2 KB `index.html` with HTTP 200 (Soft 404), breaking social share previews across WhatsApp, Twitter, and LinkedIn.
3. **Monolithic Bundle Bottleneck:** `App.tsx` imports ~50 routes synchronously, compiling into a 2.11 MB monolithic JS bundle that causes 3–5 second main-thread freezes on mobile devices.
4. **Edge Security & Cache Deficits:** Content-hashed static assets are served with `max-age=0`, and essential security headers (`nosniff`, `SAMEORIGIN`, `Permissions-Policy`) are missing.
5. **Schema Violations:** Colliding duplicate schemas in `index.html` and React runtime, featuring fictitious `SearchAction` and unverified `aggregateRating`.
6. **Crawl Hygiene Leaks:** Auth routes (`/app/login`, `/app/signup`) exposed in `sitemap.xml`, and `robots.txt` lacks blanket `/app/` protection.

---

## 3. Technology Stack & Key File Boundaries

### 3.1 Technology Stack
- **Framework:** React 18.3.1 (with TypeScript & JSX)
- **Bundler & Build Tool:** Vite 5.4.19 + Rollup 4
- **Routing:** React Router v6.30.1 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Styling:** Tailwind CSS 3.4.17 + Radix UI Primitives + Lucide Icons
- **Edge Infrastructure:** Vercel Edge Network (`vercel.json`)
- **Pre-Rendering Engine:** Deterministic Post-Build Node SSG Script (`scripts/prerender.mjs`)

### 3.2 Key File Locations

| Functional Domain | Target Files |
| :--- | :--- |
| **Static Branding & Head Assets** | `/public/og-image.png`<br>`/public/favicon.svg`<br>`/public/apple-touch-icon.png`<br>`/public/manifest.json`<br>`/index.html` |
| **Edge Network & Security** | `/vercel.json` |
| **Route Architecture & Bundling** | `/src/App.tsx`<br>`/vite.config.ts` |
| **SEO Metadata & Static SSG** | `/src/marketing/components/Seo.jsx`<br>`/src/marketing/pages/*.jsx` (13 routes)<br>`/scripts/prerender.mjs`<br>`/package.json` |
| **Schema.org Structured Data** | `/index.html`<br>`/src/marketing/pages/Home.jsx`<br>`/src/marketing/pages/FAQ.jsx`<br>`/src/marketing/components/neetforge/NeetFAQ.jsx` |
| **Crawl Hygiene & Spiders** | `/public/robots.txt`<br>`/public/sitemap.xml`<br>`/src/pages/Login.tsx`<br>`/src/pages/Signup.tsx` |

---

## 4. Performance & Audit Targets

| Metric | Pre-Fix Benchmark | Target Post-Execution |
| :--- | :---: | :---: |
| **Overall Technical SEO Audit Score** | **3.0 / 10** | **10 / 10** |
| **Marketing Initial JavaScript Bundle** | 2.11 MB (uncompressed) | **< 100 KB gzipped (< 250 KB raw)** |
| **First Contentful Paint (FCP) - 4G** | 3.2s | **< 1.2s** |
| **Largest Contentful Paint (LCP) - 4G** | 4.8s | **< 2.0s** |
| **Cumulative Layout Shift (CLS)** | 0.12 | **0.00** |
| **Social Preview Generation** | Broken / Blank (HTML fallback) | **100% Functional 1200x630 branded cards** |
| **Raw HTML Canonical Coverage** | 100% Homepage Duplicate | **100% Self-Referencing across 13 URLs** |
| **Google Rich Results Conformance** | 2 Violations (Rating, Search) | **Zero Warnings / Zero Errors** |
| **Edge Cache Hit Ratio on Assets** | 0% (max-age=0) | **100% (1-year immutable caching)** |

---

## 5. Architectural Contract Summary
1. **Public Marketing Pages (13 URLs):**
   Pre-rendered at build time to `dist/<route>/index.html`. Served directly by Vercel static CDN edge with zero cold start.
2. **Authenticated Private Application (`/app/*`):**
   Excluded from search crawlers (`robots.txt`, `noindex`). Rewritten via `vercel.json` to `/index.html` for client-side React hydration. Heavy dependencies (Recharts, quiz simulator) code-split into deferred async chunks.
