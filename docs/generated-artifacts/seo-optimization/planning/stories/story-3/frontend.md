# Technical Design Specification: SEO-3-FE

## 1. Overview & Technical Goal
- **Subtask ID:** `SEO-3-FE`
- **Parent Story:** `SEO-3` (Route-Level Code-Splitting & Marketing Bundle Size Optimization)
- **Primary Discipline:** Frontend Architecture & Build Engineering
- **Objective:** Eliminate the monolithic 2.11 MB bundle bottleneck by implementing dynamic route-level code splitting via `React.lazy` in `src/App.tsx` and custom Rollup chunking rules in `vite.config.ts`, reducing initial public marketing page load to < 100 KB gzipped (< 250 KB uncompressed).

---

## 2. Target Files & Modifications

| File Path | Action | Description |
| :--- | :---: | :--- |
| `/src/App.tsx` | **MODIFY** | Convert static page imports into dynamic `React.lazy` imports wrapped in `<Suspense>` |
| `/vite.config.ts` | **MODIFY** | Define Rollup `manualChunks` to split vendor dependencies (React, UI primitives, Recharts, Icons) |

---

## 3. Technical Implementation Specification

### 3.1 Refactoring `src/App.tsx`
Replace monolithic static imports with lazy boundaries. The primary public homepage (`MarketingHome`) remains eager to optimize First Contentful Paint (FCP) and Largest Contentful Paint (LCP), while all subpages and authenticated internal tools are split:

```tsx
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RevisionProvider } from "@/contexts/RevisionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eagerly import primary marketing landing page for maximum LCP performance
import MarketingHome from "./marketing/pages/Home";

// Lazy-loaded marketing subpages
const MarketingAbout = lazy(() => import("./marketing/pages/About"));
const MarketingMockTests = lazy(() => import("./marketing/pages/MockTests"));
const MarketingDailyPractice = lazy(() => import("./marketing/pages/DailyPractice"));
const MarketingAIAnalysis = lazy(() => import("./marketing/pages/AIAnalysis"));
const MarketingPrivacyPolicy = lazy(() => import("./marketing/pages/PrivacyPolicy"));
const MarketingTerms = lazy(() => import("./marketing/pages/Terms"));
const MarketingNeetRevision = lazy(() => import("./marketing/pages/NeetRevision"));
const MarketingFormulaCards = lazy(() => import("./marketing/pages/FormulaCards"));
const MarketingFAQ = lazy(() => import("./marketing/pages/FAQ"));
const MarketingContact = lazy(() => import("./marketing/pages/Contact"));
const MarketingCareers = lazy(() => import("./marketing/pages/Careers"));
const MarketingCampus = lazy(() => import("./marketing/pages/Campus"));

// Lazy-loaded auth & student application suite
const Splash = lazy(() => import("./pages/Splash"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MockAnalyzer = lazy(() => import("./pages/MockAnalyzer"));
const NCERTSearch = lazy(() => import("./pages/NCERTSearch"));
const NCERTReader = lazy(() => import("./pages/NCERTReader"));
const Profile = lazy(() => import("./pages/Profile"));
const Revision = lazy(() => import("./pages/Revision"));
const CreateLearningPath = lazy(() => import("./pages/CreateLearningPath"));
const LearningPathFlow = lazy(() => import("./pages/LearningPathFlow"));
const MyLearningPaths = lazy(() => import("./pages/MyLearningPaths"));
const StartPractice = lazy(() => import("./pages/StartPractice"));
const PracticeSession = lazy(() => import("./pages/PracticeSession"));
const MyChallenges = lazy(() => import("./pages/MyChallenges"));
const Social = lazy(() => import("./pages/Social"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AddFriend = lazy(() => import("./pages/AddFriend"));
const QuizStart = lazy(() => import("./pages/QuizStart"));
const QuizSession = lazy(() => import("./pages/QuizSession"));
const QuizResults = lazy(() => import("./pages/QuizResults"));
const RevisionDashboard = lazy(() => import("./pages/RevisionDashboard"));
const QuizGenerator = lazy(() => import("./pages/QuizGenerator"));
const TestSeries = lazy(() => import("./pages/TestSeries"));
const MockPdfViewer = lazy(() => import("./pages/MockPdfViewer"));
const TestStart = lazy(() => import("./pages/TestStart"));
const CustomTestCreate = lazy(() => import("./pages/CustomTestCreate"));
const CustomTestSession = lazy(() => import("./pages/CustomTestSession"));
const TestSession = lazy(() => import("./pages/TestSession"));
const TestReport = lazy(() => import("./pages/TestReport"));
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const AIQuizSession = lazy(() => import("./pages/AIQuizSession"));
const PYQMarkedNCERT = lazy(() => import("./pages/PYQMarkedNCERT"));
const PYQTopicViewer = lazy(() => import("./pages/PYQTopicViewer"));
const CurriculumBrowser = lazy(() => import("./pages/CurriculumBrowser"));
const CurriculumQuizInstructions = lazy(() => import("./pages/CurriculumQuizInstructions"));
const Analytics = lazy(() => import("./pages/Analytics"));
const DoubtForum = lazy(() => import("./pages/DoubtForum"));
const DoubtDetail = lazy(() => import("./pages/DoubtDetail"));
const FormulaCards = lazy(() => import("./pages/FormulaCards"));
const FormulaChapterDetail = lazy(() => import("./pages/FormulaChapterDetail"));
const FormulaCardViewer = lazy(() => import("./pages/FormulaCardViewer"));
const ToppersEssentials = lazy(() => import("./pages/ToppersEssentials"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Route Fallback Loading Placeholder (zero layout shift)
const PageFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center" aria-hidden="true">
    <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
  </div>
);
```

Within the router JSX tree:
```tsx
<Suspense fallback={<PageFallback />}>
  <Routes>
    {/* Marketing Routes */}
    <Route path="/" element={<MarketingHome />} />
    <Route path="/Home" element={<MarketingHome />} />
    <Route path="/about" element={<MarketingAbout />} />
    ...
  </Routes>
</Suspense>
```

---

### 3.2 Rollup Vendor Chunking in `vite.config.ts`
Configure Rollup's `output.manualChunks` so third-party dependencies are partitioned into distinct cached bundles:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Isolate heavy charting library (never needed on marketing pages)
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            // Isolate icons
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // Isolate Radix UI & styling helpers
            if (
              id.includes("@radix-ui") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "vendor-ui";
            }
            // Core React ecosystem
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }
            // State management and query
            if (
              id.includes("@tanstack") ||
              id.includes("@reduxjs") ||
              id.includes("react-redux")
            ) {
              return "vendor-state";
            }
          }
        },
      },
    },
  },
}));
```

---

## 4. Performance Budget & Metrics
- **Initial Marketing Landing JS:** < 100 KB gzipped (reduced from 2.11 MB uncompressed).
- **First Contentful Paint (FCP):** < 1.2s on 4G mobile.
- **Largest Contentful Paint (LCP):** < 2.0s on 4G mobile.
- **Cumulative Layout Shift (CLS):** 0.00 during lazy chunk resolution via `PageFallback`.
