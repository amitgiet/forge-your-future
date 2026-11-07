# Technical Design Specification: SEO-6-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-6-FE`
- **Parent Story:** `SEO-6` (Search Crawl Budget Optimization, Robots.txt & Clean Sitemap Hygiene)
- **Primary Discipline:** DevOps, Technical SEO & Frontend View Layer
- **Objective:** Focus search engine crawl budget strictly on the 13 canonical marketing pages by pruning thin authentication routes from `sitemap.xml`, securing private application routes in `robots.txt`, and injecting dynamic `noindex, nofollow` metadata into student login and signup screens.

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/public/robots.txt` | **MODIFY** | Add explicit `Disallow: /app/` to prevent crawl budget waste on private portals |
| `/public/sitemap.xml` | **MODIFY** | Remove `/app/login` and `/app/signup`; retain exactly the 13 canonical marketing URLs |
| `/src/pages/Login.tsx` | **MODIFY** | Inject `<meta name="robots" content="noindex, nofollow">` on mount |
| `/src/pages/Signup.tsx` | **MODIFY** | Inject `<meta name="robots" content="noindex, nofollow">` on mount |

---

## 3. Technical Implementation Specification

### 3.1 Updated `public/robots.txt`
```txt
User-agent: *
Allow: /

# Disallow internal student portal and private application screens
Disallow: /app/
Disallow: /app/*

Sitemap: https://neetforge.in/sitemap.xml
```

#### Rationale:
- Blanket `Disallow: /app/` protects all nested student screens (`/app/dashboard`, `/app/practice`, `/app/quiz/*`, `/app/tests/*`, `/app/login`, `/app/signup`).
- Search engine spiders immediately bypass private student infrastructure, directing crawl bandwidth solely toward marketing content.

---

### 3.2 Cleaned `public/sitemap.xml` (Exactly 13 URLs)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Core Landing Page -->
  <url>
    <loc>https://neetforge.in/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Marketing Feature Pages -->
  <url>
    <loc>https://neetforge.in/neet-daily-practice</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neetforge.in/neet-mock-tests</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neetforge.in/neet-ai-analysis</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neetforge.in/neet-formula-cards</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://neetforge.in/neet-revision</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Information & Help Pages -->
  <url>
    <loc>https://neetforge.in/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://neetforge.in/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://neetforge.in/careers</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://neetforge.in/campus</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://neetforge.in/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Legal & Compliance Pages -->
  <url>
    <loc>https://neetforge.in/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://neetforge.in/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

</urlset>
```

---

### 3.3 Auth Screen `noindex, nofollow` Directives
In `src/pages/Login.tsx` and `src/pages/Signup.tsx`, add a head metadata effect:

```tsx
import { useEffect } from "react";

// Inside Login component:
useEffect(() => {
  let meta = document.querySelector('meta[name="robots"]');
  const created = !meta;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "noindex, nofollow");

  return () => {
    if (meta) {
      meta.setAttribute("content", "index, follow");
    }
  };
}, []);
```
Apply the identical pattern in `src/pages/Signup.tsx`.

---

## 4. Edge Cases & Failure Traps Avoided
1. **Thin-Content Penalties:** Exposing login/signup in sitemaps signals to Google that these 20-word form pages are primary site content, dragging down the domain's average content depth score. Removing them and tagging with `noindex` eliminates this risk.
2. **Robots.txt XML Reference Mismatch:** Ensure the `Sitemap:` directive in `robots.txt` uses the exact canonical apex URL `https://neetforge.in/sitemap.xml` with no trailing slash or subdomain divergence.
