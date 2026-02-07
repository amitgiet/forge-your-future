import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Flame, Zap, Crown, Target, TrendingUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  totalXP: number;
  streak: number;
  completedToday: boolean;
}

// Mock leaderboard data
const getLeaderboardData = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem('leaderboard');
  const userEntry = stored ? JSON.parse(stored) : [];
  
  const mockData: LeaderboardEntry[] = [
    { rank: 1, name: 'Priya S.', avatar: 'P', score: 98, totalXP: 15420, streak: 45, completedToday: true },
    { rank: 2, name: 'Rahul M.', avatar: 'R', score: 95, totalXP: 14850, streak: 38, completedToday: true },
    { rank: 3, name: 'Ananya K.', avatar: 'A', score: 92, totalXP: 13200, streak: 32, completedToday: true },
    { rank: 4, name: 'Vikram T.', avatar: 'V', score: 88, totalXP: 12100, streak: 28, completedToday: true },
    { rank: 5, name: 'Sneha R.', avatar: 'S', score: 85, totalXP: 11500, streak: 25, completedToday: false },
    { rank: 6, name: 'Arjun P.', avatar: 'A', score: 82, totalXP: 10800, streak: 22, completedToday: true },
    { rank: 7, name: 'Kavya N.', avatar: 'K', score: 80, totalXP: 10200, streak: 20, completedToday: false },
    { rank: 8, name: 'Rohan D.', avatar: 'R', score: 78, totalXP: 9500, streak: 18, completedToday: true },
    { rank: 9, name: 'Meera J.', avatar: 'M', score: 75, totalXP: 8900, streak: 15, completedToday: true },
    { rank: 10, name: 'Aditya B.', avatar: 'A', score: 72, totalXP: 8200, streak: 12, completedToday: false },
  ];

  // Merge user data if exists
  const currentUser = userEntry.find((e: any) => e.name === 'Demo User');
  if (currentUser) {
    // Find position based on score
    let inserted = false;
    const merged = mockData.map((entry, i) => {
      if (!inserted && currentUser.totalXP > entry.totalXP) {
        inserted = true;
        return { ...currentUser, rank: i + 1, avatar: 'Y' };
      }
      return { ...entry, rank: inserted ? entry.rank + 1 : entry.rank };
    });
    
    if (!inserted) {
      merged.push({ ...currentUser, rank: 11, avatar: 'Y' });
    }
    
    return merged.slice(0, 10);
  }

  return mockData;
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<'daily' | 'weekly' | 'allTime'>('daily');

  useEffect(() => {
    setLeaderboard(getLeaderboardData());
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
      case 2: return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600';
      case 3: return 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700';
      default: return 'bg-card border-border';
    }
  };

  const currentUserRank = leaderboard.findIndex(e => e.name === 'Demo User') + 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="nf-btn-icon"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning-foreground" />
              Leaderboard
            </h1>
            <p className="text-xs text-muted-foreground">Daily Challenge Rankings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['daily', 'weekly', 'allTime'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t === 'daily' ? 'Today' : t === 'weekly' ? 'This Week' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 mb-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xl mb-2 border-4 border-white dark:border-gray-800 shadow-lg">
              {leaderboard[1]?.avatar}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{leaderboard[1]?.name}</p>
            <p className="text-xs text-muted-foreground">{leaderboard[1]?.totalXP.toLocaleString()} XP</p>
            <div className="h-16 bg-gradient-to-t from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-500 dark:text-gray-300">2</span>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center"
          >
            <div className="relative">
              <Crown className="w-6 h-6 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2" />
              <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl mb-2 border-4 border-white dark:border-gray-800 shadow-xl">
                {leaderboard[0]?.avatar}
              </div>
            </div>
            <p className="font-bold text-foreground truncate">{leaderboard[0]?.name}</p>
            <p className="text-xs text-muted-foreground">{leaderboard[0]?.totalXP.toLocaleString()} XP</p>
            <div className="h-24 bg-gradient-to-t from-yellow-300 to-yellow-200 dark:from-yellow-700 dark:to-yellow-600 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-3xl font-black text-yellow-600 dark:text-yellow-300">1</span>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl mb-2 border-4 border-white dark:border-gray-800 shadow-lg">
              {leaderboard[2]?.avatar}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{leaderboard[2]?.name}</p>
            <p className="text-xs text-muted-foreground">{leaderboard[2]?.totalXP.toLocaleString()} XP</p>
            <div className="h-12 bg-gradient-to-t from-amber-300 to-amber-200 dark:from-amber-700 dark:to-amber-600 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-xl font-black text-amber-600 dark:text-amber-300">3</span>
            </div>
          </motion.div>
        </div>

        {/* Your Position Card */}
        {currentUserRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card-achievement mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold">
                Y
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Your Position</p>
                <p className="text-xs text-muted-foreground">Keep going! You're doing great</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black nf-gradient-text">#{currentUserRank || '—'}</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3 today</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {leaderboard.slice(3).map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 ${getRankStyle(entry.rank)} ${
                entry.name === 'Demo User' ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-foreground border-2 border-border">
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">
                  {entry.name}
                  {entry.name === 'Demo User' && <span className="text-xs text-primary ml-1">(You)</span>}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-warning-foreground" />
                    {entry.totalXP.toLocaleString()} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" />
                    {entry.streak} days
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-foreground">{entry.score}%</p>
                {entry.completedToday && (
                  <span className="text-xs text-success font-medium">✓ Done</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {!leaderboard.find(e => e.name === 'Demo User')?.completedToday && (
          <motion.button
            onClick={() => navigate('/daily-challenge')}
            className="nf-btn-primary w-full mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="w-5 h-5" />
            Take Today's Challenge
          </motion.button>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Leaderboard;
