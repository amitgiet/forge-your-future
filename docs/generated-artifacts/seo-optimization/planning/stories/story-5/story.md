# Story: SEO-5 — Schema.org Structured Data Consolidation & FAQPage Rich Snippets

## Overview
- **Story Key:** `SEO-5`
- **Epic Reference:** `SEO-EPIC-01`
- **Discipline:** Frontend Development / Search Engine Optimization
- **Story Points:** 5
- **Priority:** High

---

## User Story Statement
**As an** aspiring NEET candidate searching Google for exam preparation tools and FAQs,  
**I want** NEETFORGE search results to show verified organization details, clear app features, and expanded FAQ answers directly in Google search snippets,  
**So that** I receive accurate, transparent answers immediately and trust the platform as an established educational resource.

---

## Business Summary & Description
Structured data helps search engines understand an organization's identity and qualify pages for enhanced search snippets, such as expandable FAQ answer boxes. At present, the site transmits two conflicting sets of structured data that contradict each other. Furthermore, the markup references a search feature that does not exist and includes review ratings that lack published individual student reviews, which violates search engine guidelines and risks penalization.

This story consolidates all search markup into a single, clean specification on the homepage, removes unsupported rating claims and non-functional search features, links verified official social media profiles, and implements valid FAQ rich snippet markup matching the questions on the site.

---

## Acceptance Criteria
1. **Single Unified Structured Markup:**
   - The homepage must output exactly one unified structured data graph that describes the organization, website, and educational application.
   - Redundant duplicate scripts injected during page loading must be completely eliminated.
2. **Search Guidelines Compliance:**
   - Declarations for internal site search must be omitted until an on-site search results screen is actively deployed.
   - Unverified review rating claims must be removed to avoid search engine spam violations.
   - Official social media channels (YouTube, Twitter/X, Telegram) must be accurately linked to establish organizational authority.
3. **FAQ Rich Snippet Eligibility:**
   - The dedicated FAQ page must include verified structured markup covering all 12 frequently asked preparation questions.
   - The questions and answers in the markup must exactly reflect the visible text displayed on the page.
   - FAQ answers must be accessible within the page text so automated search parsers can read them effortlessly.

---

## Out of Scope
- Integration with third-party verified review platforms (Trustpilot, Google Play Console API).
- Dynamic user-generated question submission forms.
- Structured schema for blog posts or educational news articles (future content phase).

---

## Reference to Audit Findings
- **Audit Source:** `neetforge_seo_deep_dive_audit.md`
- **Section 4 (Schema.org & Structured Data Validation):**
  - Documented duplicate colliding schemas injected by `index.html` and client-side hydration.
  - Documented Google Rich Results Guideline violations: self-serving `aggregateRating` without reviews, fictitious `SearchAction`, and empty `sameAs` arrays.
- **Section 7 (Priority 6):** Clean JSON-LD Schema Architecture (Homepage and FAQ).
