# Software Requirements Specification (SRS): Technical & On-Page SEO 10/10 Optimization

## 1. Document Overview & Metadata
- **Epic Reference:** `SEO-EPIC-01`
- **Feature Name:** NEETFORGE 10/10 Technical & On-Page SEO Optimization
- **Target Application:** NEETFORGE (`https://neetforge.in`)
- **Hosting / Architecture:** Vercel Edge Network / Vite + React SPA
- **Baseline Audit Score:** 3.0 / 10 (Critical crawlability, asset, and indexation blockers)
- **Target Post-Implementation Score:** 10.0 / 10 (Full Googlebot indexation, valid social cards, immutable asset caching, sub-second LCP)

---

## 2. Executive Summary
A comprehensive 360° technical and on-page SEO audit of `https://neetforge.in` revealed critical architectural defects that prevent search engines (Googlebot, Bingbot, etc.) and social media scrapers (WhatsApp, Twitter/X, LinkedIn, Telegram) from indexing and previewing NEETFORGE pages accurately.

Key findings include:
1. **Asset Integrity Failure:** Key static head assets (`/og-image.png`, `/favicon.svg`, `/apple-touch-icon.png`, `/manifest.json`) physically do not exist in the public root. Because of a wildcard SPA rewrite rule in `vercel.json`, requests for these assets return HTTP `200 OK` with the 5.2 KB `index.html` payload. This completely breaks social share previews and PWA manifests.
2. **Canonical Cannibalization in Raw HTML:** Every single URL on the domain serves identical raw HTML with `<link rel="canonical" href="https://neetforge.in/" />` and identical homepage `<title>` tags before JavaScript hydration. Search engines drop marketing subpages from indexation because they explicitly declare themselves duplicates of the homepage.
3. **Monolithic Bundle Bottleneck:** The application currently compiles into a single uncompressed 2.11 MB JavaScript file (`index-*.js`) that bundles private authenticated features (`/app/dashboard`, `/app/tests`, Recharts, full Lucide icon set) into public marketing routes. This severely impacts mobile First Contentful Paint (FCP) and Largest Contentful Paint (LCP).
4. **Header Deficiencies:** Static hashed assets lack immutable long-term caching (`max-age=31536000, immutable`), forcing repetitive validation requests. Critical modern security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, HSTS preload) are absent.
5. **Structured Data Collisions:** Colliding duplicate schemas are injected simultaneously by raw `index.html` and client-side React code. Furthermore, non-compliant guidelines exist (e.g., fictitious `SearchAction` without a functioning search query endpoint, unverified `aggregateRating` without reviews, and empty `sameAs` social links).
6. **Crawl Budget Inefficiencies:** Private authentication entry points (`/app/login`, `/app/signup`) are listed in `sitemap.xml`, and `robots.txt` does not cleanly isolate the private `/app/*` application suite.

This specification outlines the 6 core functional requirements required to resolve all architectural blockers and achieve a 10/10 technical SEO score.

---

## 3. Problem Statement & Business Impact
| Defect Area | Current State & Root Cause | Direct Business & Crawler Impact |
| :--- | :--- | :--- |
| **Social Media Sharing** | `og-image.png` returns `text/html` instead of an image. | When students, mentors, or influencers share NEETFORGE links on WhatsApp, Telegram, or Twitter, the preview card renders completely blank or broken. Low organic CTR. |
| **Search Indexation** | All 15 URLs output `canonical="https://neetforge.in/"` in static HTML. | Googlebot and non-JS search engines de-index high-value feature pages (`/neet-mock-tests`, `/neet-daily-practice`, `/neet-revision`), failing to rank for high-volume student queries. |
| **Mobile Core Web Vitals** | 2.11 MB uncompressed JS bundle parsed on every landing. | Mobile aspirants on 3G/4G connections experience 3–5 seconds of main-thread freezing, leading to bounce rates > 60% and lower Google Search ranking signals. |
| **Edge Security & Performance** | Hashed static assets served with `max-age=0, must-revalidate`. Security headers missing. | Increases server edge costs and round-trip latencies; vulnerable to clickjacking and MIME-sniffing exploits. |
| **Knowledge Graph & SERP Snippets** | Fictitious `SearchAction` and duplicate rating schemas without review backing. | Violates Google Search Essentials (Spam Policies), risking algorithmic demotion or manual actions on rich results. |
| **Crawl Budget Allocation** | Utility auth pages (`/app/login`, `/app/signup`) indexed in `sitemap.xml`. | Bots waste limited crawl quotas on thin login screens instead of indexable educational landing pages. |

