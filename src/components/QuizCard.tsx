 import { Clock, ArrowRight } from 'lucide-react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { motion } from 'framer-motion';
 import { useNavigate } from 'react-router-dom';
 
 interface QuizCardProps {
   topic: string;
   duration: number;
   questionsCount: number;
   difficulty?: 'easy' | 'medium' | 'hard';
 }
 
 const QuizCard = ({ topic, duration, questionsCount, difficulty = 'medium' }: QuizCardProps) => {
   const { t } = useLanguage();
   const navigate = useNavigate();
 
   const difficultyColors = {
     easy: 'bg-success/20 text-success',
     medium: 'bg-secondary/20 text-secondary',
     hard: 'bg-destructive/20 text-destructive',
   };
 
   return (
     <motion.div
       className="nf-card"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay: 0.1 }}
       whileHover={{ scale: 1.02 }}
       whileTap={{ scale: 0.98 }}
     >
       <div className="flex items-start justify-between mb-4">
         <div>
           <span className={`text-xs px-2 py-1 rounded-lg font-medium ${difficultyColors[difficulty]}`}>
             {t('dashboard.currentTopic')}
           </span>
           <h3 className="mt-2 text-lg font-bold text-foreground">{topic}</h3>
         </div>
         <div className="flex items-center gap-1 text-muted-foreground">
           <Clock className="w-4 h-4" />
           <span className="text-sm">{duration} min</span>
         </div>
       </div>
       
       <div className="flex items-center justify-between">
         <p className="text-sm text-muted-foreground">
           {questionsCount} questions
         </p>
         <button
           onClick={() => navigate('/quiz')}
           className="nf-btn-primary !w-auto px-6 !min-h-[44px] flex items-center gap-2"
         >
           {t('dashboard.startQuiz')}
           <ArrowRight className="w-4 h-4" />
         </button>
       </div>
     </motion.div>
   );
 };
 
 export default QuizCard;