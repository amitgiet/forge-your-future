import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const timer = setTimeout(() => {
      navigate(token ? '/dashboard' : '/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center nf-safe-area relative overflow-hidden">
      {/* Background glows */}
      <div className="glow-orb glow-orb-primary w-[500px] h-[500px] top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-pulse" />
      <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] bottom-1/4 left-1/3 animate-glow-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        {/* Pulsing rings */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: '2px solid rgba(99, 102, 241, 0.3)' }}
          animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: '2px solid rgba(139, 92, 246, 0.3)' }}
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.4, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />

        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Zap className="w-14 h-14 text-white" fill="currentColor" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-4xl font-extrabold nf-gradient-text tracking-tighter"
      >
        NEETFORGE
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-2 text-muted-foreground font-medium text-sm"
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
            className="w-2 h-2 rounded-full"
            style={{
              background: i === 0 ? 'hsl(var(--primary))' : i === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))',
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Splash;