---

## 4. Functional Requirements

### FR-1: Missing Head Static Assets & Social Graph Media Resolution
- **Description:** Ensure all static assets referenced in `<head>` physically exist in `/public` and serve their correct binary MIME types without falling back to `index.html`.
- **Target Assets:**
  - `og-image.png`: High-resolution social graph preview image (1200x630 px, PNG format, optimized < 250 KB) featuring clear branding, NEET 2025 messaging, and platform pillars.
  - `favicon.svg`: Valid scalable vector icon for modern high-DPI desktop and mobile browser tabs.
  - `apple-touch-icon.png`: 180x180 px PNG icon for iOS home screen bookmarks and Safari mobile shortcuts.
  - `manifest.json`: Valid Web App Manifest JSON with matching metadata, name, icons, theme colors (`#2563EB`), and standalone display mode.
- **System Behavior:**
  - Direct GET requests to `https://neetforge.in/og-image.png` MUST return HTTP 200 with `Content-Type: image/png`.
  - Direct GET requests to `https://neetforge.in/favicon.svg` MUST return HTTP 200 with `Content-Type: image/svg+xml`.
  - Direct GET requests to `https://neetforge.in/apple-touch-icon.png` MUST return HTTP 200 with `Content-Type: image/png`.
  - Direct GET requests to `https://neetforge.in/manifest.json` MUST return HTTP 200 with `Content-Type: application/json` and parse without syntax errors.

---

### FR-2: Server Configuration & HTTP Security/Caching Headers (`vercel.json`)
- **Description:** Implement an edge routing and header specification in `vercel.json` that sets strict enterprise security headers, configures immutable caching for content-hashed build assets, and restricts fallback rewrites exclusively to internal application paths.
- **Caching Rules:**
  - Route pattern `/assets/(.*)` MUST serve header `Cache-Control: public, max-age=31536000, immutable`.
  - Dynamic index routes MUST continue serving `Cache-Control: public, max-age=0, must-revalidate`.
- **Security Headers:**
  - `X-Content-Type-Options: nosniff` (Prevent MIME-sniffing exploits).
  - `X-Frame-Options: SAMEORIGIN` (Clickjacking mitigation).
  - `Referrer-Policy: strict-origin-when-cross-origin` (Preserve organic analytics while guarding student privacy).
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Disable unused device sensors).
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (Qualify for HSTS preload list).
- **Rewrites & Fallbacks:**
  - Narrow fallback rewrites from global `/(.*)` to `/app/(.*)` so missing static assets and dead routes trigger real 404 responses rather than Soft 404 HTML masks.

---

### FR-3: Code-Splitting & Marketing Bundle Optimization (`App.tsx` React.lazy)
- **Description:** Restructure application routing using `React.lazy` and dynamic imports so that public marketing routes and authenticated internal modules are decoupled into distinct asynchronous chunks.
- **Optimization Boundaries:**
  - Eagerly load the main public landing page (`Home.tsx`) for instant first-paint delivery.
  - Lazily load individual marketing feature routes (`DailyPractice`, `MockTests`, `AiAnalysis`, `FormulaCards`, `Revision`, `FAQ`, `About`, `Contact`, `Careers`, `Campus`, `PrivacyPolicy`, `Terms`).
  - Lazily load heavy authenticated modules (`/app/*`), isolating Recharts, test playback components, and heavy state containers.
- **Rollup Chunking:**
  - Configure manual vendor chunks (`vendor-react`, `vendor-icons`, `vendor-charts`) in `vite.config.ts` to prevent shared dependencies from bloating the primary entry chunk.
- **Performance Criteria:**
  - Initial JS downloaded on any marketing landing page MUST be reduced from 2.11 MB to < 100 KB gzipped.
  - Smooth fallback transitions using `<Suspense>` without visual flicker.

---

### FR-4: Static Pre-Rendering (SSG) for Marketing Pages
- **Description:** Implement static pre-rendering across all 13 public marketing routes during build time so search crawlers and social scrapers receive distinct, fully rendered HTML documents containing page-specific titles, descriptions, and canonical URLs.
- **Target Routes for Pre-Rendering (13 URLs):**
  1. `/` (Homepage)
  2. `/neet-daily-practice`
  3. `/neet-mock-tests`
  4. `/neet-ai-analysis`
  5. `/neet-formula-cards`
  6. `/neet-revision`
  7. `/about`
  8. `/contact`
  9. `/careers`
  10. `/campus`
  11. `/faq`
  12. `/privacy-policy`
  13. `/terms`
