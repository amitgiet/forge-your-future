import { Flame, Star, Trophy, Zap, BookMarked } from 'lucide-react';
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
import DashboardSkeleton from '@/components/DashboardSkeleton';
import StudyGoalCard from '@/components/dashboard/StudyGoalCard';
import SubjectChips from '@/components/dashboard/SubjectChips';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import TodayStatsBar from '@/components/dashboard/TodayStatsBar';
import StudyResourcesList from '@/components/dashboard/StudyResourcesList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueQuestions } from '@/store/slices/neuronzSlice';

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
  stats: { minutesStudied: number; questions: number; accuracy: number };
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
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetchUserRank(),
      fetchTodayProgress(),
      fetchTodayQuest(),
      fetchTopicSummary(),
    ]).finally(() => {
      setLoading(false);
      setDataReady(true);
    });
    dispatch(loadDueQuestions());
  }, [dispatch]);

  const fetchUserRank = async () => {
    try {
      const response = await apiService.leaderboard.getUserRank();
      if (response.data?.success) setUserRank(response.data.data);
    } catch (error) { console.error('Error fetching user rank:', error); }
  };

  const fetchTodayProgress = async () => {
    try {
      const response = await apiService.auth.getTodayProgress();
      if (response.data?.success && response.data?.data) setTodayProgress(response.data.data);
    } catch (error) { console.error('Error fetching today progress:', error); }
  };

  const fetchTodayQuest = async () => {
    try {
      const response = await apiService.auth.getTodayQuest();
      if (response.data?.success && response.data?.data) setTodayQuest(response.data.data);
    } catch (error) { console.error('Error fetching today quest:', error); }
  };

  const fetchTopicSummary = async () => {
    try {
      const response = await apiService.neuronz.getTopicSummary();
      if (response.data?.success && response.data?.data?.topics) setTopicSummary(response.data.data.topics);
    } catch (error) { console.error('Error fetching NeuronZ topic summary:', error); }
  };

  const statColorMap: Record<string, string> = {
    primary: 'nf-stat-icon-primary',
    secondary: 'nf-stat-icon-secondary',
    warning: 'nf-stat-icon-warning',
    success: 'nf-stat-icon-success',
  };

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      {/* Subtle background orbs */}
      <div className="glow-orb glow-orb-primary w-[350px] h-[350px] -top-40 -right-28 animate-glow-pulse" />
      <div className="glow-orb glow-orb-secondary w-[250px] h-[250px] top-1/2 -left-20 animate-glow-pulse" style={{ animationDelay: '2s' }} />

      <div className="nf-safe-area p-4 max-w-md mx-auto relative z-10">
        {/* Header — always visible */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="nf-heading text-xl nf-gradient-text tracking-tighter">NEETFORGE</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Let's crush today 💪</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm"
              style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow-primary)' }}
              whileTap={{ scale: 0.92 }}
            >
              A
            </motion.button>
          </div>
        </motion.div>

        {loading && !dataReady ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Compact Stats Row */}
            <motion.div
              className="flex items-center justify-between glass-card-sm py-2.5 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {[
                { icon: Flame, value: userRank?.streak || 0, label: t('dashboard.streak'), color: 'warning' },
                { icon: Star, value: userRank?.totalXP || 0, label: t('dashboard.score'), color: 'secondary' },
                { icon: Trophy, value: `#${userRank?.rank || '—'}`, label: 'Rank', color: 'primary' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`nf-stat-icon ${statColorMap[stat.color]} w-8 h-8 rounded-lg`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground leading-none">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Study Goal Ring Card */}
            <StudyGoalCard
              completedQuizzes={todayQuest.completedQuizzes}
              targetQuizzes={todayQuest.targetQuizzes}
              progressPercentage={todayQuest.progressPercentage}
              xpReward={todayQuest.xpReward}
              title={todayQuest.title}
            />

            {/* Today's Stats */}
            <TodayStatsBar
              studyTime={todayProgress.formattedStudyTime || `${todayProgress.studyTimeMinutes}m`}
              questions={todayProgress.questionsAttempted}
              accuracy={todayProgress.accuracy}
            />

            {/* Subject Quick Access */}
            <SubjectChips />

            {/* Quick Actions */}
            <div>
              <h3 className="nf-heading text-foreground mb-2.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-warning" />
                Quick Actions
              </h3>
              <QuickActionGrid dueCount={dueCount} l2Count={l2Count} />
            </div>

            {/* Daily Challenge */}
            <DailyChallengeCard />

            {/* Study Resources */}
            <div>
              <h3 className="nf-heading text-foreground mb-2.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <BookMarked className="w-3.5 h-3.5 text-primary" />
                Resources
              </h3>
              <StudyResourcesList />
            </div>

            {/* Active Challenges */}
            <ActiveChallenges />

            {/* Revision Widget */}
            <RevisionWidget />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
