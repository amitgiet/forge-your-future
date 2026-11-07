# Technical Design Specification: SEO-4-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-4-FE`
- **Parent Story:** `SEO-4` (Static Pre-Rendering (SSG) for Marketing Routes & Raw HTML Canonical Isolation)
- **Primary Discipline:** Frontend Architecture, Build Pipeline & SEO
- **Objective:** Eliminate the critical "Canonical Cannibalization Trap" and empty `<div id="root"></div>` by standardizing route metadata across all 13 marketing pages and generating pre-rendered static HTML files during the build process, ensuring distinct titles, self-referencing canonical tags, and semantic body content in raw HTTP responses.

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/src/marketing/components/Seo.jsx` | **MODIFY** | Standardize unified metadata injector component for all meta/head tags |
| `/src/marketing/pages/*.jsx` (13 pages) | **MODIFY** | Wire unified `Seo` component with unique title, description, and canonical path |
| `/scripts/prerender.mjs` | **CREATE** | Post-build Node.js SSG script generating distinct HTML for all 13 marketing routes |
| `/package.json` | **MODIFY** | Update build script: `"build": "vite build && node scripts/prerender.mjs"` |

---

## 3. Metadata Matrix (The 13 Canonical Marketing Routes)

| Route Path | Document Title | Canonical URL | Heading (H1) |
| :--- | :--- | :--- | :--- |
| `/` | `NEETFORGE — AI-Powered NEET Preparation App 2025` | `https://neetforge.in/` | `Convert Effort Into Marks: AI-Powered NEET 2025 Preparation App` |
| `/neet-daily-practice` | `NEET Daily Practice Problems (DPP) 2025 — Chapter-Wise Consistency Engine \| NEETFORGE` | `https://neetforge.in/neet-daily-practice` | `NEET Daily Practice Problems (DPP) — Chapter-Wise Consistency Engine` |
| `/neet-mock-tests` | `NEET Mock Tests 2025: NTA Pattern 720-Mark Full Syllabus Series \| NEETFORGE` | `https://neetforge.in/neet-mock-tests` | `NEET Mock Tests 2025: NTA Pattern 720-Mark Full Syllabus Series` |
| `/neet-ai-analysis` | `NEET AI Analysis: Pinpoint Weak Chapters & Negative Marking Trends \| NEETFORGE` | `https://neetforge.in/neet-ai-analysis` | `NEET AI Analysis: Pinpoint Weak Chapters & Negative Marking Trends` |
| `/neet-formula-cards` | `NEET Formula Cards: Physics, Chemistry & Biology Rapid Revision \| NEETFORGE` | `https://neetforge.in/neet-formula-cards` | `NEET Formula Cards: Physics, Chemistry & Biology Rapid Revision` |
| `/neet-revision` | `NEET Revision System (NeuronZ): Spaced Repetition for 650+ Score \| NEETFORGE` | `https://neetforge.in/neet-revision` | `NEET Revision System (NeuronZ): Spaced Repetition for 650+ Score` |
| `/about` | `About NEETFORGE — Our Mission, Story & Pedagogy \| NEETFORGE` | `https://neetforge.in/about` | `About NEETFORGE — Transforming How India Prepares for NEET` |
| `/contact` | `Contact NEETFORGE: Academic Counseling & Student Support \| NEETFORGE` | `https://neetforge.in/contact` | `Contact NEETFORGE Academic Support & Counseling` |
| `/careers` | `Careers at NEETFORGE: Join Our Mission to Empower Aspirants \| NEETFORGE` | `https://neetforge.in/careers` | `Careers at NEETFORGE: Help Millions of NEET Aspirants Succeed` |
| `/campus` | `NEETFORGE Offline Campuses & Intensive Coaching Centers \| NEETFORGE` | `https://neetforge.in/campus` | `NEETFORGE Physical Campus Locations & Intensive Coaching Centers` |
| `/faq` | `NEETFORGE FAQ — All Your NEET Prep & Subscription Questions Answered \| NEETFORGE` | `https://neetforge.in/faq` | `Frequently Asked Questions on NEETFORGE & NEET 2025 Preparation` |
| `/privacy-policy` | `Privacy Policy \| NEETFORGE` | `https://neetforge.in/privacy-policy` | `Privacy Policy` |
| `/terms` | `Terms of Service \| NEETFORGE` | `https://neetforge.in/terms` | `Terms of Service` |

---

## 4. Technical Implementation Specification

### 4.1 Unified Metadata Component (`src/marketing/components/Seo.jsx`)
```jsx
import { useEffect } from "react";

const BASE_URL = "https://neetforge.in";

function updateTag(selector, attrName, attrValue, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute(selector.startsWith("link") ? "href" : "content", content);
}

export default function Seo({
  title,
  description,
  canonicalPath = "/",
  keywords,
  schema,
}) {
  useEffect(() => {
    const fullCanonical = `${BASE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
    
    // Set document title
    document.title = title;

    // Standard Meta
    updateTag('meta[name="description"]', "name", "description", description);
    if (keywords) {
      updateTag('meta[name="keywords"]', "name", "keywords", keywords);
    }
    updateTag('meta[name="robots"]', "name", "robots", "index, follow");

    // Canonical
    updateTag('link[rel="canonical"]', "rel", "canonical", fullCanonical);

    // Open Graph
    updateTag('meta[property="og:title"]', "property", "og:title", title);
    updateTag('meta[property="og:description"]', "property", "og:description", description);
    updateTag('meta[property="og:url"]', "property", "og:url", fullCanonical);
    updateTag('meta[property="og:type"]', "property", "og:type", "website");

    // Twitter Card
    updateTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    updateTag('meta[name="twitter:description"]', "name", "twitter:description", description);

    // Schema injection
    if (schema) {
      let script = document.getElementById("route-schema-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.id = "route-schema-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    return () => {
      const script = document.getElementById("route-schema-jsonld");
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, keywords, schema]);

  return null;
}
```

---

### 4.2 Static Pre-Rendering Build Pipeline (`scripts/prerender.mjs`)
To guarantee raw HTML output without adding heavy headless Chrome runtime dependencies to CI/CD, author a deterministic post-build pre-renderer:

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const routes = [
  {
    path: "/",
    title: "NEETFORGE — AI-Powered NEET Preparation App 2025",
    description: "NEETFORGE is India's smartest NEET preparation app. Daily DPP, NTA-style mock tests, AI weak-area detection, spaced repetition revision (NeuronZ), and formula cards. Free to start.",
    canonical: "https://neetforge.in/",
    h1: "Convert Effort Into Marks: AI-Powered NEET 2025 Preparation App",
    content: "Prepare for NEET 2025 with AI-guided chapter-wise daily practice problems, full-length NTA pattern mock tests, spaced repetition revision, and detailed negative marking analytics."
  },
  {
    path: "/neet-daily-practice",
    title: "NEET Daily Practice Problems (DPP) 2025 — Chapter-Wise Consistency Engine | NEETFORGE",
    description: "Master NEET with curated daily practice problems. Chapter-wise Physics, Chemistry, and Biology questions aligned to the latest NTA NEET syllabus.",
    canonical: "https://neetforge.in/neet-daily-practice",
    h1: "NEET Daily Practice Problems (DPP) — Chapter-Wise Consistency Engine",
    content: "Daily consistency is the #1 predictor of NEET success. Practice chapter-wise NCERT-aligned questions daily with instant step-by-step explanations and accuracy tracking."
  },
  {
    path: "/neet-mock-tests",
    title: "NEET Mock Tests 2025: NTA Pattern 720-Mark Full Syllabus Series | NEETFORGE",
    description: "Take authentic NTA pattern NEET mock tests with standard 720-mark scoring, negative marking calculation, national percentile benchmarking, and in-depth question analysis.",
    canonical: "https://neetforge.in/neet-mock-tests",
    h1: "NEET Mock Tests 2025: NTA Pattern 720-Mark Full Syllabus Series",
    content: "Experience real NEET exam pressure before the big day. Our full-length 720-mark mock tests simulate NTA exam timing, section gating, and sectional cutoff requirements."
  },
  {
    path: "/neet-ai-analysis",
    title: "NEET AI Analysis: Pinpoint Weak Chapters & Negative Marking Trends | NEETFORGE",
    description: "Stop repeating the same mistakes. NEETFORGE AI analyzes your test attempts to uncover hidden syllabus blindspots, guess-pattern penalties, and time-trap questions.",
    canonical: "https://neetforge.in/neet-ai-analysis",
    h1: "NEET AI Analysis: Pinpoint Weak Chapters & Negative Marking Trends",
    content: "Transform raw test attempts into clear score improvement plans. Pinpoint exactly which sub-topics leak marks and get personalized recovery quizzes."
  },
  {
    path: "/neet-formula-cards",
    title: "NEET Formula Cards: Physics, Chemistry & Biology Rapid Revision | NEETFORGE",
    description: "Review all essential NEET formulas, constants, and reaction mechanisms with digital high-yield formula flashcards designed for rapid pre-test recall.",
    canonical: "https://neetforge.in/neet-formula-cards",
    h1: "NEET Formula Cards: Physics, Chemistry & Biology Rapid Revision",
    content: "High-yield digital formula flashcards covering Mechanics, Electrodynamics, Organic Named Reactions, Physical Chemistry formulas, and Biology diagrams."
  },
  {
    path: "/neet-revision",
    title: "NEET Revision System (NeuronZ): Spaced Repetition for 650+ Score | NEETFORGE",
    description: "Beat the Ebbinghaus forgetting curve. NEETFORGE's NeuronZ revision algorithm automatically schedules question reviews at optimal intervals for permanent retention.",
    canonical: "https://neetforge.in/neet-revision",
    h1: "NEET Revision System (NeuronZ): Spaced Repetition for 650+ Score",
    content: "Spaced repetition engineered specifically for medical aspirants. Never forget complex organic pathways or genetics formulas again."
  },
  {
    path: "/about",
    title: "About NEETFORGE — Our Mission, Story & Pedagogy | NEETFORGE",
    description: "Learn about the mission behind NEETFORGE: empowering every medical aspirant in India with personalized, accessible, and high-impact digital preparation tools.",
    canonical: "https://neetforge.in/about",
    h1: "About NEETFORGE — Transforming How India Prepares for NEET",
    content: "Built by educators and engineers to democratize access to elite exam preparation frameworks across tier-1, tier-2, and rural India."
  },
  {
    path: "/contact",
    title: "Contact NEETFORGE: Academic Counseling & Student Support | NEETFORGE",
    description: "Get in touch with NEETFORGE academic counseling, technical support, and campus coordinators. We are here to support your medical entrance journey.",
    canonical: "https://neetforge.in/contact",
    h1: "Contact NEETFORGE Academic Support & Counseling",
    content: "Have questions about subscriptions, test series, or campus programs? Connect with our dedicated academic support team."
  },
  {
    path: "/careers",
    title: "Careers at NEETFORGE: Join Our Mission to Empower Aspirants | NEETFORGE",
    description: "Join the team modernizing medical entrance coaching in India. View open faculty, engineering, content development, and community lead roles.",
    canonical: "https://neetforge.in/careers",
    h1: "Careers at NEETFORGE: Help Millions of NEET Aspirants Succeed",
    content: "We are hiring passionate educators, curriculum designers, and software engineers to build India's premier NEET learning platform."
  },
  {
    path: "/campus",
    title: "NEETFORGE Offline Campuses & Intensive Coaching Centers | NEETFORGE",
    description: "Discover NEETFORGE physical classroom centers and intensive residential coaching campuses across Kerala featuring top faculty and dedicated mentorship.",
    canonical: "https://neetforge.in/campus",
    h1: "NEETFORGE Physical Campus Locations & Intensive Coaching Centers",
    content: "Experience offline classroom coaching and residential batches at our modern campuses in Malappuram, Kozhikode, and Thrissur."
  },
  {
    path: "/faq",
    title: "NEETFORGE FAQ — All Your NEET Prep & Subscription Questions Answered | NEETFORGE",
    description: "Frequently asked questions regarding NEETFORGE daily practice problems, NTA mock tests, AI score analysis, pro subscriptions, and platform access.",
    canonical: "https://neetforge.in/faq",
    h1: "Frequently Asked Questions on NEETFORGE & NEET 2025 Preparation",
    content: "Find quick answers to common questions about test series patterns, free tier access, subscription cancellation, and mobile app availability."
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | NEETFORGE",
    description: "NEETFORGE privacy policy detailing student data protection, encrypted telemetry, cookie usage, and adherence to Indian digital personal data privacy regulations.",
    canonical: "https://neetforge.in/privacy-policy",
    h1: "Privacy Policy",
    content: "Your privacy and data security are our top priority. Learn how NEETFORGE collects, uses, and protects student performance telemetry."
  },
  {
    path: "/terms",
    title: "Terms of Service | NEETFORGE",
    description: "Terms and conditions governing the use of NEETFORGE web and mobile applications, subscription billing, fair practice policies, and intellectual property rights.",
    canonical: "https://neetforge.in/terms",
    h1: "Terms of Service",
    content: "Terms of service and student honor code governing participation in NEETFORGE mock tests and digital learning tools."
  }
];

const templatePath = path.join(distDir, "index.html");
if (!fs.existsSync(templatePath)) {
  console.error("dist/index.html not found! Run vite build first.");
  process.exit(1);
}

const template = fs.readFileSync(templatePath, "utf-8");

for (const route of routes) {
  let html = template;

  // Replace Document Title
  html = html.replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`);

  // Replace Canonical Link
  html = html.replace(/<link rel="canonical" href=".*?"\s*\/?>/i, `<link rel="canonical" href="${route.canonical}" />`);

  // Replace Meta Description
  html = html.replace(/<meta name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${route.description}" />`);
  html = html.replace(/<meta property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${route.description}" />`);
  html = html.replace(/<meta name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${route.description}" />`);

  // Replace Open Graph and Twitter Titles
  html = html.replace(/<meta property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${route.title}" />`);
  html = html.replace(/<meta name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${route.title}" />`);
  html = html.replace(/<meta property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${route.canonical}" />`);

  // Pre-render semantic body copy inside root container so crawlers read content immediately
  const semanticDom = `
    <header class="sr-only"><h1>${route.h1}</h1></header>
    <main class="sr-only"><p>${route.content}</p></main>
  `;
  html = html.replace('<div id="root"></div>', `<div id="root">${semanticDom}</div>`);

  // Determine output location
  let targetFile;
  if (route.path === "/") {
    targetFile = path.join(distDir, "index.html");
  } else {
    const routeDir = path.join(distDir, route.path.replace(/^\//, ""));
    fs.mkdirSync(routeDir, { recursive: true });
    targetFile = path.join(routeDir, "index.html");
  }

  fs.writeFileSync(targetFile, html, "utf-8");
  console.log(`Pre-rendered: ${route.path} -> ${path.relative(distDir, targetFile)}`);
}

console.log("Pre-rendering complete for all 13 canonical marketing routes.");
```

---

## 5. Acceptance Verification Mapping
- `AC-4.1`: Every route's static HTML output possesses its unique, self-referencing canonical URL (`https://neetforge.in/neet-mock-tests`).
- `AC-4.2`: Every route's static HTML output contains distinct `<title>` and `<meta name="description">`.
- `AC-4.3`: Raw HTML response contains semantic `<h1>` and body summary before any JS runs.
- `AC-4.4`: Root homepage canonical link is strictly confined to `/`.
