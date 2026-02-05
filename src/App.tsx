 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { LanguageProvider } from "@/contexts/LanguageContext";
 import { RevisionProvider } from "@/contexts/RevisionContext";
 import Splash from "./pages/Splash";
 import Onboarding from "./pages/Onboarding";
 import Dashboard from "./pages/Dashboard";
 import Quiz from "./pages/Quiz";
 import MockAnalyzer from "./pages/MockAnalyzer";
 import NCERTSearch from "./pages/NCERTSearch";
 import Profile from "./pages/Profile";
 import Revision from "./pages/Revision";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <LanguageProvider>
       <RevisionProvider>
         <TooltipProvider>
           <Toaster />
           <Sonner />
           <BrowserRouter>
             <Routes>
               <Route path="/" element={<Splash />} />
               <Route path="/onboarding" element={<Onboarding />} />
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/quiz" element={<Quiz />} />
               <Route path="/mock-analyzer" element={<MockAnalyzer />} />
               <Route path="/ncert-search" element={<NCERTSearch />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/revision" element={<Revision />} />
               <Route path="*" element={<NotFound />} />
             </Routes>
           </BrowserRouter>
         </TooltipProvider>
       </RevisionProvider>
     </LanguageProvider>
   </QueryClientProvider>
 );
 
 export default App;
