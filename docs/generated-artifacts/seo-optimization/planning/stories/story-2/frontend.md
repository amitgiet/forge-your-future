# Technical Design Specification: SEO-2-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-2-FE`
- **Parent Story:** `SEO-2` (Production HTTP Security & Immutable Cache-Control Headers)
- **Primary Discipline:** DevOps / Edge Infrastructure Configuration
- **Objective:** Configure Vercel Edge routing rules in `vercel.json` to enforce 1-year immutable caching on content-hashed Vite build assets, inject enterprise-grade HTTP security headers, and constrain SPA rewrite rules to eliminate soft 404 masking.

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/vercel.json` | **MODIFY** | Define immutable cache rules for `/assets/(.*)`, security headers for `/(.*)`, edge redirects for legacy routes, and scoped SPA rewrite for `/app/(.*)` |

---

## 3. Technical Implementation Specification

### 3.1 Complete `vercel.json` Architecture
Replace the minimal 8-line `vercel.json` with the following production specification:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/(dashboard|login|signup|onboarding|tests|social|profile|ai-assistant|revision|curriculum-browser|pyq-marked-ncert|mock-analyzer|ncert-search|my-learning-paths|doubts|formula-cards|quiz-generator|study-plan|leaderboard|daily-challenge|chat|add-friend|test|quiz|analytics|practice-session|learning-path|curriculum-quiz-instructions)(.*)",
      "destination": "/app/$1$2",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/app/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Architectural Rationale & Mechanics

### 4.1 Immutable Cache Strategy (`/assets/(.*)`)
- **Problem:** Vite generates content hashes in filenames (e.g. `index-BmsPc7ir.js`, `index-DpFobqox.css`). Serving them with `max-age=0, must-revalidate` causes unnecessary 304 conditional request round-trips for mobile users.
- **Solution:** `public, max-age=31536000, immutable` tells browsers and edge CDN nodes to cache the file for 365 days. If code changes, Vite produces a new hash, naturally invalidating the URL without cache busting bugs.

### 4.2 Security Headers Stack
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing, protecting against malicious script execution disguised as images/text.
- `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking attacks by forbidding third-party iframe embedding.
- `Referrer-Policy: strict-origin-when-cross-origin`: Shields student query parameters during external transitions while preserving organic search referrer data.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Disables unauthorized hardware sensor probing on public marketing pages.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`: Instructs browsers to enforce HTTPS for 2 years and qualifies domain for the HSTS preload list.

### 4.3 Soft 404 Prevention via Rewrite Scoping
- **Problem:** The previous rewrite rule `{"source": "/(.*)", "destination": "/index.html"}` caught EVERY request. Missing assets (e.g., `/assets/non-existent.js`) and dead URLs (e.g., `/random-dead-path`) returned HTTP 200 with the 5.2 KB `index.html`. Google Search Console classifies this as a Soft 404, eroding crawl budget and indexing authority.
- **Solution:**
  1. Static marketing pages exist directly on disk in `/dist/` as pre-rendered HTML files (`/dist/about/index.html`, etc.). Vercel automatically serves them.
  2. Authenticated dynamic client-side SPA routes live exclusively under `/app/(.*)` and are rewritten to `/index.html`.
  3. Legacy root paths are permanently 308-redirected at the CDN edge to `/app/*`.
  4. Any non-existent file or unknown public route (e.g., `/non-existent-xyz`) falls through and returns a genuine HTTP `404 Not Found`.

---

## 5. Edge Cases & Failure Traps Avoided
1. **Broken Client-Side Routing for App:** Scoping rewrites strictly to `/app/(.*)` allows student subroutes (`/app/quiz/start`, `/app/tests/pdf-viewer`) to hydrate properly via `react-router-dom` without breaking 404 behavior on public routes.
2. **Infinite Redirect Loops:** Ensure regex capture groups in the `redirects` block do not match routes already prefixed with `/app/`.
