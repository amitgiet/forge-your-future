# Story: SEO-2 — Production HTTP Security & Immutable Cache-Control Headers

## Overview
- **Story Key:** `SEO-2`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** DevOps / Edge Infrastructure Configuration
- **Story Points:** 3
- **Priority:** High

---

## User Story Statement
**As a** student or search engine crawler visiting NEETFORGE,  
**I want** the platform to enforce modern security safeguards and store unchanging application assets in my local browser cache,  
**So that** my connection is shielded from malicious web attacks and subsequent page visits load near-instantly without unnecessary data re-downloads.

---

## Business Summary & Description
Modern web applications must protect users against security vulnerabilities like clickjacking and content-type sniffing while maximizing delivery speed through content delivery networks (CDNs). Currently, the platform's deployment configuration serves versioned application scripts with instructions to re-check the server on every visit, adding delay to mobile study sessions. Additionally, several recommended browser security headers are not yet configured.

This story updates the hosting configuration to apply strict browser security protections, cache versioned static assets for one year, and ensure dead URLs return true error codes rather than masking missing pages.

---

## Acceptance Criteria
1. **Long-Term Asset Caching:**
   - All version-controlled static application assets (scripts and stylesheets) must be served with instructions to cache for up to one year without server revalidation.
2. **Browser Security Protections:**
   - Responses must enforce content-type protection to prevent malicious script injection.
   - Responses must prevent unauthorized third-party sites from framing the application inside hidden frames.
   - Modern referrer policies must be applied to protect student privacy while maintaining accurate traffic attribution.
   - Hardware sensor permissions (camera, microphone, location) must be restricted on public pages.
   - Transport security must be enforced with preload directives for browser protection lists.
3. **Accurate Error Reporting for Dead Links:**
   - Requests for non-existent files or invalid URLs must return true not-found status codes rather than masking them with successful page content.

---

## Out of Scope
- Backend API microservice authentication tokens or database encryption.
- Third-party analytics script source modification.
- Custom domain DNS records or SSL certificate renewals (handled via domain registrar/DNS console).

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 2 (Server & Security Headers Audit):**
  - Highlighted missing headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
  - Documented asset caching failure on 2.11 MB JS bundle (`max-age=0, must-revalidate` instead of immutable caching).
  - Documented Soft 404 behavior where missing paths return HTTP 200 OK with `index.html`.
- **Section 7 (Priority 3):** Server Configuration & Headers (`vercel.json`).
