 import { Flame, Star, Upload, BookOpen, Brain } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { useEffect } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
 import ShieldCard from '@/components/ShieldCard';
 import QuizCard from '@/components/QuizCard';
 import BottomNav from '@/components/BottomNav';
 import { useRevision } from '@/contexts/RevisionContext';
 
 const Dashboard = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
   const { getStats } = useRevision();
   const dispatch = useAppDispatch();
   const { dueLines, masteryProgress } = useAppSelector((state) => state.neuronz);
   const neuronzDueCount = dueLines?.total || 0;

   useEffect(() => {
     dispatch(loadDueLines());
     dispatch(getMasteryProgress());
   }, [dispatch]);
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="nf-safe-area p-4 max-w-md mx-auto">
         {/* Header with stats */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center justify-between mb-6"
         >
           <div>
             <h1 className="text-2xl font-bold text-foreground">NEETFORGE</h1>
             <p className="text-sm text-muted-foreground">Stay focused, stay ahead</p>
           </div>
           
           <div className="flex items-center gap-4">
             {/* Streak */}
             <motion.div
               className="flex items-center gap-1"
               whileHover={{ scale: 1.05 }}
             >
               <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                 <Flame className="w-5 h-5 text-secondary" />
               </div>
               <div className="text-right">
                 <p className="text-lg font-bold text-foreground">7</p>
                 <p className="text-[10px] text-muted-foreground leading-none">{t('dashboard.streak')}</p>
               </div>
             </motion.div>
             
             {/* Score */}
             <motion.div
               className="flex items-center gap-1"
               whileHover={{ scale: 1.05 }}
             >
               <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                 <Star className="w-5 h-5 text-primary" />
               </div>
               <div className="text-right">
                 <p className="text-lg font-bold text-foreground">2,450</p>
                 <p className="text-[10px] text-muted-foreground leading-none">{t('dashboard.score')}</p>
               </div>
             </motion.div>
           </div>
         </motion.div>
 
         {/* Shield Card */}
         <ShieldCard initialMinutes={25} />
 
         {/* Current Topic Quiz Card */}
         <div className="mt-4">
           <QuizCard
             topic="Cell Division - Mitosis vs Meiosis"
             duration={25}
             questionsCount={15}
             difficulty="medium"
           />
         </div>
 
         {/* Quick Actions */}
         <div className="mt-6 grid grid-cols-3 gap-3">
           <motion.button
             onClick={() => navigate('/revision')}
             className="nf-card flex flex-col items-center justify-center py-5 hover:border-accent/50 transition-colors"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-2">
               <Brain className="w-5 h-5 text-accent" />
             </div>
             <span className="font-semibold text-foreground text-sm">Revise</span>
             {neuronzDueCount > 0 && (
               <span className="text-[10px] text-accent mt-1">{neuronzDueCount} due</span>
             )}
           </motion.button>
 
           <motion.button
             onClick={() => navigate('/mock-analyzer')}
             className="nf-card flex flex-col items-center justify-center py-5 hover:border-secondary/50 transition-colors"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.25 }}
           >
             <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mb-2">
               <Upload className="w-5 h-5 text-secondary" />
             </div>
             <span className="font-semibold text-foreground text-sm">Mock</span>
             <span className="text-[10px] text-muted-foreground mt-1">Analyze</span>
           </motion.button>
 
           <motion.button
             onClick={() => navigate('/ncert-search')}
             className="nf-card flex flex-col items-center justify-center py-5 hover:border-primary/50 transition-colors"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
               <BookOpen className="w-5 h-5 text-primary" />
             </div>
             <span className="font-semibold text-foreground text-sm">NCERT</span>
             <span className="text-[10px] text-muted-foreground mt-1">Search</span>
           </motion.button>
         </div>
 
         {/* Today's Progress */}
         <motion.div
           className="mt-6 nf-card"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
           <h3 className="font-semibold text-foreground mb-3">Today's Progress</h3>
           <div className="flex items-center gap-4">
             <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
               <motion.div
                 className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                 initial={{ width: 0 }}
                 animate={{ width: '65%' }}
                 transition={{ duration: 1, delay: 0.6 }}
               />
             </div>
             <span className="text-sm font-medium text-primary">65%</span>
           </div>
           <div className="flex justify-between mt-3 text-sm text-muted-foreground">
             <span>3/5 quizzes completed</span>
             <span>45 min studied</span>
           </div>
         </motion.div>
       </div>
 
       <BottomNav />
     </div>
   );
 };
 
 export default Dashboard;