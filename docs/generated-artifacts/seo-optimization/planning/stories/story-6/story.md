# Story: SEO-6 — Search Crawl Budget Optimization, Robots.txt & Clean Sitemap Hygiene

## Overview
- **Story Key:** `SEO-6`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** DevOps / Technical Search Engine Optimization
- **Story Points:** 2
- **Priority:** Medium

---

## User Story Statement
**As a** search engine webmaster and automated indexing spider,  
**I want** explicit crawl instructions and an accurate index of all public educational pages,  
**So that** I focus crawling activity purely on high-value study resources, mock tests, and curriculum guides rather than wasting resources on utility login screens.

---

## Business Summary & Description
Search engines allocate a finite crawling quota to every website. If spiders spend time scanning thin utility screens, such as login and account registration pages, they have less capacity to discover and re-index updated educational content. Currently, the site map submitted to search engines lists student login and registration pages, and the search instruction file lacks clear boundaries around the private student application area.

This story updates the sitemap to list only the 13 canonical public marketing and educational pages, adds explicit instructions forbidding spiders from crawling private account screens, and adds directives preventing private screens from appearing in public search results.

---

## Acceptance Criteria
1. **Clean Public Sitemap:**
   - The sitemap must list all 13 canonical public marketing and informational pages with appropriate priority rankings.
   - Private account screens (such as login and registration) must be removed from the public sitemap.
2. **Clear Spiders Directives:**
   - The search instructions file must explicitly restrict automated spiders from indexing the private student application directories.
   - The file must clearly publish the direct address of the official sitemap.
3. **No-Index Directives on Private Screens:**
   - Private login and registration views must include directives instructing search engines not to index or display them in public search results.
4. **Standard Format Compliance:**
   - The sitemap must adhere to XML standard formatting without broken links or invalid tags.

---

## Out of Scope
- Dynamic automated generation of sitemaps from content databases (pages are static marketing views).
- Image or video-specific XML sitemaps.
- Crawl management for subdomains or third-party partner portals.

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 1 (Full Sitemap & URL Health Crawl):**
  - Point 4: Auth Pages in Sitemap (`/app/login` and `/app/signup` listed with priority 0.6 and 0.7, creating thin-content signals and wasting crawl quota).
- **Section 7 (Priority 7):** Robots.txt & Sitemap Cleanup.
