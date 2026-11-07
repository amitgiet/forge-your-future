# Technical Design Specification: SEO-1-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-1-FE`
- **Parent Story:** `SEO-1` (Missing Head Static Assets & Social Graph Media Resolution)
- **Primary Discipline:** Digital Media & Frontend Head Asset Architecture
- **Objective:** Eliminate the critical 404/HTML-fallback failure on head assets by creating valid, production-grade static binary and vector assets in `/public` and wiring them correctly into `/index.html`.

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/public/og-image.png` | **CREATE** | 1200x630 px PNG (< 250 KB) high-contrast Open Graph social card |
| `/public/favicon.svg` | **CREATE** | Scalable SVG vector icon for modern browser address bars |
| `/public/apple-touch-icon.png` | **CREATE** | 180x180 px PNG for iOS home screen bookmarks |
| `/public/manifest.json` | **CREATE** | Web App Manifest JSON with correct icon paths and standalone display |
| `/index.html` | **MODIFY** | Link `apple-touch-icon.png`, `favicon.svg`, `favicon.ico`, and `manifest.json` |

---

## 3. Technical Contract & Asset Specifications

### 3.1 `/public/og-image.png` (Social Preview Card)
- **Dimensions:** Exactly `1200 × 630` pixels (standard 1.91:1 aspect ratio).
- **Format:** `image/png` (PNG-24 or optimized 8-bit PNG).
- **Target File Size:** ≤ 200 KB (maximum allowable threshold: 250 KB).
- **Visual Composition:**
  - **Background:** Deep navy / slate gradient (`#0B0F19` to `#1E293B`).
  - **Brand Identifier:** Large bold **NEETFORGE** logotype in electric blue (`#2563EB`) and white.
  - **Badge / Category:** "AI-Powered NEET 2025 Preparation Platform".
  - **Core Value Proposition Pillars:**
    - ⚡ Chapter-Wise Daily Practice (DPP)
    - 🎯 720-Mark NTA Pattern Mock Tests
    - 🧠 Spaced Repetition (NeuronZ) Revision
    - 📊 AI Weak-Area & Accuracy Diagnostics
  - **Trust Indicator:** "Free to Start • Trusted by 10,000+ Aspirants".

### 3.2 `/public/favicon.svg` (Scalable Vector Favicon)
- **Format:** Standard XML SVG (`image/svg+xml`).
- **ViewBox:** `0 0 32 32`.
- **Source Structure:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
  <defs>
    <linearGradient id="nf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#nf-grad)"/>
  <path d="M18.5 4L8 17.5h6.5L13.5 28 24 14.5h-6.5L18.5 4z" fill="#FFFFFF"/>
</svg>
```

### 3.3 `/public/apple-touch-icon.png` (iOS Home Screen Icon)
- **Dimensions:** Exactly `180 × 180` pixels.
- **Format:** `image/png`.
- **Target File Size:** ≤ 30 KB.
- **Design:** Brand gradient square (`#2563EB` to `#1D4ED8`) with centered white lightning/forge glyph and no transparency (iOS applies default corner radius).

### 3.4 `/public/manifest.json` (Web App Manifest)
```json
{
  "short_name": "NEETFORGE",
  "name": "NEETFORGE — AI-Powered NEET Preparation",
  "description": "Daily DPP, NTA pattern mock tests, AI weak-area detection, and spaced repetition revision for NEET aspirants.",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/apple-touch-icon.png",
      "type": "image/png",
      "sizes": "180x180"
    }
  ],
  "start_url": "/?source=pwa",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "display": "standalone",
  "orientation": "portrait"
}
```

### 3.5 `/index.html` Head Tag Updates
Modify the `<head>` section to explicitly declare all icon relationships:
```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#2563EB" />
```

---

## 4. Edge Cases & Failure Traps Avoided
1. **The SPA 200 OK HTML Fallback Trap:** Without the physical files in `/public`, Vercel edge rewrites return `index.html` (5,228 bytes) with status 200. Social card scrapers fail silently. Placing the static assets in `/public` ensures Vercel bypasses rewrites and serves the raw binary directly with correct MIME types.
2. **SVG XML Parsing Errors:** Ensure `/public/favicon.svg` includes XML namespaces (`xmlns="http://www.w3.org/2000/svg"`) and closed tags to avoid browser console parse errors.
3. **Apple Touch Icon Transparency:** iOS requires opaque backgrounds; transparent touch icons display with black backgrounds on Apple home screens.
