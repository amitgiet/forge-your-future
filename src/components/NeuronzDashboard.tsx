import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Lock, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueQuestions, getMasteryProgress } from '@/store/slices/neuronzSlice';

const LEVEL_CONFIG = [
  { level: 1, name: 'Temporary Memory', description: 'After 24 hrs', emoji: '🧠', accent: 'bg-blue-500' },
  { level: 2, name: 'Short Term (Encoding)', description: 'After 3 days', emoji: '⚡', accent: 'bg-indigo-500' },
  { level: 3, name: 'Repeating Short (Neurons)', description: 'After 5 days', emoji: '🔗', accent: 'bg-purple-500' },
  { level: 4, name: 'Arriving Long Term', description: 'After 7 days', emoji: '🌟', accent: 'bg-fuchsia-500' },
  { level: 5, name: 'Retaining Long Term', description: 'After 10 days', emoji: '💪', accent: 'bg-pink-500' },
  { level: 6, name: 'Permanent Stage', description: 'After 15 days', emoji: '🏆', accent: 'bg-orange-500' },
  { level: 7, name: 'Mastered', description: 'After 30 days', emoji: '👑', accent: 'bg-amber-500', locked: true },
];

const NeuronzDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dueQuestions, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueQuestions());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleLevelClick = (level: number, totalQuestions: number) => {
    if (totalQuestions === 0 || level === 7) return;
    navigate(`/app/revision?level=${level}`);
  };

  const totalCompleted = dueQuestions?.masteredTotal || 0;
  const totalTarget = dueQuestions?.allTotal || 0;
  const progressPercent = totalTarget > 0 ? Math.min(100, (totalCompleted / totalTarget) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-md">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">NeuronZ</h2>
          <p className="text-xs text-muted-foreground">Spaced Repetition System</p>
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3"
      >
        <p className="text-xs text-foreground/70 leading-relaxed">
          <Zap className="w-3.5 h-3.5 inline-block mr-1 text-primary" />
          Practice questions enter Level 1. Answer correctly to move them up the memory ladder.
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-4 shadow-sm"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Overall Progress</h4>
          </div>
          <span className="text-lg font-bold text-primary">
            {totalCompleted}<span className="text-xs text-muted-foreground font-medium">/{totalTarget}</span>
          </span>
        </div>
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {progressPercent.toFixed(0)}% mastered · Keep practicing to build strong memory
        </p>
      </motion.div>

      {/* Level Cards */}
      <div className="space-y-3">
        {LEVEL_CONFIG.map((conf, idx) => {
          const levelKey = `L${conf.level}`;
          const dueAtLevel = dueQuestions?.byLevel?.[levelKey as keyof NonNullable<typeof dueQuestions>['byLevel']]?.length || 0;
          const totalAtLevel = dueQuestions?.totalByLevel?.[levelKey]?.total || 0;
          const isClickable = dueAtLevel > 0 && !conf.locked;

          return (
            <motion.div
              key={conf.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => handleLevelClick(conf.level, dueAtLevel)}
              className={`bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 transition-all shadow-sm ${
                isClickable
                  ? 'cursor-pointer hover:border-primary/40 hover:shadow-md active:scale-[0.98]'
                  : 'opacity-60 cursor-default'
              }`}
            >
              {/* Level indicator */}
              <div className={`w-10 h-10 rounded-xl ${conf.accent} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-lg">{conf.emoji}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    L{conf.level} · {conf.name}
                  </h3>
                  {conf.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{conf.description}</p>
              </div>

              {/* Count + Arrow */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{dueAtLevel}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Due Now</p>
                  <p className="text-[10px] text-muted-foreground">{totalAtLevel} tracked</p>
                </div>
                {isClickable && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NeuronzDashboard;
