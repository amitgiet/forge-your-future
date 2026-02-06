import { Shield, Pause, Play } from 'lucide-react';
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

  const totalSeconds = initialMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

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
    setTimeout(() => setIsPaused(false), 5 * 60 * 1000);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  return (
    <motion.div
      className="nf-card-achievement relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#shieldGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--warning))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className={`w-6 h-6 ${isPaused ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
          </div>

          <div>
            <h3 className="nf-heading text-foreground text-sm mb-0.5">{t('dashboard.shield')}</h3>
            <motion.p
              key={timeLeft}
              className="text-3xl font-black nf-gradient-text"
              animate={timeLeft <= 60 && !isPaused ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: timeLeft <= 60 ? Infinity : 0 }}
            >
              {formatTime(timeLeft)}
            </motion.p>
            {isPaused && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                Paused for 5 min
              </motion.span>
            )}
          </div>
        </div>
        
        <motion.button
          onClick={isPaused ? handleResume : handlePause}
          className={`nf-btn-icon ${isPaused ? 'border-success text-success' : 'border-primary text-primary'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ShieldCard;
