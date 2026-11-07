# Story: SEO-4 — Static Pre-Rendering (SSG) for Marketing Routes & Raw HTML Canonical Isolation

## Overview
- **Story Key:** `SEO-4`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** Frontend Build Engineering / Search Engine Optimization
- **Story Points:** 8
- **Priority:** Highest (Critical Blocker)

---

## User Story Statement
**As a** search engine crawler (Googlebot, Bingbot, DuckDuckGo),  
**I want** each public marketing and informational page on NEETFORGE to serve complete, ready-to-read text, a distinct title, and its own unique canonical address in the initial page response,  
**So that** each feature page ranks for its specific NEET keywords (such as mock tests, daily practice, and formula cards) without being de-indexed as a duplicate of the homepage.

---

## Business Summary & Description
Currently, every public page on the site sends the exact same initial HTML shell to search engine crawlers. This shared code labels every single page as an identical duplicate of the homepage and repeats the homepage title. Because search engines evaluate these initial signals before running complex scripts, high-value pages (such as mock tests, revision systems, and practice problems) are actively excluded from search results.

This story adds static pre-rendering to the deployment build process. It automatically produces distinct, fully populated web pages for all 13 public marketing routes, ensuring that search engines immediately see unique titles, proper canonical links, and complete study guide content.

---

## Acceptance Criteria
1. **Unique Canonical Addresses in Initial Code:**
   - Every one of the 13 public marketing pages must output its own unique, self-referencing canonical URL in the initial server response.
   - Subpages must never point their canonical tag to the homepage.
2. **Page-Specific Titles and Meta Summaries:**
   - Each public page must display a unique, descriptive page title and summary tailored to its subject matter directly in the initial HTML.
3. **Readable Text Content Before Script Execution:**
   - The initial response must contain readable page text, section headings, and informational answers rather than an empty container waiting for scripts to run.
4. **Coverage Across Public Pages:**
   - Pre-rendering must cover all 13 designated public routes: Homepage, Daily Practice, Mock Tests, AI Analysis, Formula Cards, Revision System, About, Contact, Careers, Campus, FAQ, Privacy Policy, and Terms.
5. **Preserved Interactive Functionality:**
   - When visitors open pre-rendered pages, interactive client-side features must seamlessly activate without visual disturbance or broken links.

---

## Out of Scope
- Pre-rendering authenticated student screens (such as personal practice sessions, test results, or account settings).
- Dynamic server-side rendering (SSR) infrastructure or live Node.js application servers (pre-rendering is performed at build time).
- Multilingual translation of page copy into regional languages.

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 1 (Full Sitemap & URL Health Crawl):**
  - Identified "The Canonical Cannibalization Trap" where all 15 raw URLs serve `<link rel="canonical" href="https://neetforge.in/" />`.
  - Documented 7 routes with unchanged client-side titles locking to homepage metadata.
- **Section 6 (Current Client-Side Rendering vs Crawler Reality):**
  - Outlined crawler drop-off and indexation failures due to empty `<div id="root"></div>`.
- **Section 7 (Priority 4):** Pre-Rendering / Static Site Generation (SSG) for Marketing Pages.
