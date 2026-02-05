 import { Shield, Pause } from 'lucide-react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { motion } from 'framer-motion';
 import { useState, useEffect } from 'react';
 
 interface ShieldCardProps {
   initialMinutes?: number;
 }
 
 const ShieldCard = ({ initialMinutes = 25 }: ShieldCardProps) => {
   const { t } = useLanguage();
   const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
   const [isPaused, setIsPaused] = useState(false);
 
   useEffect(() => {
     if (isPaused || timeLeft <= 0) return;
 
     const interval = setInterval(() => {
       setTimeLeft((prev) => Math.max(0, prev - 1));
     }, 1000);
 
     return () => clearInterval(interval);
   }, [isPaused, timeLeft]);
 
   const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };
 
   const handlePause = () => {
     setIsPaused(true);
     setTimeout(() => setIsPaused(false), 5 * 60 * 1000); // Resume after 5 minutes
   };
 
   return (
     <motion.div
       className="nf-card-glass relative overflow-hidden"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4 }}
     >
       {/* Glow effect */}
       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
       
       <div className="relative flex items-center justify-between">
         <div className="flex items-center gap-3">
           <motion.div
             className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center"
             animate={!isPaused ? { scale: [1, 1.05, 1] } : {}}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Shield className="w-6 h-6 text-primary" />
           </motion.div>
           <div>
             <h3 className="font-semibold text-foreground">{t('dashboard.shield')}</h3>
             <motion.p
               key={timeLeft}
               className="text-2xl font-bold nf-gradient-text"
               animate={timeLeft <= 60 ? { scale: [1, 1.05, 1] } : {}}
               transition={{ duration: 0.5, repeat: timeLeft <= 60 ? Infinity : 0 }}
             >
               {formatTime(timeLeft)}
             </motion.p>
           </div>
         </div>
         
         <button
           onClick={handlePause}
           disabled={isPaused}
           className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
             isPaused
               ? 'bg-muted text-muted-foreground'
               : 'bg-secondary/20 text-secondary hover:bg-secondary/30'
           }`}
         >
           <Pause className="w-4 h-4" />
           {t('dashboard.pause')}
         </button>
       </div>
       
       {isPaused && (
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="mt-3 text-xs text-muted-foreground text-center"
         >
           Shield paused for 5 minutes
         </motion.p>
       )}
     </motion.div>
   );
 };
 
 export default ShieldCard;