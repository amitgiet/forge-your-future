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
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import MockAnalyzer from "./pages/MockAnalyzer";
import NCERTSearch from "./pages/NCERTSearch";
import NCERTReader from "./pages/NCERTReader";
import Profile from "./pages/Profile";
import Revision from "./pages/Revision";
import CreateLearningPath from "./pages/CreateLearningPath";
import LearningPathFlow from "./pages/LearningPathFlow";
import MyLearningPaths from "./pages/MyLearningPaths";
import StartPractice from "./pages/StartPractice";
import PracticeSession from "./pages/PracticeSession";
import MyChallenges from "./pages/MyChallenges";
import Social from "./pages/Social";
import ChatPage from "./pages/ChatPage";
import AddFriend from "./pages/AddFriend";
import QuizStart from "./pages/QuizStart";
import QuizSession from "./pages/QuizSession";
import QuizResults from "./pages/QuizResults";
import RevisionDashboard from "./pages/RevisionDashboard";
import QuizGenerator from "./pages/QuizGenerator";
import TestSeries from "./pages/TestSeries";
import MockPdfViewer from "./pages/MockPdfViewer";
import TestSession from "./pages/TestSession";
import TestReport from "./pages/TestReport";
import CustomTestCreate from "./pages/CustomTestCreate";
import CustomTestSession from "./pages/CustomTestSession";
import DailyChallenge from "./pages/DailyChallenge";
import Leaderboard from "./pages/Leaderboard";
import AIAssistant from "./pages/AIAssistant";
import TestStart from "./pages/TestStart";
import AIQuizSession from "./pages/AIQuizSession";
import PYQMarkedNCERT from "./pages/PYQMarkedNCERT";
import PYQTopicViewer from "./pages/PYQTopicViewer";
import CurriculumBrowser from "./pages/CurriculumBrowser";
import CurriculumQuizInstructions from "./pages/CurriculumQuizInstructions";
import Analytics from "./pages/Analytics";
import DoubtForum from "./pages/DoubtForum";
import DoubtDetail from "./pages/DoubtDetail";
import FormulaCards from "./pages/FormulaCards";
import FormulaChapterDetail from "./pages/FormulaChapterDetail";
import FormulaCardViewer from "./pages/FormulaCardViewer";
import ToppersEssentials from "./pages/ToppersEssentials";
import StudyPlanner from "./pages/StudyPlanner";
import NotFound from "./pages/NotFound";
import MarketingHome from "./marketing/pages/Home";
import MarketingAbout from "./marketing/pages/About";
import MarketingMockTests from "./marketing/pages/MockTests";
import MarketingDailyPractice from "./marketing/pages/DailyPractice";
import MarketingAIAnalysis from "./marketing/pages/AIAnalysis";
import MarketingPrivacyPolicy from "./marketing/pages/PrivacyPolicy";
import MarketingTerms from "./marketing/pages/Terms";
import MarketingNeetRevision from "./marketing/pages/NeetRevision";
import MarketingFormulaCards from "./marketing/pages/FormulaCards";
import MarketingFAQ from "./marketing/pages/FAQ";
import MarketingContact from "./marketing/pages/Contact";
import MarketingCareers from "./marketing/pages/Careers";
import MarketingCampus from "./marketing/pages/Campus";

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
                    <Route path="/app/formula-cards/:chapterId" element={<ProtectedRoute><FormulaChapterDetail /></ProtectedRoute>} />
                    <Route path="/app/formula-cards/viewer" element={<ProtectedRoute><FormulaCardViewer /></ProtectedRoute>} />
                    <Route path="/app/toppers-essentials/*" element={<ProtectedRoute><ToppersEssentials /></ProtectedRoute>} />
                    <Route path="*" element={<LegacyAppRedirect />} />
                  </Routes>
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
