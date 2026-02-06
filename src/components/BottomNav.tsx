import { Home, BookOpen, User, Brain, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: Brain, path: '/revision', label: 'Revise' },
    { icon: BookOpen, path: '/quiz', label: 'Quiz' },
    { icon: Trophy, path: '/mock-analyzer', label: 'Mock' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t-2 border-border z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-2">
        {navItems.map(({ icon: Icon, path, label }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 border-2 border-primary/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 relative z-10 font-semibold ${isActive ? 'text-primary' : ''}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
