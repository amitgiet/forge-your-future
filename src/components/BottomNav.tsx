 import { Home, BookOpen, User } from 'lucide-react';
 import { NavLink } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { motion } from 'framer-motion';
 
 const BottomNav = () => {
   const { t } = useLanguage();
 
   const navItems = [
     { to: '/dashboard', icon: Home, label: t('nav.home') },
     { to: '/quiz', icon: BookOpen, label: t('nav.quiz') },
     { to: '/profile', icon: User, label: t('nav.profile') },
   ];
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
       <div className="flex items-center justify-around h-16 max-w-md mx-auto pb-safe">
         {navItems.map((item) => (
           <NavLink
             key={item.to}
             to={item.to}
             className={({ isActive }) =>
               `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all ${
                 isActive ? 'text-primary' : 'text-muted-foreground'
               }`
             }
           >
             {({ isActive }) => (
               <>
                 <motion.div
                   whileTap={{ scale: 0.9 }}
                   className="relative"
                 >
                   <item.icon className="w-6 h-6" />
                   {isActive && (
                     <motion.div
                       layoutId="activeTab"
                       className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                       initial={false}
                       transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                     />
                   )}
                 </motion.div>
                 <span className="text-xs font-medium">{item.label}</span>
               </>
             )}
           </NavLink>
         ))}
       </div>
     </nav>
   );
 };
 
 export default BottomNav;