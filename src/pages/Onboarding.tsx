 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { Shield, Brain, BookOpen, ChevronRight } from 'lucide-react';
 
 const steps = [
   {
     key: 'step1',
     icon: Shield,
     gradient: 'from-primary to-primary/60',
   },
   {
     key: 'step2',
     icon: Brain,
     gradient: 'from-secondary to-secondary/60',
   },
   {
     key: 'step3',
     icon: BookOpen,
     gradient: 'from-accent to-accent/60',
   },
 ];
 
 const Onboarding = () => {
   const [currentStep, setCurrentStep] = useState(0);
   const navigate = useNavigate();
   const { t } = useLanguage();
 
   const handleNext = () => {
     if (currentStep < steps.length - 1) {
       setCurrentStep(currentStep + 1);
     }
   };
 
   const handleStart = (isPro: boolean) => {
     // In a real app, this would handle subscription logic
     navigate('/dashboard');
   };
 
   const step = steps[currentStep];
   const Icon = step.icon;
 
   return (
     <div className="min-h-screen flex flex-col bg-background nf-safe-area p-6">
       {/* Progress dots */}
       <div className="flex justify-center gap-2 mb-8">
         {steps.map((_, index) => (
           <motion.div
             key={index}
             className={`h-2 rounded-full transition-all duration-300 ${
               index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
             }`}
             animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
             transition={{ duration: 0.5 }}
           />
         ))}
       </div>
 
       {/* Content */}
       <div className="flex-1 flex flex-col items-center justify-center">
         <AnimatePresence mode="wait">
           <motion.div
             key={currentStep}
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -50 }}
             transition={{ duration: 0.3 }}
             className="text-center"
           >
             {/* Icon */}
             <motion.div
               className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center`}
               initial={{ scale: 0.8, rotate: -10 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: 'spring', stiffness: 200 }}
             >
               <Icon className="w-16 h-16 text-foreground" />
             </motion.div>
 
             {/* Text */}
             <h2 className="text-2xl font-bold text-foreground mb-4">
               {t(`onboarding.${step.key}.title`)}
             </h2>
             <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
               {t(`onboarding.${step.key}.desc`)}
             </p>
           </motion.div>
         </AnimatePresence>
       </div>
 
       {/* Actions */}
       <div className="space-y-3 mt-8">
         {currentStep < steps.length - 1 ? (
           <motion.button
             onClick={handleNext}
             className="nf-btn-primary flex items-center justify-center gap-2"
             whileTap={{ scale: 0.98 }}
           >
             Continue
             <ChevronRight className="w-5 h-5" />
           </motion.button>
         ) : (
           <>
             <motion.button
               onClick={() => handleStart(false)}
               className="nf-btn-outline"
               whileTap={{ scale: 0.98 }}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               {t('onboarding.startFree')}
             </motion.button>
             <motion.button
               onClick={() => handleStart(true)}
               className="nf-btn-primary"
               whileTap={{ scale: 0.98 }}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
             >
               {t('onboarding.proPlan')}
             </motion.button>
           </>
         )}
       </div>
     </div>
   );
 };
 
 export default Onboarding;