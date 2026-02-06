import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuizCardProps {
  topic: string;
  duration: number;
  questionsCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const QuizCard = ({ topic, duration, questionsCount, difficulty = 'medium' }: QuizCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const difficultyConfig = {
    easy: { 
      badge: 'nf-badge-success', 
      label: 'Easy',
      xp: '+50 XP'
    },
    medium: { 
      badge: 'nf-badge-warning', 
      label: 'Medium',
      xp: '+100 XP'
    },
    hard: { 
      badge: 'nf-badge-primary', 
      label: 'Hard',
      xp: '+200 XP'
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <motion.div
      className="nf-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`nf-badge ${config.badge}`}>
              {t('dashboard.currentTopic')}
            </span>
            <span className="nf-badge nf-badge-outline text-xs">
              {config.label}
            </span>
          </div>
          <h3 className="nf-heading text-lg text-foreground">{topic}</h3>
        </div>
        <div className="nf-xp-counter">
          <Sparkles className="w-3.5 h-3.5" />
          {config.xp}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{duration} min</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border-strong" />
        <span className="font-medium">{questionsCount} questions</span>
      </div>
      
      <motion.button
        onClick={() => navigate('/quiz')}
        className="nf-btn-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('dashboard.startQuiz')}
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default QuizCard;
