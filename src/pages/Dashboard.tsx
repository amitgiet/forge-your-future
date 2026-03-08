import { Flame, Star, Upload, BookOpen, Brain, Trophy, Zap, Target, Sparkles, FileText, Wand2, BookMarked, ChevronRight, BarChart3, MessageCircleQuestion } from 'lucide-react';
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
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
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
  byLevel: { L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number };
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
    studyTimeMinutes: 0, questionsAttempted: 0, accuracy: 0, formattedStudyTime: '0m',
  });
  const [todayQuest, setTodayQuest] = useState<TodayQuestStats>({
    hasQuest: false, title: "Today's Quest", xpReward: 0,
    completedQuizzes: 0, targetQuizzes: 0, progressPercentage: 0,
    stats: { minutesStudied: 0, questions: 0, accuracy: 0 },
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
      if (response.data?.success) setUserRank(response.data.data);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayProgress = async () => {
    try {
      const response = await apiService.auth.getTodayProgress();
      if (response.data?.success && response.data?.data) setTodayProgress(response.data.data);
    } catch (error) {
      console.error('Error fetching today progress:', error);
    }
  };

  const fetchTodayQuest = async () => {
    try {
      const response = await apiService.auth.getTodayQuest();
      if (response.data?.success && response.data?.data) setTodayQuest(response.data.data);
    } catch (error) {
      console.error('Error fetching today quest:', error);
    }
  };

  const fetchTopicSummary = async () => {
    try {
      const response = await apiService.neuronz.getTopicSummary();
      if (response.data?.success && response.data?.data?.topics) setTopicSummary(response.data.data.topics);
    } catch (error) {
      console.error('Error fetching NeuronZ topic summary:', error);
    }
  };

  const quickActions = [
    { icon: Brain, label: 'Revise', sub: dueCount > 0 ? `${dueCount} due` : 'Spaced', path: '/revision', emoji: '🧠' },
    { icon: BookOpen, label: 'NCERT', sub: 'Search', path: '/ncert-search', emoji: '📖' },
    { icon: FileText, label: 'Tests', sub: 'Series', path: '/tests', emoji: '📝' },
    { icon: Wand2, label: 'AI Quiz', sub: 'Generate', path: '/quiz-generator', emoji: '✨' },
    { icon: Sparkles, label: 'Learn', sub: 'AI Path', path: '/my-learning-paths', emoji: '🚀' },
    { icon: Upload, label: 'Mock', sub: 'Analyze', path: '/mock-analyzer', emoji: '📊' },
    { icon: BarChart3, label: 'Analytics', sub: 'My Stats', path: '/analytics', emoji: '📈' },
    { icon: MessageCircleQuestion, label: 'Doubts', sub: 'Forum', path: '/doubts', emoji: '💬' },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-md mx-auto px-4 pt-4 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="mb-5">
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">NEETFORGE</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Let's crush today's goals 💪</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm"
                whileTap={{ scale: 0.95 }}
              >
                A
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, value: userRank?.streak || 0, label: t('dashboard.streak'), emoji: '🔥' },
              { icon: Star, value: userRank?.totalXP || 0, label: t('dashboard.score'), emoji: '⭐' },
              { icon: Trophy, value: `#${userRank?.rank || '—'}`, label: 'Rank', emoji: '🏆' },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl flex flex-col items-center py-3 gap-1">
                <span className="text-lg">{stat.emoji}</span>
                <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Today's Progress ───────────────────────────────────────── */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: todayProgress?.formattedStudyTime || `${todayProgress.studyTimeMinutes}m`, label: 'Study Time' },
              { value: String(todayProgress.questionsAttempted || 0), label: 'Questions' },
              { value: `${todayProgress.accuracy || 0}%`, label: 'Accuracy' },
            ].map((s, i) => (
              <div key={i} className="text-center bg-background rounded-xl py-2.5">
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Daily Challenge ────────────────────────────────────────── */}
        <div className="mb-4">
          <DailyChallengeCard />
        </div>

        {/* ── Today's Quest ──────────────────────────────────────────── */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-4 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {todayQuest.title || "Today's Quest"}
            </h3>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              +{todayQuest.xpReward || 0} XP
            </span>
          </div>

          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${todayQuest.progressPercentage || 0}%` }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between text-xs mb-3">
            <span className="text-muted-foreground">
              {todayQuest.completedQuizzes || 0}/{todayQuest.targetQuizzes || 0} quizzes
            </span>
            <span className="font-bold text-primary">{todayQuest.progressPercentage || 0}%</span>
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            {[
              { val: String(todayQuest.stats?.minutesStudied || 0), label: 'mins' },
              { val: String(todayQuest.stats?.questions || 0), label: 'questions' },
              { val: `${todayQuest.stats?.accuracy || 0}%`, label: 'accuracy' },
            ].map((item, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-base font-bold text-foreground">{item.val}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Actions ──────────────────────────────────────────── */}
        <motion.div className="mb-4" initial="hidden" animate="show" variants={stagger}>
          <motion.h3 variants={fadeUp} className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-primary" />
            Quick Actions
          </motion.h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                variants={fadeUp}
                onClick={() => navigate(action.path)}
                className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-3 hover:shadow-sm hover:border-primary/20 transition-all"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl mb-1">{action.emoji}</span>
                <span className="font-semibold text-foreground text-xs">{action.label}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{action.sub}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Revision Widget ────────────────────────────────────────── */}
        <RevisionWidget />

        {/* ── Study Resources ────────────────────────────────────────── */}
        <motion.div
          className="mt-4"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.h3 variants={fadeUp} className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
            <BookMarked className="w-4 h-4 text-primary" />
            Study Resources
          </motion.h3>
          <div className="space-y-2">
            {[
              {
                title: 'Question Bank',
                description: 'Biology · Chemistry · Physics',
                emoji: '📚',
                path: '/curriculum-browser',
              },
              {
                title: 'PYQ Marked Notes',
                description: 'Previous year annotated NCERT',
                emoji: '📝',
                path: '/pyq-marked-ncert',
              },
            ].map((resource, index) => (
              <motion.button
                key={index}
                variants={fadeUp}
                onClick={() => navigate(resource.path)}
                className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-3 hover:shadow-sm hover:border-primary/20 transition-all text-left"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                  {resource.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Active Challenges ──────────────────────────────────────── */}
        <ActiveChallenges />
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
