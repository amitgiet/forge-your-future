 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { ArrowLeft, Upload, FileText, TrendingDown, Trophy, Calendar, RotateCcw } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import BottomNav from '@/components/BottomNav';
 
 const mockWeaknesses = [
   { chapter: 'Cell Division', accuracy: 45, questions: 8 },
   { chapter: 'Genetics', accuracy: 52, questions: 12 },
   { chapter: 'Plant Physiology', accuracy: 58, questions: 6 },
   { chapter: 'Human Physiology', accuracy: 61, questions: 10 },
 ];
 
 const MockAnalyzer = () => {
   const { t } = useLanguage();
   const navigate = useNavigate();
   const [hasUploaded, setHasUploaded] = useState(false);
 
   const handleUpload = () => {
     // Simulate upload
     setHasUploaded(true);
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="nf-safe-area p-4 max-w-md mx-auto">
         {/* Header */}
         <div className="flex items-center gap-4 mb-6">
           <button
             onClick={() => navigate('/dashboard')}
             className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
           >
             <ArrowLeft className="w-5 h-5 text-foreground" />
           </button>
           <h1 className="text-xl font-bold text-foreground">{t('mock.title')}</h1>
         </div>
 
         {!hasUploaded ? (
           /* Upload Section */
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-8"
           >
             <div
               onClick={handleUpload}
               className="nf-card-glass border-2 border-dashed border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
             >
               <div className="flex flex-col items-center py-12">
                 <motion.div
                   className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-4"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <Upload className="w-10 h-10 text-primary" />
                 </motion.div>
                 <h3 className="text-lg font-semibold text-foreground mb-2">
                   {t('mock.upload')}
                 </h3>
                 <p className="text-sm text-muted-foreground text-center max-w-xs">
                   Upload your mock test PDF and let AI analyze your weaknesses
                 </p>
               </div>
             </div>
 
             <div className="mt-6 flex items-center gap-3 text-muted-foreground">
               <FileText className="w-5 h-5" />
               <span className="text-sm">Supports: PDF, Images</span>
             </div>
           </motion.div>
         ) : (
           /* Results Section */
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-4"
           >
             {/* Rank Card */}
             <motion.div
               className="nf-card-glass"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">{t('mock.rank')}</p>
                   <p className="text-3xl font-bold nf-gradient-text">12,450</p>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                   <Trophy className="w-7 h-7 text-primary" />
                 </div>
               </div>
               <p className="text-xs text-muted-foreground mt-2">
                 Based on your mock test performance
               </p>
             </motion.div>
 
             {/* Weakness Map */}
             <motion.div
               className="nf-card"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
             >
               <div className="flex items-center gap-2 mb-4">
                 <TrendingDown className="w-5 h-5 text-destructive" />
                 <h3 className="font-semibold text-foreground">{t('mock.weaknesses')}</h3>
               </div>
               
               <div className="space-y-3">
                 {mockWeaknesses.map((weakness, index) => (
                   <motion.div
                     key={weakness.chapter}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 + index * 0.1 }}
                     className="flex items-center justify-between"
                   >
                     <div className="flex-1">
                       <p className="text-sm font-medium text-foreground">{weakness.chapter}</p>
                       <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                         <motion.div
                           className="h-full bg-destructive/70 rounded-full"
                           initial={{ width: 0 }}
                           animate={{ width: `${weakness.accuracy}%` }}
                           transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                         />
                       </div>
                     </div>
                     <span className="ml-4 text-sm font-medium text-destructive">
                       {weakness.accuracy}%
                     </span>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
 
             {/* Actions */}
             <motion.div
               className="space-y-3 pt-4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
             >
               <button className="nf-btn-primary flex items-center justify-center gap-2">
                 <Calendar className="w-5 h-5" />
                 {t('mock.dailyFix')}
               </button>
               <button className="nf-btn-outline flex items-center justify-center gap-2">
                 <RotateCcw className="w-5 h-5" />
                 {t('mock.retryWeak')}
               </button>
             </motion.div>
           </motion.div>
         )}
       </div>
 
       <BottomNav />
     </div>
   );
 };
 
 export default MockAnalyzer;