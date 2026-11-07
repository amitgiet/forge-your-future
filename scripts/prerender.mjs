import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

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

const faqs = [
  {
    question: "What is NEETFORGE?",
    answer: "NEETFORGE is an AI-powered NEET preparation platform that combines daily practice, mock test analysis, revision tracking, and targeted weak-area improvement in one place."
  },
  {
    question: "How does NEETFORGE help improve NEET scores?",
    answer: "It closes the loop between practice, analysis, revision, and reattempts. Instead of only solving questions, students can identify weak chapters, revise at the right time, and train with structured NEET-style practice."
  },
  {
    question: "Does NEETFORGE support NEET mock tests and daily practice?",
    answer: "Yes. The platform is designed around NEET-style practice, daily DPP sessions, mock tests, analytics, revision tools, and AI-guided follow-up based on performance."
  },
  {
    question: "Is NEETFORGE useful for weak chapters and revision?",
    answer: "Yes. NEETFORGE is built to surface weak areas, organize revision, and help students repeatedly revisit topics until they become retention-friendly and exam ready."
  },
  {
    question: "Who should use NEETFORGE?",
    answer: "It is useful for NEET aspirants who want a more structured preparation system, including droppers, class 11 students, class 12 students, and learners who want better feedback after practice."
  },
  {
    question: "Is NEETFORGE free to use?",
    answer: "Yes. NEETFORGE has a free tier that gives you access to daily practice questions, formula cards, and basic analytics. Premium features like full mock test analysis, personalized revision plans, and AI insights are available with a Pro plan."
  },
  {
    question: "Does NEETFORGE cover NEET Biology, Chemistry, and Physics?",
    answer: "Yes. NEETFORGE covers all three NEET subjects — Biology (Botany + Zoology), Chemistry (Physical, Organic, Inorganic), and Physics — with chapter-wise questions, PYQs, formula cards, and revision tools for each subject."
  },
  {
    question: "How can I practice PYQ (Previous Year Questions) on NEETFORGE?",
    answer: "NEETFORGE includes a dedicated PYQ practice mode that lets you filter questions by subject, chapter, year, and exam type (NEET/AIPMT). You can attempt them in timed or untimed mode and see AI-generated explanations after each question."
  },
  {
    question: "What is the AI analysis feature on NEETFORGE?",
    answer: "NEETFORGE's AI analysis reviews your mock test performance and pinpoints which chapters and question types are hurting your score. It generates a prioritized list of weak areas and recommends specific revision tasks — saving you hours of manual review."
  },
  {
    question: "How does the revision system work?",
    answer: "NEETFORGE uses a spaced-repetition system. After you attempt questions, it tracks which concepts you struggled with and schedules them for automatic revision at the optimal time — so you never forget a topic close to the exam."
  },
  {
    question: "Can I use NEETFORGE on Android?",
    answer: "Yes. NEETFORGE is available as an Android app. You can also access the full platform on any browser via the web app at neetforge.in/app, with no installation needed."
  },
  {
    question: "How is NEETFORGE different from other NEET apps?",
    answer: "Most NEET apps focus only on content delivery. NEETFORGE focuses on performance improvement — it tells you what to fix, when to revise it, and tracks your accuracy over time so that every study session is targeted and efficient."
  }
];

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

const routes = [
  {
    path: "/",
    title: "NEETFORGE — AI-Powered NEET Preparation App 2025",
    description: "NEETFORGE is India's smartest NEET preparation app. Daily DPP, NTA-style mock tests, AI weak-area detection, spaced repetition revision (NeuronZ), and formula cards. Free to start.",
    canonical: "https://neetforge.in/",
    h1: "Convert Effort Into Marks: AI-Powered NEET 2025 Preparation App",
    content: "Prepare for NEET 2025 with AI-guided chapter-wise daily practice problems, full-length NTA pattern mock tests, spaced repetition revision, and detailed negative marking analytics.",
    schema: homeSchema
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
    content: "Find quick answers to common questions about test series patterns, free tier access, subscription cancellation, and mobile app availability.",
    schema: faqSchema,
    faqs: faqs
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

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`);
  html = html.replace(/<link\s+rel="canonical"[\s\S]*?\/?>/i, `<link rel="canonical" href="${route.canonical}" />`);
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/?>/i, `<meta name="description" content="${route.description}" />`);
  html = html.replace(/<meta\s+property="og:description"[\s\S]*?\/?>/i, `<meta property="og:description" content="${route.description}" />`);
  html = html.replace(/<meta\s+name="twitter:description"[\s\S]*?\/?>/i, `<meta name="twitter:description" content="${route.description}" />`);
  html = html.replace(/<meta\s+property="og:title"[\s\S]*?\/?>/i, `<meta property="og:title" content="${route.title}" />`);
  html = html.replace(/<meta\s+name="twitter:title"[\s\S]*?\/?>/i, `<meta name="twitter:title" content="${route.title}" />`);
  html = html.replace(/<meta\s+property="og:url"[\s\S]*?\/?>/i, `<meta property="og:url" content="${route.canonical}" />`);

  if (route.schema) {
    const schemaBlock = `<script type="application/ld+json" id="route-schema-jsonld">${JSON.stringify(route.schema)}</script>`;
    html = html.replace("</head>", `  ${schemaBlock}\n</head>`);
  }

  let semanticDom = `
    <header class="sr-only"><h1>${route.h1}</h1></header>
    <main class="sr-only">
      <p>${route.content}</p>
  `;
  if (route.faqs && route.faqs.length) {
    semanticDom += `    <section>
      <h2>Frequently Asked Questions</h2>
      <dl>
        ${route.faqs.map((f) => `<dt>${f.question}</dt><dd>${f.answer}</dd>`).join("\n        ")}
      </dl>
    </section>
  `;
  }
  semanticDom += `  </main>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${semanticDom}</div>`);

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
