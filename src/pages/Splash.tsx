import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    const timer = setTimeout(() => {
      if (token) {
        // Verify token is valid by checking auth
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 2000);

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
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-primary/30"
          animate={{ 
            scale: [1, 1.3, 1.3],
            opacity: [0.6, 0, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-3xl border-4 border-secondary/30"
          animate={{ 
            scale: [1, 1.5, 1.5],
            opacity: [0.4, 0, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary via-primary to-warning flex items-center justify-center shadow-glow-primary border-4 border-white">
          <Zap className="w-14 h-14 text-white" fill="currentColor" />
        </div>
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-4xl font-black nf-gradient-text font-display"
      >
        NEETFORGE
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-2 text-muted-foreground font-semibold flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-warning" />
        Forge your future
        <Sparkles className="w-4 h-4 text-warning" />
      </motion.p>
      
      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-3 mt-12"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              background: i === 0 
                ? 'hsl(var(--primary))' 
                : i === 1 
                ? 'hsl(var(--secondary))' 
                : 'hsl(var(--warning))'
            }}
            animate={{ 
              scale: [1, 1.4, 1],
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
