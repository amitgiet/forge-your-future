 import { useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Zap } from 'lucide-react';
 
 const Splash = () => {
   const navigate = useNavigate();
 
   useEffect(() => {
     const timer = setTimeout(() => {
       navigate('/onboarding');
     }, 2500);
 
     return () => clearTimeout(timer);
   }, [navigate]);
 
   return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-background nf-safe-area">
       <motion.div
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ 
           type: 'spring', 
           stiffness: 200, 
           damping: 15,
           duration: 0.8 
         }}
         className="relative"
       >
         {/* Glow rings */}
         <motion.div
           className="absolute inset-0 rounded-full"
           animate={{ 
             boxShadow: [
               '0 0 0 0 hsla(185, 95%, 55%, 0.4)',
               '0 0 0 40px hsla(185, 95%, 55%, 0)',
             ],
           }}
           transition={{ duration: 1.5, repeat: Infinity }}
         />
         
         <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
           <Zap className="w-12 h-12 text-primary-foreground" fill="currentColor" />
         </div>
       </motion.div>
       
       <motion.h1
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4, duration: 0.5 }}
         className="mt-8 text-3xl font-bold nf-gradient-text"
       >
         NEETFORGE
       </motion.h1>
       
       <motion.p
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.6, duration: 0.5 }}
         className="mt-2 text-muted-foreground"
       >
         Forge your future
       </motion.p>
       
       {/* Loading dots */}
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1 }}
         className="flex gap-2 mt-12"
       >
         {[0, 1, 2].map((i) => (
           <motion.div
             key={i}
             className="w-2 h-2 rounded-full bg-primary"
             animate={{ 
               scale: [1, 1.5, 1],
               opacity: [0.5, 1, 0.5],
             }}
             transition={{ 
               duration: 0.8, 
               repeat: Infinity, 
               delay: i * 0.2,
             }}
           />
         ))}
       </motion.div>
     </div>
   );
 };
 
 export default Splash;