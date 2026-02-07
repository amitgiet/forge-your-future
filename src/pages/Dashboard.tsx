import { Flame, Star, Upload, BookOpen, Brain, Trophy, Zap, Target, Sparkles, FileText, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import apiService from '@/lib/apiService';
import ShieldCard from '@/components/ShieldCard';
import QuizCard from '@/components/QuizCard';
import BottomNav from '@/components/BottomNav';
import ActiveChallenges from '@/components/ActiveChallenges';
import RevisionWidget from '@/components/RevisionWidget';
import { useRevision } from '@/contexts/RevisionContext';
import ThemeToggle from '@/components/ThemeToggle';
import DailyChallengeCard from '@/components/DailyChallengeCard';

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { getStats } = useRevision();
  const revisionStats = getStats();
  
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRank();
  }, []);

  const fetchUserRank = async () => {
    try {
      setLoading(true);
      const response = await apiService.leaderboard.getUserRank();
      if (response.data?.success) {
        setUserRank(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header with gamified stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Logo & Welcome */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="nf-heading text-2xl nf-gradient-text">NEETFORGE</h1>
              <p className="text-sm text-muted-foreground">Let's crush today's goals! 💪</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                A
              </motion.button>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex gap-3">
            {/* Streak */}
            <motion.div
              className="nf-card-stat flex-1"
              whileHover={{ scale: 1.02 }}
            >
              <div className="nf-stat-icon nf-stat-icon-warning">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {userRank?.streak || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.streak')}</p>
              </div>
            </motion.div>
            
            {/* XP Score */}
            <motion.div
              className="nf-card-stat flex-1"
              whileHover={{ scale: 1.02 }}
            >
              <div className="nf-stat-icon nf-stat-icon-secondary">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {userRank?.totalXP || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.score')}</p>
              </div>
            </motion.div>

            {/* Rank */}
            <motion.div
              className="nf-card-stat"
              whileHover={{ scale: 1.02 }}
            >
              <div className="nf-stat-icon nf-stat-icon-primary">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  #{userRank?.rank || '—'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Rank</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Shield Card */}
        <ShieldCard initialMinutes={25} />

        {/* Daily Challenge */}
        <div className="mt-4">
          <DailyChallengeCard />
        </div>

        {/* Quick Actions - Gamified Style */}
        <div className="mt-6">
          <h3 className="nf-heading text-lg text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={() => navigate('/revision')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="nf-stat-icon nf-stat-icon-success mb-2 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">Revise</span>
              {revisionStats.dueToday > 0 && (
                <span className="nf-badge-success text-[10px] mt-1 px-2 py-0.5 rounded-full">
                  {revisionStats.dueToday} due
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={() => navigate('/my-learning-paths')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.23 }}
            >
              <div className="nf-stat-icon nf-stat-icon-warning mb-2 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">Learn</span>
              <span className="text-[10px] text-muted-foreground mt-1">AI Path</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/mock-analyzer')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="nf-stat-icon nf-stat-icon-secondary mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">Mock</span>
              <span className="text-[10px] text-muted-foreground mt-1">Analyze</span>
            </motion.button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <motion.button
              onClick={() => navigate('/ncert-search')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="nf-stat-icon nf-stat-icon-primary mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">NCERT</span>
              <span className="text-[10px] text-muted-foreground mt-1">Search</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/tests')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33 }}
            >
              <div className="nf-stat-icon nf-stat-icon-warning mb-2 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">Tests</span>
              <span className="text-[10px] text-muted-foreground mt-1">Series</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/quiz-generator')}
              className="nf-card flex flex-col items-center justify-center py-4 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
            >
              <div className="nf-stat-icon nf-stat-icon-primary mb-2 group-hover:scale-110 transition-transform">
                <Wand2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-foreground text-sm">AI Quiz</span>
              <span className="text-[10px] text-muted-foreground mt-1">Generate</span>
            </motion.button>
          </div>
        </div>

        {/* Today's Progress - Gamified */}
        <motion.div
          className="mt-6 nf-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="nf-heading text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Today's Quest
            </h3>
            <span className="nf-badge nf-badge-primary">
              +150 XP
            </span>
          </div>
          
          <div className="nf-progress-bar mb-3">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">3/5 quizzes completed</span>
            <span className="font-bold nf-gradient-text">65%</span>
          </div>
          
          {/* Mini achievements */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <div className="flex-1 text-center">
              <div className="text-lg font-black text-foreground">45</div>
              <div className="text-xs text-muted-foreground">mins studied</div>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1 text-center">
              <div className="text-lg font-black text-foreground">12</div>
              <div className="text-xs text-muted-foreground">questions</div>
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1 text-center">
              <div className="text-lg font-black text-success">85%</div>
              <div className="text-xs text-muted-foreground">accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Active Challenges */}
        <ActiveChallenges />

        {/* 7-Level Revision Widget */}
        <RevisionWidget />
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
