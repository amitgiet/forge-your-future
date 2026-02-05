 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { ArrowLeft, Lightbulb, ChevronRight, Flame } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import BottomNav from '@/components/BottomNav';
 
 const mockQuestions = [
   {
     id: 1,
     question: 'During which phase of the cell cycle does DNA replication occur?',
     options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'],
     correct: 1,
     explanation: 'DNA replication occurs during the S (Synthesis) phase of interphase, where the cell duplicates its chromosomal DNA.',
   },
   {
     id: 2,
     question: 'Which structure is responsible for separating sister chromatids during anaphase?',
     options: ['Centrioles', 'Spindle fibers', 'Nuclear envelope', 'Cell membrane'],
     correct: 1,
     explanation: 'Spindle fibers (microtubules) attach to kinetochores and pull sister chromatids apart during anaphase.',
   },
   {
     id: 3,
     question: 'What is the ploidy of cells produced by meiosis I?',
     options: ['Diploid', 'Haploid', 'Triploid', 'Tetraploid'],
     correct: 1,
     explanation: 'Meiosis I is the reduction division where homologous chromosomes separate, resulting in haploid cells.',
   },
 ];
 
 const Quiz = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
   const [currentQuestion, setCurrentQuestion] = useState(0);
   const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
   const [showExplanation, setShowExplanation] = useState(false);
   const [streak, setStreak] = useState(0);
   const [showStreakPopup, setShowStreakPopup] = useState(false);
 
   const question = mockQuestions[currentQuestion];
   const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
 
   const handleSelect = (index: number) => {
     if (selectedAnswer !== null) return;
     setSelectedAnswer(index);
     
     if (index === question.correct) {
       setStreak((prev) => prev + 1);
       setShowStreakPopup(true);
       setTimeout(() => setShowStreakPopup(false), 1500);
     }
   };
 
   const handleNext = () => {
     if (currentQuestion < mockQuestions.length - 1) {
       setCurrentQuestion((prev) => prev + 1);
       setSelectedAnswer(null);
       setShowExplanation(false);
     } else {
       navigate('/dashboard');
     }
   };
 
   const getOptionStyle = (index: number) => {
     if (selectedAnswer === null) {
       return 'bg-muted/50 border-transparent hover:border-primary/50';
     }
     if (index === question.correct) {
       return 'bg-success/20 border-success';
     }
     if (index === selectedAnswer && index !== question.correct) {
       return 'bg-destructive/20 border-destructive animate-shake';
     }
     return 'bg-muted/30 border-transparent opacity-50';
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="nf-safe-area p-4 max-w-md mx-auto">
         {/* Header */}
         <div className="flex items-center justify-between mb-6">
           <button
             onClick={() => navigate('/dashboard')}
             className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
           >
             <ArrowLeft className="w-5 h-5 text-foreground" />
           </button>
           
           <div className="flex items-center gap-2">
             <Flame className="w-5 h-5 text-secondary" />
             <span className="font-bold text-foreground">{streak}</span>
           </div>
         </div>
 
         {/* Progress bar */}
         <div className="h-2 bg-muted rounded-full overflow-hidden mb-8">
           <motion.div
             className="h-full bg-primary rounded-full"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.3 }}
           />
         </div>
 
         {/* Question counter */}
         <p className="text-sm text-muted-foreground mb-2">
           Question {currentQuestion + 1} of {mockQuestions.length}
         </p>
 
         {/* Question */}
         <AnimatePresence mode="wait">
           <motion.div
             key={currentQuestion}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
           >
             <h2 className="text-xl font-bold text-foreground mb-6">
               {question.question}
             </h2>
 
             {/* Options */}
             <div className="space-y-3">
               {question.options.map((option, index) => (
                 <motion.button
                   key={index}
                   onClick={() => handleSelect(index)}
                   disabled={selectedAnswer !== null}
                   className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${getOptionStyle(index)}`}
                   whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                 >
                   <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium">
                       {String.fromCharCode(65 + index)}
                     </span>
                     <span className="font-medium text-foreground">{option}</span>
                   </div>
                 </motion.button>
               ))}
             </div>
           </motion.div>
         </AnimatePresence>
 
         {/* Explanation */}
         <AnimatePresence>
           {showExplanation && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="mt-6 nf-card-glass"
             >
               <div className="flex items-start gap-3">
                 <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-foreground/80 leading-relaxed">
                   {question.explanation}
                 </p>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
 
         {/* Actions */}
         {selectedAnswer !== null && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-6 flex gap-3"
           >
             <button
               onClick={() => setShowExplanation(!showExplanation)}
               className="nf-btn-outline flex-1 flex items-center justify-center gap-2"
             >
               <Lightbulb className="w-5 h-5" />
               {t('quiz.explain')}
             </button>
             <button
               onClick={handleNext}
               className="nf-btn-primary flex-1 flex items-center justify-center gap-2"
             >
               {t('quiz.next')}
               <ChevronRight className="w-5 h-5" />
             </button>
           </motion.div>
         )}
 
         {/* Streak popup */}
         <AnimatePresence>
           {showStreakPopup && (
             <motion.div
               initial={{ opacity: 0, scale: 0.5, y: 50 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.5, y: -50 }}
               className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
             >
               <div className="bg-success text-success-foreground px-6 py-3 rounded-2xl font-bold text-lg flex items-center gap-2 shadow-lg">
                 <Flame className="w-6 h-6" />
                 {t('quiz.streakUp')}
               </div>
             </motion.div>
           )}
         </AnimatePresence>
       </div>
 
       <BottomNav />
     </div>
   );
 };
 
 export default Quiz;