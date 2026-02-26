import { Flame, Star, Upload, BookOpen, Brain, Trophy, Zap, Target, Sparkles, FileText, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import apiService from '@/lib/apiService';
import ShieldCard from '@/components/ShieldCard';
import BottomNav from '@/components/BottomNav';
import ActiveChallenges from '@/components/ActiveChallenges';
import RevisionWidget from '@/components/RevisionWidget';
import ThemeToggle from '@/components/ThemeToggle';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueLines } from '@/store/slices/neuronzSlice';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dueLines } = useAppSelector((state) => state.neuronz);
  const dueCount = dueLines?.total || 0;
  const l2Count = dueLines?.byLevel?.L2?.length || 0;

  const [userRank, setUserRank] = useState<any>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRank();
    dispatch(loadDueLines());
  }, [dispatch]);

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

  const quickActions = [
    {
      icon: Brain,
      label: 'Revise',
      sub: dueCount > 0 ? `${dueCount} due (L2: ${l2Count})` : 'Spaced',
      path: '/revision',
      color: 'success'
    },
    { icon: Sparkles, label: 'Learn', sub: 'AI Path', path: '/my-learning-paths', color: 'warning' },
    { icon: Upload, label: 'Mock', sub: 'Analyze', path: '/mock-analyzer', color: 'secondary' },
    { icon: BookOpen, label: 'NCERT', sub: 'Search', path: '/ncert-search', color: 'primary' },
    { icon: FileText, label: 'Tests', sub: 'Series', path: '/tests', color: 'warning' },
    { icon: Wand2, label: 'AI Quiz', sub: 'Generate', path: '/quiz-generator', color: 'primary' },
  ];

  const statColorMap: Record<string, string> = {
    primary: 'nf-stat-icon-primary',
    secondary: 'nf-stat-icon-secondary',
    warning: 'nf-stat-icon-warning',
    success: 'nf-stat-icon-success',
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-primary w-[400px] h-[400px] -top-48 -right-32 animate-glow-pulse" />
      <div className="glow-orb glow-orb-secondary w-[300px] h-[300px] top-1/3 -left-24 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="glow-orb glow-orb-accent w-[250px] h-[250px] bottom-32 right-0 animate-glow-pulse" style={{ animationDelay: '3s' }} />

      <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="mb-6">
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
            <div>
              <h1 className="nf-heading text-2xl nf-gradient-text tracking-tighter">NEETFORGE</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Let's crush today's goals 💪</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-sm"
                style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                A
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, value: userRank?.streak || 0, label: t('dashboard.streak'), color: 'warning' },
              { icon: Star, value: userRank?.totalXP || 0, label: t('dashboard.score'), color: 'secondary' },
              { icon: Trophy, value: `#${userRank?.rank || '—'}`, label: 'Rank', color: 'primary' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-sm flex flex-col items-center py-3 gap-1.5">
                <div className={`nf-stat-icon ${statColorMap[stat.color]}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-extrabold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Shield Card */}
        <ShieldCard initialMinutes={25} />

        {/* Daily Challenge */}
        <div className="mt-4">
          <DailyChallengeCard />
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-6"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.h3 variants={fadeUp} className="nf-heading text-foreground mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 text-warning" />
            Quick Actions
          </motion.h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                variants={fadeUp}
                onClick={() => navigate(action.path)}
                className="glass-card-sm flex flex-col items-center justify-center py-4 group cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`nf-stat-icon ${statColorMap[action.color]} mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-foreground text-sm">{action.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{action.sub}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Today's Quest */}
        <motion.div
          className="mt-6 glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="nf-heading text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Today's Quest
            </h3>
            <span className="nf-badge nf-badge-primary">+150 XP</span>
          </div>

          <div className="nf-progress-bar mb-3">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">3/5 quizzes completed</span>
            <span className="font-bold nf-gradient-text">65%</span>
          </div>

          <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: '45', label: 'mins studied' },
              { val: '12', label: 'questions' },
              { val: '85%', label: 'accuracy', highlight: true },
            ].map((item, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`text-lg font-extrabold ${item.highlight ? 'text-success' : 'text-foreground'}`}>{item.val}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Challenges */}
        <ActiveChallenges />

        {/* Revision Widget */}
        <RevisionWidget />
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
