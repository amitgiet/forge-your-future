import { Flame, Star, Upload, BookOpen, Brain, Trophy, Zap, Target, Sparkles, FileText, Wand2, BookMarked, Lightbulb, Crown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import apiService from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';
import ActiveChallenges from '@/components/ActiveChallenges';
import RevisionWidget from '@/components/RevisionWidget';
import ThemeToggle from '@/components/ThemeToggle';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueQuestions } from '@/store/slices/neuronzSlice';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface TodayProgressStats {
  studyTimeMinutes: number;
  questionsAttempted: number;
  accuracy: number;
  formattedStudyTime?: string;
}

interface TodayQuestStats {
  hasQuest: boolean;
  challengeId?: string;
  title: string;
  xpReward: number;
  completedQuizzes: number;
  targetQuizzes: number;
  progressPercentage: number;
  stats: {
    minutesStudied: number;
    questions: number;
    accuracy: number;
  };
}

interface TopicSummary {
  topicId: string;
  topic: string;
  subject: string;
  totalTracked: number;
  dueNow: number;
  byLevel: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    L5: number;
    L6: number;
    L7: number;
  };
  masteryPercent: number;
  lastActivityAt: string | null;
}

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dueQuestions } = useAppSelector((state) => state.neuronz);
  const [topicSummary, setTopicSummary] = useState<TopicSummary[]>([]);
  const dueCount = topicSummary.length > 0
    ? topicSummary.reduce((sum, topic) => sum + topic.dueNow, 0)
    : (dueQuestions?.total || 0);
  const l2Count = topicSummary.length > 0
    ? topicSummary.reduce((sum, topic) => sum + (topic.byLevel?.L2 || 0), 0)
    : (dueQuestions?.byLevel?.L2?.length || 0);

  const [userRank, setUserRank] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<TodayProgressStats>({
    studyTimeMinutes: 0,
    questionsAttempted: 0,
    accuracy: 0,
    formattedStudyTime: '0m',
  });
  const [todayQuest, setTodayQuest] = useState<TodayQuestStats>({
    hasQuest: false,
    title: "Today's Quest",
    xpReward: 0,
    completedQuizzes: 0,
    targetQuizzes: 0,
    progressPercentage: 0,
    stats: {
      minutesStudied: 0,
      questions: 0,
      accuracy: 0,
    },
  });
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRank();
    fetchTodayProgress();
    fetchTodayQuest();
    fetchTopicSummary();
    dispatch(loadDueQuestions());
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

  const fetchTodayProgress = async () => {
    try {
      const response = await apiService.auth.getTodayProgress();
      if (response.data?.success && response.data?.data) {
        setTodayProgress(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today progress:', error);
    }
  };

  const fetchTodayQuest = async () => {
    try {
      const response = await apiService.auth.getTodayQuest();
      if (response.data?.success && response.data?.data) {
        setTodayQuest(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching today quest:', error);
    }
  };

  const fetchTopicSummary = async () => {
    try {
      const response = await apiService.neuronz.getTopicSummary();
      if (response.data?.success && response.data?.data?.topics) {
        setTopicSummary(response.data.data.topics);
      }
    } catch (error) {
      console.error('Error fetching NeuronZ topic summary:', error);
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
    { icon: FileText, label: 'Mock Tests', sub: 'Series', path: '/tests', color: 'warning' },
    { icon: Wand2, label: 'AI Quiz', sub: 'Generate', path: '/quiz-generator', color: 'primary' },
    { icon: Target, label: 'Analytics', sub: 'My Stats', path: '/analytics', color: 'secondary' },
    { icon: Star, label: 'Doubts', sub: 'Forum', path: '/doubts', color: 'success' },
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

        {/* Study Stats Overview */}
        <motion.div
          className="glass-card mt-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="nf-heading text-foreground text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: todayProgress?.formattedStudyTime || `${todayProgress.studyTimeMinutes}m`, label: 'Study Time', color: 'primary' },
              { value: String(todayProgress.questionsAttempted || 0), label: 'Questions', color: 'success' },
              { value: `${todayProgress.accuracy || 0}%`, label: 'Accuracy', color: 'warning' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-xl font-extrabold ${s.color === 'primary' ? 'text-primary' : s.color === 'success' ? 'text-success' : 'text-warning'
                  }`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

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
              {todayQuest.title || "Today's Quest"}
            </h3>
            <span className="nf-badge nf-badge-primary">+{todayQuest.xpReward || 0} XP</span>
          </div>

          <div className="nf-progress-bar mb-3">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${todayQuest.progressPercentage || 0}%` }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {todayQuest.completedQuizzes || 0}/{todayQuest.targetQuizzes || 0} quizzes completed
            </span>
            <span className="font-bold nf-gradient-text">{todayQuest.progressPercentage || 0}%</span>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            {[
              { val: String(todayQuest.stats?.minutesStudied || 0), label: 'mins studied' },
              { val: String(todayQuest.stats?.questions || 0), label: 'questions' },
              { val: `${todayQuest.stats?.accuracy || 0}%`, label: 'accuracy', highlight: true },
            ].map((item, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`text-lg font-extrabold ${item.highlight ? 'text-success' : 'text-foreground'}`}>{item.val}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Resources Cards */}
        <motion.div
          className="mt-6"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.h3 variants={fadeUp} className="nf-heading text-foreground mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
            <BookMarked className="w-4 h-4 text-primary" />
            Study Resources
          </motion.h3>
          <div className="space-y-3">
            {[
              {
                icon: BookOpen,
                title: 'Question Bank',
                description: 'Biology · Chemistry · Physics topics',
                color: 'success',
                path: '/curriculum-browser',
              },
              {
                icon: BookMarked,
                title: 'PYQ Marked Notes',
                description: 'Physics, Biology, Chemistry',
                color: 'primary',
                path: '/pyq-marked-ncert',
              },
              {
                icon: Lightbulb,
                title: 'Important Topics',
                description: 'Chapter-wise essentials',
                color: 'warning',
                path: '#',
              },
              {
                icon: Crown,
                title: "Toppers' Essentials",
                description: 'Expert study guides',
                color: 'success',
                path: '#',
              },
            ].map((resource, index) => (
              <motion.button
                key={index}
                variants={fadeUp}
                onClick={() => navigate(resource.path)}
                disabled={resource.path === '#'}
                className={`w-full p-4 rounded-2xl flex items-center gap-3 glass-card group cursor-pointer transition-all ${resource.path === '#' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/20'
                  }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`p-3 rounded-lg group-hover:scale-110 transition-transform ${resource.color === 'primary'
                    ? 'bg-primary/20 text-primary'
                    : resource.color === 'warning'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                    }`}
                >
                  <resource.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground text-sm">{resource.title}</p>
                  <p className="text-[10px] text-muted-foreground">{resource.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.button>
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
