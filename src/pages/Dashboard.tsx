 import { Flame, Star, Upload, BookOpen } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import ShieldCard from '@/components/ShieldCard';
 import QuizCard from '@/components/QuizCard';
 import BottomNav from '@/components/BottomNav';
 
 const Dashboard = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
 
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
         <div className="mt-6 grid grid-cols-2 gap-4">
           <motion.button
             onClick={() => navigate('/mock-analyzer')}
             className="nf-card flex flex-col items-center justify-center py-6 hover:border-secondary/50 transition-colors"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-3">
               <Upload className="w-6 h-6 text-secondary" />
             </div>
             <span className="font-semibold text-foreground">{t('dashboard.uploadMock')}</span>
             <span className="text-xs text-muted-foreground mt-1">Analyze weaknesses</span>
           </motion.button>
 
           <motion.button
             onClick={() => navigate('/ncert-search')}
             className="nf-card flex flex-col items-center justify-center py-6 hover:border-primary/50 transition-colors"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
               <BookOpen className="w-6 h-6 text-primary" />
             </div>
             <span className="font-semibold text-foreground">{t('dashboard.ncert')}</span>
             <span className="text-xs text-muted-foreground mt-1">Search concepts</span>
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