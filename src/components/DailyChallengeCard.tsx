import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Clock, Users, ChevronRight, Zap, Trophy, Loader2 } from 'lucide-react';
import apiService from '@/lib/apiService';

const DailyChallengeCard = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaysChallenge();
  }, []);

  const fetchTodaysChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.dailyChallenge.getTodaysChallenge();
      if (response.data?.success) {
        const challengeData = response.data.data;
        setChallenge(challengeData);

        // Check if user already completed from response
        if (challengeData.completed) {
          setHasCompleted(true);
          setUserScore(challengeData.userScore);
        }
      }
    } catch (err: any) {
      console.error('Error fetching daily challenge:', err);
      setError(err.response?.data?.error || 'Failed to load daily challenge');
      // Fallback to mock data if API fails
      setChallenge({
        id: 'fallback',
        topic: 'Cell Division - Mitosis',
        subject: 'Biology',
        difficulty: 'Medium',
        xpReward: 150,
        timeLimit: 10,
        icon: '🧬',
        completed: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-success border-success/30 bg-success/10';
      case 'Medium': return 'text-warning-foreground border-warning/30 bg-warning/10';
      case 'Hard': return 'text-destructive border-destructive/30 bg-destructive/10';
      default: return 'text-muted-foreground border-border bg-muted';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="nf-card flex items-center justify-center py-6"
      >
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </motion.div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="nf-card relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Daily DPP</h3>
            <p className="text-xs text-muted-foreground">Same for everyone!</p>
          </div>
        </div>
        <motion.button
          onClick={() => navigate('/app/leaderboard')}
          className="flex items-center gap-1 text-xs text-secondary font-semibold"
          whileHover={{ x: 3 }}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </motion.button>
      </div>

      {/* Challenge Info */}
      <div className="bg-muted/50 rounded-xl p-3 mb-3 border border-border">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{challenge.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">{challenge.subject}</span>
            </div>
            <h4 className="font-bold text-foreground text-base leading-tight mb-1">
              {challenge.topic}
            </h4>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{challenge.timeLimit} min</span>
        </div>
        <div className="flex items-center gap-1 text-warning-foreground font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>+{challenge.xpReward} XP</span>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        onClick={() => navigate('/app/daily-challenge')}
        className="nf-btn-primary w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Target className="w-5 h-5" />
        {hasCompleted ? 'View Details' : 'Start DPP'}
        <ChevronRight className="w-5 h-5" />
      </motion.button>
      {hasCompleted && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border-2 border-success/30 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm font-bold text-success">Completed!</span>
          </div>
          <span className="text-sm font-black text-success">{userScore}/100</span>
        </div>
      )}
    </motion.div>
  );
};

export default DailyChallengeCard;