- **Output Requirements:**
  - Each pre-rendered route MUST output an autonomous `index.html` file in the build distribution directory.
  - Each route MUST feature its own distinct `<title>` tag and `<link rel="canonical" href="https://neetforge.in/{route}" />` matching the specific URL in raw HTML.
  - No subpage raw HTML may contain `<link rel="canonical" href="https://neetforge.in/" />` unless it is the root homepage.
  - Semantic content, H1 headers, and FAQ answers must be present in raw HTML prior to JavaScript execution.

---

### FR-5: Schema.org Structured Data & FAQ Rich Snippets
- **Description:** Modernize and clean structured data across the site, removing duplicate conflicting scripts and adhering to Google Rich Results guidelines.
- **De-duplication & Hygiene:**
  - Remove hardcoded redundant schema blocks from root `index.html`.
  - Inject unique, validated JSON-LD schema per route at the page/component level.
  - Eliminate fictitious `SearchAction` markup on `WebSite` entity until a dedicated on-site search results view is built.
  - Remove unsupported hardcoded `aggregateRating` (1200 reviews) on `SoftwareApplication` to avoid spam policy violations.
  - Populate valid `sameAs` social authority links (`https://twitter.com/neetforge`, `https://youtube.com/@neetforge`, `https://t.me/neetforge`).
- **FAQPage Schema & Semantic Accessibility:**
  - Provide complete, verified `FAQPage` schema on `/faq` with 12 structured Q&A pairs matching visible copy.
  - Ensure accordion answers exist in the DOM with accessible markup so bots can crawl textual content without triggering synthetic mouse clicks.

---

### FR-6: Search Engine Crawl Budget Optimization, Robots.txt & Sitemap Hygiene
- **Description:** Configure crawl rules and sitemap listings to focus bot indexation purely on high-value public content while shielding private utility portals.
- **Sitemap Refinements:**
  - Remove utility authentication routes (`/app/login`, `/app/signup`) from `/public/sitemap.xml`.
  - Include all 13 canonical pre-rendered marketing URLs with appropriate `changefreq` and priority values (Homepage: 1.0, Core Features: 0.9, Information: 0.8, Legal: 0.4).
- **Robots.txt Hygiene:**
  - Set explicit `Disallow: /app/` directive in `/public/robots.txt` to prevent automated spiders from crawling authenticated dashboards, practice sessions, and settings.
  - Point directly to the canonical sitemap (`Sitemap: https://neetforge.in/sitemap.xml`).
  - Add `<meta name="robots" content="noindex, nofollow" />` to authentication views to ensure compliance.

---

## 5. Non-Functional Requirements (NFRs)
- **NFR-1: Performance & Core Web Vitals:** Marketing page Largest Contentful Paint (LCP) must occur in under 1.8s on 4G networks; Cumulative Layout Shift (CLS) < 0.05.
- **NFR-2: Search Engine Compliance:** Raw HTML must pass 100% of checks in Google Search Console URL Inspection and the Rich Results Test tool with zero warnings.
- **NFR-3: Social Media Compatibility:** Opengraph and Twitter card validators must confirm 200 OK image parsing for WhatsApp, Facebook, LinkedIn, and Twitter/X.
- **NFR-4: Security & Edge Compliance:** SecurityHeaders.com score must reach Grade A/A+ post-deployment.
- **NFR-5: Backward Compatibility:** All existing client-side routing, protected app routes, and state persistence must remain unaffected.

---

## 6. Risk Assessment & Mitigation Strategy
| Risk | Probability | Impact | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Pre-rendering build pipeline timeouts** | Medium | High | Limit concurrent rendering routes (`maxConcurrentRoutes: 4`) and use lightweight headless Puppeteer configuration. |
| **Accidental caching of dynamic user data** | Low | Critical | Restrict `immutable` cache headers strictly to `/assets/(.*)` and enforce `no-store`/`must-revalidate` on HTML and API proxies. |
| **Route regression on authenticated `/app/*` paths** | Low | High | Maintain explicit `/app/(.*)` SPA rewrite rule in `vercel.json` and verify protected route redirections. |
