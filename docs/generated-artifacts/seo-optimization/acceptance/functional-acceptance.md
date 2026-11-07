# Functional Acceptance Criteria: SEO 10/10 Optimization Epic (`SEO-EPIC-01`)

This document defines the formal behavioral specifications and Given-When-Then acceptance criteria across all six functional user stories in the NEETFORGE Technical SEO Epic.

---

## Story 1 (SEO-1): Missing Head Static Assets & Social Graph Media Resolution

### Scenario 1.1: Direct Fetch of Open Graph Preview Image
- **Given** a social media crawler (WhatsApp, Twitterbot, LinkedInBot) or user browser requests the social card image
- **When** an HTTP `GET` request is sent to `https://neetforge.in/og-image.png`
- **Then** the server must respond with HTTP `200 OK`
- **And** the `Content-Type` header must be `image/png`
- **And** the payload must be a valid binary PNG image (1200x630 resolution, file size < 250 KB)
- **And** the response body must NOT contain HTML markup (`<!doctype html>`).

### Scenario 1.2: Direct Fetch of Scalable Favicon
- **Given** a modern browser loads NEETFORGE
- **When** the browser queries `https://neetforge.in/favicon.svg`
- **Then** the server must return HTTP `200 OK`
- **And** the `Content-Type` header must be `image/svg+xml`
- **And** the SVG document must be well-formed XML and render without console parsing errors.

### Scenario 1.3: Direct Fetch of Apple Touch Icon
- **Given** an iOS user bookmarks NEETFORGE to their mobile home screen
- **When** Safari requests `https://neetforge.in/apple-touch-icon.png`
- **Then** the server must respond with HTTP `200 OK`
- **And** the `Content-Type` header must be `image/png`
- **And** the image dimensions must be 180x180 pixels.

### Scenario 1.4: Web App Manifest Validity
- **Given** a Chromium-based browser checks PWA installation criteria
- **When** the browser fetches `https://neetforge.in/manifest.json`
- **Then** the server must return HTTP `200 OK` with `Content-Type: application/json`
- **And** the JSON body must parse successfully without syntax errors
- **And** the manifest must define `name`, `short_name`, `icons`, `start_url`, `theme_color`, and `display: "standalone"`.

---

## Story 2 (SEO-2): Production HTTP Security & Immutable Cache-Control Headers

### Scenario 2.1: Long-Term Caching on Content-Hashed Build Assets
- **Given** a user or search bot downloads Vite-compiled JavaScript or CSS files
- **When** an HTTP `GET` request is made to `/assets/index-[hash].js` or `/assets/index-[hash].css`
- **Then** the response must return HTTP `200 OK`
- **And** the `Cache-Control` header must exactly equal `public, max-age=31536000, immutable`.

### Scenario 2.2: Mandatory Security Headers on HTML Responses
- **Given** an HTTP client requests any document path on `https://neetforge.in`
- **When** the response headers are inspected
- **Then** the following security headers must be strictly present:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Scenario 2.3: Elimination of Soft 404 on Missing Assets and Invalid Paths
- **Given** an automated crawler or browser requests a non-existent asset or route (e.g., `/assets/non-existent-lib.js` or `/non-existent-page-xyz-404`)
- **When** the edge server processes the request
- **Then** the server must NOT return HTTP `200 OK` with `index.html` fallback
- **And** the edge server must return HTTP `404 Not Found`.

---

## Story 3 (SEO-3): Route-Level Code-Splitting & Marketing Bundle Size Optimization

### Scenario 3.1: Public Marketing Page First Load Footprint
- **Given** a prospective student lands on the NEETFORGE homepage (`https://neetforge.in/`)
- **When** the initial HTML and referenced JavaScript chunks are downloaded
- **Then** the total uncompressed JavaScript required for the initial marketing route must not exceed 250 KB (less than 100 KB gzipped)
- **And** heavy authenticated libraries (Recharts, full Lucide suite, student dashboard components) must NOT be included in the initial entry bundle.

### Scenario 3.2: Asynchronous Lazy Loading of Marketing Routes
- **Given** a user is on the homepage
- **When** the user clicks a navigation link to `/neet-mock-tests`
- **Then** the browser must dynamically load only the chunk required for `MockTests`
- **And** a smooth loading state must render seamlessly via React `<Suspense>` without layout shift or UI flickering.

