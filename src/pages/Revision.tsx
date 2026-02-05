 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useRevision, RevisionQuestion } from '@/contexts/RevisionContext';
 import { 
   ArrowLeft, 
   Brain, 
   Zap, 
   Trophy, 
   Clock, 
   ChevronRight, 
   Lightbulb,
   Flame,
   Lock,
   Check,
   X
 } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import BottomNav from '@/components/BottomNav';
 
 const LEVEL_COLORS = [
   '', // 0 (unused)
   'bg-red-500/20 text-red-400 border-red-500/30',
   'bg-orange-500/20 text-orange-400 border-orange-500/30',
   'bg-amber-500/20 text-amber-400 border-amber-500/30',
   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
   'bg-lime-500/20 text-lime-400 border-lime-500/30',
   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
   'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
 ];
 
 const LEVEL_LABELS = ['', 'New', 'Learning', 'Reviewing', 'Familiar', 'Strong', 'Expert', 'Mastered'];
 
 const Revision = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
   const { 
     getDueQuestions, 
     answerQuestion, 
     getStats, 
     dailyLimit, 
     answeredToday, 
     isPro 
   } = useRevision();
 
   const [currentQuestion, setCurrentQuestion] = useState<RevisionQuestion | null>(null);
   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
   const [showExplanation, setShowExplanation] = useState(false);
   const [dueQuestions, setDueQuestions] = useState<RevisionQuestion[]>([]);
   const [sessionCorrect, setSessionCorrect] = useState(0);
   const [showResult, setShowResult] = useState(false);
 
   const stats = getStats();
   const canAnswer = isPro || answeredToday < dailyLimit;
   const remainingToday = Math.max(0, dailyLimit - answeredToday);
 
   useEffect(() => {
     const due = getDueQuestions();
     setDueQuestions(due);
     if (due.length > 0 && !currentQuestion) {
       setCurrentQuestion(due[0]);
     }
   }, []);
 
   const handleSelect = (index: number) => {
     if (selectedAnswer !== null || !canAnswer) return;
     setSelectedAnswer(index);
     setShowResult(true);
 
     const isCorrect = index === currentQuestion?.correct;
     if (isCorrect) {
       setSessionCorrect((prev) => prev + 1);
     }
 
     if (currentQuestion) {
       answerQuestion(currentQuestion.id, isCorrect);
     }
   };
 
   const handleNext = () => {
     const remaining = dueQuestions.filter((q) => q.id !== currentQuestion?.id);
     setDueQuestions(remaining);
 
     if (remaining.length > 0) {
       setCurrentQuestion(remaining[0]);
     } else {
       setCurrentQuestion(null);
     }
 
     setSelectedAnswer(null);
     setShowExplanation(false);
     setShowResult(false);
   };
 
   const getOptionStyle = (index: number) => {
     if (selectedAnswer === null) {
       return 'bg-muted/50 border-transparent hover:border-primary/50';
     }
     if (index === currentQuestion?.correct) {
       return 'bg-success/20 border-success';
     }
     if (index === selectedAnswer && index !== currentQuestion?.correct) {
       return 'bg-destructive/20 border-destructive animate-shake';
     }
     return 'bg-muted/30 border-transparent opacity-50';
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="nf-safe-area p-4 max-w-md mx-auto">
         {/* Header */}
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
             <button
               onClick={() => navigate('/dashboard')}
               className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
             >
               <ArrowLeft className="w-5 h-5 text-foreground" />
             </button>
             <div>
               <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                 <Brain className="w-5 h-5 text-primary" />
                 NEURONZ
               </h1>
               <p className="text-xs text-muted-foreground">Spaced Revision</p>
             </div>
           </div>
 
           <div className="flex items-center gap-2">
             <Flame className="w-5 h-5 text-secondary" />
             <span className="font-bold text-foreground">{sessionCorrect}</span>
           </div>
         </div>
 
         {/* Stats Cards */}
         <div className="grid grid-cols-3 gap-3 mb-6">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="nf-card-glass p-3 text-center"
           >
             <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
             <p className="text-xl font-bold text-foreground">{stats.dueToday}</p>
             <p className="text-[10px] text-muted-foreground">Due Today</p>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="nf-card-glass p-3 text-center"
           >
             <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
             <p className="text-xl font-bold text-foreground">{stats.masteredCount}</p>
             <p className="text-[10px] text-muted-foreground">Mastered</p>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="nf-card-glass p-3 text-center"
           >
             <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
             <p className="text-xl font-bold text-foreground">L{Math.round(stats.averageLevel)}</p>
             <p className="text-[10px] text-muted-foreground">Avg Level</p>
           </motion.div>
         </div>
 
         {/* Daily Limit Banner */}
         {!isPro && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="nf-card-glass mb-4 flex items-center justify-between"
           >
             <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canAnswer ? 'bg-success/20' : 'bg-destructive/20'}`}>
                 {canAnswer ? (
                   <Check className="w-5 h-5 text-success" />
                 ) : (
                   <Lock className="w-5 h-5 text-destructive" />
                 )}
               </div>
               <div>
                 <p className="text-sm font-medium text-foreground">
                   {canAnswer ? `${remainingToday} revisions left today` : 'Daily limit reached'}
                 </p>
                 <p className="text-xs text-muted-foreground">
                   {answeredToday}/{dailyLimit} completed
                 </p>
               </div>
             </div>
             {!canAnswer && (
               <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                 Go Pro
               </button>
             )}
           </motion.div>
         )}
 
         {/* Question Card */}
         {currentQuestion ? (
           <AnimatePresence mode="wait">
             <motion.div
               key={currentQuestion.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="nf-card"
             >
               {/* Level Badge */}
               <div className="flex items-center justify-between mb-4">
                 <span className={`text-xs px-3 py-1 rounded-lg border ${LEVEL_COLORS[currentQuestion.level]}`}>
                   Level {currentQuestion.level} • {LEVEL_LABELS[currentQuestion.level]}
                 </span>
                 <span className="text-xs text-muted-foreground">{currentQuestion.topic}</span>
               </div>
 
               {/* Question */}
               <h2 className="text-lg font-semibold text-foreground mb-5">
                 {currentQuestion.question}
               </h2>
 
               {/* Options */}
               <div className="space-y-3">
                 {currentQuestion.options.map((option, index) => (
                   <motion.button
                     key={index}
                     onClick={() => handleSelect(index)}
                     disabled={selectedAnswer !== null || !canAnswer}
                     className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(index)}`}
                     whileTap={selectedAnswer === null && canAnswer ? { scale: 0.98 } : {}}
                   >
                     <div className="flex items-center gap-3">
                       <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium">
                         {String.fromCharCode(65 + index)}
                       </span>
                       <span className="font-medium text-foreground">{option}</span>
                       {selectedAnswer !== null && index === currentQuestion.correct && (
                         <Check className="w-5 h-5 text-success ml-auto" />
                       )}
                       {selectedAnswer === index && index !== currentQuestion.correct && (
                         <X className="w-5 h-5 text-destructive ml-auto" />
                       )}
                     </div>
                   </motion.button>
                 ))}
               </div>
 
               {/* Result Feedback */}
               {showResult && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`mt-4 p-3 rounded-xl ${
                     selectedAnswer === currentQuestion.correct
                       ? 'bg-success/20 border border-success/30'
                       : 'bg-destructive/20 border border-destructive/30'
                   }`}
                 >
                   <p className={`text-sm font-medium ${
                     selectedAnswer === currentQuestion.correct ? 'text-success' : 'text-destructive'
                   }`}>
                     {selectedAnswer === currentQuestion.correct ? (
                       <>✓ Correct! Level up to L{Math.min(currentQuestion.level + 1, 7)}</>
                     ) : (
                       <>✗ Incorrect. Back to L{Math.max(currentQuestion.level - 1, 1)}</>
                     )}
                   </p>
                 </motion.div>
               )}
 
               {/* Explanation */}
               <AnimatePresence>
                 {showExplanation && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-4 p-4 rounded-xl bg-muted/50 border border-border"
                   >
                     <div className="flex items-start gap-3">
                       <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                       <p className="text-sm text-foreground/80 leading-relaxed">
                         {currentQuestion.explanation}
                       </p>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
 
               {/* Actions */}
               {selectedAnswer !== null && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-5 flex gap-3"
                 >
                   <button
                     onClick={() => setShowExplanation(!showExplanation)}
                     className="nf-btn-outline flex-1 flex items-center justify-center gap-2 !min-h-[48px]"
                   >
                     <Lightbulb className="w-5 h-5" />
                     Explain
                   </button>
                   <button
                     onClick={handleNext}
                     className="nf-btn-primary flex-1 flex items-center justify-center gap-2 !min-h-[48px]"
                   >
                     Next
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </motion.div>
               )}
             </motion.div>
           </AnimatePresence>
         ) : (
           /* Empty State */
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-center py-12"
           >
             <div className="w-20 h-20 mx-auto rounded-3xl bg-success/20 flex items-center justify-center mb-4">
               <Trophy className="w-10 h-10 text-success" />
             </div>
             <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
             <p className="text-muted-foreground max-w-xs mx-auto mb-6">
               No questions due for revision right now. Check back later or take a quiz to add more.
             </p>
             <button
               onClick={() => navigate('/quiz')}
               className="nf-btn-primary !w-auto px-8 mx-auto"
             >
               Take a Quiz
             </button>
           </motion.div>
         )}
 
         {/* Level Guide */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="mt-6 nf-card"
         >
           <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
             <Brain className="w-4 h-4 text-primary" />
             Level Intervals
           </h3>
           <div className="grid grid-cols-7 gap-1">
             {[1, 2, 3, 4, 5, 6, 7].map((level) => (
               <div key={level} className="text-center">
                 <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${LEVEL_COLORS[level]}`}>
                   L{level}
                 </div>
                 <p className="text-[9px] text-muted-foreground mt-1">
                   {level === 1 && '24h'}
                   {level === 2 && '3d'}
                   {level === 3 && '5d'}
                   {level === 4 && '7d'}
                   {level === 5 && '14d'}
                   {level === 6 && '30d'}
                   {level === 7 && '60d'}
                 </p>
               </div>
             ))}
           </div>
         </motion.div>
       </div>
 
       <BottomNav />
     </div>
   );
 };
 
 export default Revision;