# Technical Design Specification: SEO-5-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-5-FE`
- **Parent Story:** `SEO-5` (Schema.org Structured Data Consolidation & FAQPage Rich Snippets)
- **Primary Discipline:** Frontend Development & Semantic Search Architecture
- **Objective:** Eliminate duplicate and guideline-violating structured data by purging hardcoded JSON-LD scripts from `index.html`, establishing a single unified Schema.org `@graph` on the homepage, and ensuring compliant `FAQPage` rich snippet markup matching visible DOM accordion content on `/faq`.

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/index.html` | **MODIFY** | Remove duplicate and hardcoded JSON-LD schema script blocks (lines 48–116) |
| `/src/marketing/pages/Home.jsx` | **MODIFY** | Inject single, consolidated `@graph` schema (Organization, WebSite, SoftwareApplication) |
| `/src/marketing/pages/FAQ.jsx` | **MODIFY** | Ensure compliant `FAQPage` schema definition matching all 12 preparation questions |
| `/src/marketing/components/neetforge/NeetFAQ.jsx` | **MODIFY** | Verify DOM accessibility of answer text for automated search crawlers |

---

## 3. Technical Implementation Specification

### 3.1 Purge Hardcoded Schemas from `/index.html`
Remove lines 48 through 116 from `/index.html`:
- Delete duplicate `SoftwareApplication` declaring fictitious ratings.
- Delete duplicate `Organization` declaring empty `sameAs: []`.
- Delete `WebSite` declaring non-functional `SearchAction`.

This prevents Googlebot from encountering contradictory duplicate schemas on first pass.

---

### 3.2 Single Consolidated Homepage Schema (`/src/marketing/pages/Home.jsx`)
In `Home.jsx`, define a single unified `@graph` passed to the `Seo` component:

```javascript
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://neetforge.in/#organization",
      "name": "NEETFORGE",
      "url": "https://neetforge.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://neetforge.in/apple-touch-icon.png",
        "width": 180,
        "height": 180
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@neetforge.in",
        "contactType": "customer support"
      },
      "sameAs": [
        "https://twitter.com/neetforge",
        "https://youtube.com/@neetforge",
        "https://t.me/neetforge"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://neetforge.in/#website",
      "name": "NEETFORGE",
      "url": "https://neetforge.in",
      "publisher": {
        "@id": "https://neetforge.in/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://neetforge.in/#app",
      "name": "NEETFORGE",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Android, iOS, Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    }
  ]
};
```

#### Violations Resolved:
1. **No Fictitious SearchAction:** Removed `SearchAction` because `https://neetforge.in/?q={search_term}` is not an active search results route.
2. **No Self-Serving Review Claims:** Omitted hardcoded `aggregateRating: 4.8` to avoid Google Search Central penalties for unverified rating claims.
3. **Verified Entity Authority:** Added official social profiles in `sameAs` array for Google Knowledge Graph disambiguation.

---

### 3.3 FAQPage Rich Snippet Schema (`/src/marketing/pages/FAQ.jsx`)
In `FAQ.jsx`, ensure the schema mirrors all 12 questions and answers:

```javascript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};
```

### 3.4 FAQ DOM Text Accessibility
In `src/marketing/components/neetforge/NeetFAQ.jsx`, ensure Radix UI Accordion content retains text accessibility for crawlers:
- Maintain descriptive text in `<AccordionContent>`.
- Pre-render script in Story 4 will render semantic `<main>` copy containing the full FAQ question-answer pairs into the static HTML shell so non-JS spiders (and Googlebot first-pass) index answers immediately.

---

## 4. Edge Cases & Failure Traps Avoided
1. **Schema Duplication during React Hydration:** Previously, both `index.html` and `Seo.jsx` appended separate `<script type="application/ld+json">` tags to `<head>`, causing Google Rich Results validator to flag duplicate colliding entities. Centralizing schema injection through `Seo.jsx` (and clean static pre-rendering) guarantees exactly one schema block per page.
2. **Text Discrepancy Penalty:** Google enforces that question and answer strings in `FAQPage` schema must verbatim match visible content on the page. Using the shared `faqs` data source for both JSX rendering and JSON-LD generation prevents any text divergence.
