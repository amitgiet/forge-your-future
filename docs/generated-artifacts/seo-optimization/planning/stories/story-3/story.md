# Story: SEO-3 — Route-Level Code-Splitting & Marketing Bundle Optimization

## Overview
- **Story Key:** `SEO-3`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** Frontend Software Architecture
- **Story Points:** 5
- **Priority:** High

---

## User Story Statement
**As a** mobile NEET aspirant using a standard mobile phone and mobile internet connection,  
**I want** public marketing pages, revision guides, and mock test information to load immediately without downloading the entire student testing portal,  
**So that** I can review study resources without frustrating page delays, device battery drain, or screen freezing.

---

## Business Summary & Description
Currently, when a new visitor opens any public page on the site, their browser is forced to download the entire application in a single file exceeding 2 MB. This package includes complex charting tools, mock exam playback engines, and private student dashboard code that a first-time visitor does not yet need. On mobile devices, this causes noticeable screen delay and high bounce rates.

This story reorganizes the front-end code delivery so that marketing visitors download only the lightweight code needed for the specific page they are viewing, while heavier student testing tools load quietly in the background when the user logs in.

---

## Acceptance Criteria
1. **Lightweight First-Time Page Load:**
   - The initial code downloaded by a visitor on public marketing pages must be significantly reduced to under 100 KB gzipped (down from over 2 MB).
2. **On-Demand Loading for Internal Tools:**
   - Heavy features (such as practice dashboards, charting modules, and test session simulators) must only be downloaded when an authenticated student opens those specific sections.
3. **Smooth Screen Transitions:**
   - Navigating between public pages must transition smoothly with clean placeholder loading states rather than abrupt screen jumps or layout shifts.
4. **Isolated Third-Party Dependencies:**
   - Shared third-party libraries must be separated cleanly so that updates to one section do not invalidate cached files for other sections.

---

## Out of Scope
- Redesigning the visual layouts or color schemes of the student testing screens.
- Refactoring internal Redux state slices or API communication services.
- Offline storage of test questions (handled in app-specific milestones).

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 6 (SPA / Pre-Rendering / Crawl Budget Architecture):**
  - Highlighted the single monolithic 2.11 MB uncompressed JS bundle (`index-BmsPc7ir.js`) causing 3–5 second main-thread freezes on mobile connections.
- **Section 7 (Priority 5):** Route Code-Splitting in `App.tsx` and Rollup chunking rules.
