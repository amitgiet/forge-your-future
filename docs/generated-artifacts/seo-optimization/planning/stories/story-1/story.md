# Story: SEO-1 — Missing Head Static Assets & Social Graph Media Resolution

## Overview
- **Story Key:** `SEO-1`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** Visual Design / Digital Assets / Frontend
- **Story Points:** 3
- **Priority:** Highest (Critical Blocker)

---

## User Story Statement
**As a** student or educator sharing NEETFORGE links on messaging platforms (WhatsApp, Telegram) and social networks (Twitter/X, LinkedIn),  
**I want** rich link previews to display an attractive, official brand image, logo, and summary,  
**So that** recipients recognize the official platform immediately and are confident clicking through to explore study materials.

---

## Business Summary & Description
Currently, when any link to NEETFORGE is shared across messaging apps or social media, the preview card renders completely blank or broken. This occurs because the primary graphic assets referenced in the site header do not exist as static files, causing the server to return generic web page code instead of images. In addition, browser icons and mobile bookmark graphics fail to load properly.

This story delivers authentic, production-grade brand assets so that social link previews, browser tabs, and mobile home screen shortcuts work reliably across all platforms.

---

## Acceptance Criteria
1. **Open Graph Social Graphic:**
   - A dedicated 1200x630 pixel brand preview image must be served directly with an image format (`image/png`).
   - The graphic must clearly display the NEETFORGE logo, tagline, and key learning features.
   - The file size must be optimized below 250 KB for quick loading across mobile cellular networks.
2. **Scalable Vector Favicon:**
   - The browser tab icon must load as a valid SVG vector graphic without syntax or parsing issues.
3. **Mobile Touch Icon:**
   - Apple devices bookmarking the site must receive a crisp 180x180 pixel PNG icon.
4. **Web App Manifest:**
   - Mobile and desktop browsers querying the app manifest must receive valid configuration data enabling home screen installation and native theme colors.
5. **No HTML Masks:**
   - Direct requests for any of these media assets must never return web page markup or fallback scripts.

---

## Out of Scope
- Dynamic automated generation of per-question or per-test social preview cards (future enhancement).
- Modification of existing desktop favicon ICO file (`favicon.ico` is already intact and valid).
- Native iOS or Android binary application packaging.

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 3 (Social Graph & Head Asset Integrity Audit):**
  - Identified `og-image.png`, `favicon.svg`, `apple-touch-icon.png`, and `manifest.json` as missing files returning fake HTTP 200 responses containing 5.2 KB `index.html`.
  - Noted failure of social link preview generation across WhatsApp, Telegram, LinkedIn, and Twitter/X.
- **Section 7 (Priority 2):** Fix Head Assets & Missing Static Files.
