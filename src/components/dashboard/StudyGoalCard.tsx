import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudyGoalCardProps {
  completedQuizzes: number;
  targetQuizzes: number;
  progressPercentage: number;
  xpReward: number;
  title: string;
}

const StudyGoalCard = ({ completedQuizzes, targetQuizzes, progressPercentage, xpReward, title }: StudyGoalCardProps) => {
  const navigate = useNavigate();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <motion.div
      className="glass-card cursor-pointer group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onClick={() => navigate('/daily-challenge')}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        {/* Circular Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <motion.circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-foreground font-display">{progressPercentage}%</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">done</span>
          </div>
        </div>

        {/* Goal Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Today's Goal</span>
          </div>
          <h3 className="nf-heading text-foreground text-base truncate">{title || "Complete Daily Quizzes"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completedQuizzes}/{targetQuizzes} quizzes · <span className="text-warning font-semibold">+{xpReward} XP</span>
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  );
};

export default StudyGoalCard;
