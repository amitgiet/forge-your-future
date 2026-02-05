 import { motion } from 'framer-motion';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { User, Flame, Target, BookOpen, Award, Globe } from 'lucide-react';
 import BottomNav from '@/components/BottomNav';
 
 const Profile = () => {
   const { t, language, setLanguage } = useLanguage();
 
   const stats = [
     { icon: Flame, label: t('dashboard.streak'), value: '7 days', color: 'text-secondary' },
     { icon: BookOpen, label: t('profile.quizzesCompleted'), value: '45', color: 'text-primary' },
     { icon: Target, label: t('profile.accuracy'), value: '78%', color: 'text-success' },
     { icon: Award, label: t('dashboard.score'), value: '2,450', color: 'text-accent' },
   ];
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="nf-safe-area p-4 max-w-md mx-auto">
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-8"
         >
           <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
             <User className="w-12 h-12 text-primary-foreground" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">NEET Aspirant</h1>
           <p className="text-muted-foreground">Free Plan</p>
         </motion.div>
 
         {/* Language Toggle */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="nf-card mb-6"
         >
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                 <Globe className="w-5 h-5 text-accent" />
               </div>
               <span className="font-medium text-foreground">{t('profile.language')}</span>
             </div>
             
             <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
               <button
                 onClick={() => setLanguage('en')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                   language === 'en'
                     ? 'bg-primary text-primary-foreground'
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 EN
               </button>
               <button
                 onClick={() => setLanguage('hi')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                   language === 'hi'
                     ? 'bg-primary text-primary-foreground'
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 हिं
               </button>
             </div>
           </div>
         </motion.div>
 
         {/* Stats */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="nf-card"
         >
           <h3 className="font-semibold text-foreground mb-4">{t('profile.stats')}</h3>
           
           <div className="grid grid-cols-2 gap-4">
             {stats.map((stat, index) => (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.2 + index * 0.1 }}
                 className="p-4 rounded-2xl bg-muted/50"
               >
                 <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                 <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                 <p className="text-xs text-muted-foreground">{stat.label}</p>
               </motion.div>
             ))}
           </div>
         </motion.div>
 
         {/* Upgrade CTA */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mt-6"
         >
           <button className="nf-btn-secondary">
             Upgrade to Pro - ₹149/mo
           </button>
         </motion.div>
       </div>
 
       <BottomNav />
     </div>
   );
 };
 
 export default Profile;