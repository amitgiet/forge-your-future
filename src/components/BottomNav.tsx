import { Home, User, MessageCircle, FileText, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/app/dashboard', label: 'Home' },
    { icon: FileText, path: '/app/tests', label: 'Tests' },
    { icon: Sparkles, path: '/app/ai-assistant', label: 'AI' },
    { icon: MessageCircle, path: '/app/social', label: 'Social' },
    { icon: User, path: '/app/profile', label: 'Profile' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="absolute inset-0 bg-card border-t border-border" style={{ boxShadow: '0 -2px 12px -2px rgba(0,0,0,0.08)' }} />
      <div className="max-w-md mx-auto flex justify-around items-center py-1.5 px-1 relative z-10">
        {navItems.map(({ icon: Icon, path, label }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/8"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-0.5 relative z-10 font-semibold ${isActive ? 'text-primary' : ''}`}>
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

