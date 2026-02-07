import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
 import TrackTopic from "./pages/TrackTopic";
import QuizGenerator from "./pages/QuizGenerator";
import TestSeries from "./pages/TestSeries";
import TestSession from "./pages/TestSession";
import TestReport from "./pages/TestReport";
import CustomTestCreate from "./pages/CustomTestCreate";
import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
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
                    <Route path="/" element={<Splash />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                    <Route path="/mock-analyzer" element={<ProtectedRoute><MockAnalyzer /></ProtectedRoute>} />
                    <Route path="/ncert-search" element={<ProtectedRoute><NCERTSearch /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
                    <Route path="/create-learning-path" element={<ProtectedRoute><CreateLearningPath /></ProtectedRoute>} />
                    <Route path="/learning-path/:pathId" element={<ProtectedRoute><LearningPathFlow /></ProtectedRoute>} />
                    <Route path="/my-learning-paths" element={<ProtectedRoute><MyLearningPaths /></ProtectedRoute>} />
                    <Route path="/start-practice" element={<ProtectedRoute><StartPractice /></ProtectedRoute>} />
                    <Route path="/practice-session/:challengeId" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
                    <Route path="/my-challenges" element={<ProtectedRoute><MyChallenges /></ProtectedRoute>} />
                    <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
                    <Route path="/add-friend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} />
                    <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/quiz-start" element={<ProtectedRoute><QuizStart /></ProtectedRoute>} />
                    <Route path="/quiz/start" element={<ProtectedRoute><QuizStart /></ProtectedRoute>} />
                    <Route path="/quiz-session" element={<ProtectedRoute><QuizSession /></ProtectedRoute>} />
                    <Route path="/quiz-results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
                    <Route path="/revision-dashboard" element={<ProtectedRoute><RevisionDashboard /></ProtectedRoute>} />
                    <Route path="/revision/track" element={<ProtectedRoute><TrackTopic /></ProtectedRoute>} />
                    <Route path="/quiz-generator" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
                    <Route path="/tests" element={<ProtectedRoute><TestSeries /></ProtectedRoute>} />
                    <Route path="/test/custom/create" element={<ProtectedRoute><CustomTestCreate /></ProtectedRoute>} />
                    <Route path="/test/session/:attemptId" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
                    <Route path="/test/report/:attemptId" element={<ProtectedRoute><TestReport /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
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