### Scenario 3.3: Dynamic Separation of Authenticated App Routes
- **Given** a visitor navigates directly to `/app/dashboard` or `/app/tests`
- **When** the route resolves
- **Then** the application chunk for the internal portal must load asynchronously on demand without affecting public route bundle caches.

---

## Story 4 (SEO-4): Static Pre-Rendering (SSG) for Public Marketing Routes

### Scenario 4.1: Distinct Canonical URLs in Raw HTML
- **Given** a search crawler fetches raw HTML without executing JavaScript
- **When** the crawler requests any of the 13 public marketing URLs (e.g., `https://neetforge.in/neet-mock-tests`)
- **Then** the raw HTML returned from the server must contain `<link rel="canonical" href="https://neetforge.in/neet-mock-tests" />`
- **And** the raw HTML must NOT point canonical to `https://neetforge.in/` (unless requesting the homepage itself).

### Scenario 4.2: Page-Specific Document Titles in Raw HTML
- **Given** an automated bot evaluates document metadata from raw HTML
- **When** `https://neetforge.in/neet-daily-practice` is fetched via curl or search scraper
- **Then** the `<title>` tag in raw HTML must contain `NEET Daily Practice Problems (DPP)`
- **And** it must NOT serve the generic homepage title `NEETFORGE — AI-Powered NEET Preparation App 2025`.

### Scenario 4.3: Fully Rendered DOM for Crawlers
- **Given** a search engine crawler that does not execute heavy client-side JavaScript (e.g., Bingbot, DuckDuckGo)
- **When** it fetches any of the 13 marketing pages
- **Then** the response must contain meaningful semantic HTML (`<main>`, `<h1>`, `<h2>`, paragraphs, FAQ text)
- **And** the body must NOT consist merely of an empty `<div id="root"></div>`.

---

## Story 5 (SEO-5): Schema.org Structured Data Consolidation & FAQPage Rich Snippets

### Scenario 5.1: Elimination of Duplicate Structured Data Blocks
- **Given** Googlebot renders `https://neetforge.in/`
- **When** the page head and body are inspected for JSON-LD schemas
- **Then** exactly ONE unified `@graph` structured data script must be found
- **And** there must be NO redundant secondary `SoftwareApplication` or `Organization` blocks injected post-hydration.

### Scenario 5.2: Compliance with Google Search Essentials
- **Given** the structured data markup on `https://neetforge.in/`
- **When** parsed by the Google Rich Results Test
- **Then** the `WebSite` entity must NOT declare a fictitious `SearchAction`
- **And** the `SoftwareApplication` entity must NOT declare hardcoded `aggregateRating` without individual verifiable review records
- **And** the `Organization` entity must declare verified `sameAs` social profile URLs.

### Scenario 5.3: FAQPage Rich Snippet Eligibility
- **Given** a user or Googlebot visits `https://neetforge.in/faq`
- **When** the structured data is inspected
- **Then** a valid `FAQPage` schema must be present with all 12 questions and complete answers
- **And** the question and answer text in the schema must exactly match the accessible text present in the page DOM.

---

## Story 6 (SEO-6): Search Engine Crawl Budget Optimization, Robots.txt & Clean Sitemap Hygiene

### Scenario 6.1: Exclusion of Authentication Routes from Sitemap
- **Given** a search engine reads `https://neetforge.in/sitemap.xml`
- **When** all `<loc>` elements are evaluated
- **Then** neither `https://neetforge.in/app/login` nor `https://neetforge.in/app/signup` must be listed
- **And** all 13 pre-rendered public marketing and informational URLs must be explicitly present with appropriate priority and change frequency tags.

### Scenario 6.2: Clean Disallow Directives in Robots.txt
- **Given** a search bot reads `https://neetforge.in/robots.txt`
- **When** checking permissions for private student routes
- **Then** the file must contain `Disallow: /app/`
- **And** the file must contain a valid `Sitemap: https://neetforge.in/sitemap.xml` link.

### Scenario 6.3: Noindex Metadata on Auth Screens
- **Given** a crawler accesses `/app/login` or `/app/signup` directly
- **When** the HTML `<head>` is rendered
- **Then** it must include `<meta name="robots" content="noindex, nofollow" />`.
