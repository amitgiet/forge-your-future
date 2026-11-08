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

import MarketingHome from "./marketing/pages/Home";

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
const TestSession = lazy(() => import("./pages/TestSession"));
const TestReport = lazy(() => import("./pages/TestReport"));
const CustomTestCreate = lazy(() => import("./pages/CustomTestCreate"));
const CustomTestSession = lazy(() => import("./pages/CustomTestSession"));
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const TestStart = lazy(() => import("./pages/TestStart"));
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
const FlashcardViewer = lazy(() => import("./pages/FlashcardViewer"));
const ToppersEssentials = lazy(() => import("./pages/ToppersEssentials"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const legacyAppRoots = new Set([
  "dashboard",
  "login",
  "signup",
  "onboarding",
  "tests",
  "social",
  "profile",
  "ai-assistant",
  "revision",
  "curriculum-browser",
  "pyq-marked-ncert",
  "mock-analyzer",
  "ncert-search",
  "my-learning-paths",
  "doubts",
  "formula-cards",
  "flashcards",
  "quiz-generator",
  "study-plan",
  "leaderboard",
  "daily-challenge",
  "chat",
  "add-friend",
  "test",
  "quiz",
  "analytics",
  "practice-session",
  "learning-path",
  "curriculum-quiz-instructions"
]);

const LegacyAppRedirect = () => {
  const location = useLocation();
  const firstSegment = location.pathname.split('/').filter(Boolean)[0];
  if (!firstSegment || !legacyAppRoots.has(firstSegment)) {
    return <NotFound />;
  }
  return <Navigate to={`/app${location.pathname}${location.search}${location.hash}`} replace />;
};

const PageFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center" aria-hidden="true">
    <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <RevisionProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Suspense fallback={<PageFallback />}>
                    <Routes>
                      <Route path="/" element={<MarketingHome />} />
                      <Route path="/Home" element={<MarketingHome />} />
                      <Route path="/about" element={<MarketingAbout />} />
                      <Route path="/neet-mock-tests" element={<MarketingMockTests />} />
                      <Route path="/neet-daily-practice" element={<MarketingDailyPractice />} />
                      <Route path="/neet-ai-analysis" element={<MarketingAIAnalysis />} />
                      <Route path="/privacy-policy" element={<MarketingPrivacyPolicy />} />
                      <Route path="/terms" element={<MarketingTerms />} />
                      <Route path="/neet-revision" element={<MarketingNeetRevision />} />
                      <Route path="/neet-formula-cards" element={<MarketingFormulaCards />} />
                      <Route path="/faq" element={<MarketingFAQ />} />
                      <Route path="/contact" element={<MarketingContact />} />
                      <Route path="/careers" element={<MarketingCareers />} />
                      <Route path="/campus" element={<MarketingCampus />} />
                      <Route path="/app" element={<Splash />} />
                      <Route path="/app/" element={<Splash />} />
                      <Route path="/app/login" element={<Login />} />
                      <Route path="/app/signup" element={<Signup />} />
                      <Route path="/app/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                      <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/app/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                      <Route path="/app/mock-analyzer" element={<ProtectedRoute><MockAnalyzer /></ProtectedRoute>} />
                      <Route path="/app/ncert-search" element={<ProtectedRoute><NCERTSearch /></ProtectedRoute>} />
                      <Route path="/app/ncert-reader" element={<ProtectedRoute><NCERTReader /></ProtectedRoute>} />
                      <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/app/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
                      <Route path="/app/create-learning-path" element={<ProtectedRoute><CreateLearningPath /></ProtectedRoute>} />
                      <Route path="/app/learning-path/:pathId" element={<ProtectedRoute><LearningPathFlow /></ProtectedRoute>} />
                      <Route path="/app/my-learning-paths" element={<ProtectedRoute><MyLearningPaths /></ProtectedRoute>} />
                      <Route path="/app/start-practice" element={<ProtectedRoute><StartPractice /></ProtectedRoute>} />
                      <Route path="/app/practice-session/:challengeId" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
                      <Route path="/app/my-challenges" element={<ProtectedRoute><MyChallenges /></ProtectedRoute>} />
                      <Route path="/app/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
                      <Route path="/app/add-friend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} />
                      <Route path="/app/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                      <Route path="/app/quiz-start" element={<ProtectedRoute><QuizStart /></ProtectedRoute>} />
                      <Route path="/app/quiz/start" element={<ProtectedRoute><QuizStart /></ProtectedRoute>} />
                      <Route path="/app/quiz-session" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />
                      <Route path="/app/quiz-results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
                      <Route path="/app/revision-dashboard" element={<ProtectedRoute><RevisionDashboard /></ProtectedRoute>} />
                      <Route path="/app/revision/track" element={<ProtectedRoute><StartPractice /></ProtectedRoute>} />
                      <Route path="/app/quiz-generator" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
                      <Route path="/app/tests" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
                      <Route path="/app/tests/:seriesKey" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
                      <Route path="/app/tests/:seriesKey/:typeKey" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
                      <Route path="/app/tests/pdf-viewer" element={<ProtectedRoute><MockPdfViewer /></ProtectedRoute>} />
                      <Route path="/app/test/start/:testId" element={<ProtectedRoute><TestStart /></ProtectedRoute>} />
                      <Route path="/app/test/custom/create" element={<ProtectedRoute><CustomTestCreate /></ProtectedRoute>} />
                      <Route path="/app/test/custom-session" element={<ProtectedRoute><CustomTestSession /></ProtectedRoute>} />
                      <Route path="/app/test/session/:attemptId" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
                      <Route path="/app/test/report/:attemptId" element={<ProtectedRoute><TestReport /></ProtectedRoute>} />
                      <Route path="/app/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
                      <Route path="/app/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                      <Route path="/app/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                      <Route path="/app/ai-quiz-session" element={<ProtectedRoute><AIQuizSession /></ProtectedRoute>} />
                      <Route path="/app/pyq-marked-ncert" element={<ProtectedRoute><PYQMarkedNCERT /></ProtectedRoute>} />
                      <Route path="/app/pyq-marked-ncert/:topicId" element={<ProtectedRoute><PYQTopicViewer /></ProtectedRoute>} />
                      <Route path="/app/curriculum-browser" element={<ProtectedRoute><CurriculumBrowser /></ProtectedRoute>} />
                      <Route path="/app/curriculum-quiz-instructions" element={<ProtectedRoute><CurriculumQuizInstructions /></ProtectedRoute>} />
                      <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                      <Route path="/app/study-plan" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
                      <Route path="/app/doubts" element={<ProtectedRoute><DoubtForum /></ProtectedRoute>} />
                      <Route path="/app/doubts/:id" element={<ProtectedRoute><DoubtDetail /></ProtectedRoute>} />
                      <Route path="/app/formula-cards" element={<ProtectedRoute><FormulaCards /></ProtectedRoute>} />
                      <Route path="/app/formula-cards/flashcard-viewer" element={<ProtectedRoute><FlashcardViewer /></ProtectedRoute>} />
                      <Route path="/app/flashcards/viewer" element={<ProtectedRoute><FlashcardViewer /></ProtectedRoute>} />
                      <Route path="/app/formula-cards/viewer" element={<ProtectedRoute><FormulaCardViewer /></ProtectedRoute>} />
                      <Route path="/app/formula-cards/:chapterId" element={<ProtectedRoute><FormulaChapterDetail /></ProtectedRoute>} />
                      <Route path="/app/toppers-essentials/*" element={<ProtectedRoute><ToppersEssentials /></ProtectedRoute>} />
                      <Route path="*" element={<LegacyAppRedirect />} />
                    </Routes>
                  </Suspense>
                </TooltipProvider>
              </RevisionProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
