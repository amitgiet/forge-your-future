import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueQuestions, getMasteryProgress } from '@/store/slices/neuronzSlice';

const LEVEL_CONFIG = [
  { level: 1, name: 'Temporary Memory', description: 'After 24 hrs', color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/30' },
  { level: 2, name: 'Short Term Memory (Encoding Stage)', description: 'After 3 days', color: 'from-indigo-500/20 to-purple-500/20', borderColor: 'border-indigo-500/30' },
  { level: 3, name: 'Repeating Short Memory (Neurons Formation)', description: 'After 5 days', color: 'from-purple-500/20 to-fuchsia-500/20', borderColor: 'border-purple-500/30' },
  { level: 4, name: 'Arriving Long Term (Connecting Neurons)', description: 'After 7 days', color: 'from-fuchsia-500/20 to-pink-500/20', borderColor: 'border-fuchsia-500/30' },
  { level: 5, name: 'Retaining Long Term (Hippocampus Processing)', description: 'After 10 days', color: 'from-pink-500/20 to-rose-500/20', borderColor: 'border-pink-500/30' },
  { level: 6, name: 'Permanent Stage (Cerebral Cortex Storing)', description: 'After 15 days', color: 'from-orange-500/20 to-amber-500/20', borderColor: 'border-orange-500/30' },
  { level: 7, name: '\uD83D\uDD12 Mastered', description: 'After 30 days', color: 'from-amber-500/20 to-yellow-500/20', borderColor: 'border-yellow-500/30', locked: true },
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
    navigate(`/revision?level=${level}`);
  };

  const totalCompleted = dueQuestions?.masteredTotal || 0;
  const totalTarget = dueQuestions?.allTotal || 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">NeuronZ</h2>
            <p className="text-sm text-muted-foreground font-medium">Spaced Repetition System</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 mt-2">
          Practice questions automatically enter Level 1. Answer correctly to move them up the ladder.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEVEL_CONFIG.map((conf, idx) => {
          const levelKey = `L${conf.level}`;
          const totalAtLevel = dueQuestions?.totalByLevel?.[levelKey]?.total || 0;

          return (
            <motion.div
              key={conf.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleLevelClick(conf.level, totalAtLevel)}
              className={`relative overflow-hidden rounded-2xl border-2 ${conf.borderColor} bg-card hover:border-primary/50 transition-all ${totalAtLevel > 0 && !conf.locked ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'opacity-80 cursor-default'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${conf.color} opacity-50`} />

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/10">
                      <Brain className="w-5 h-5 text-foreground/80" />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight text-foreground">{conf.name}</h3>
                      <p className="text-xs font-semibold text-muted-foreground">{conf.description}</p>
                    </div>
                  </div>
                  {conf.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>

                <div className="flex items-end justify-between mt-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">No of Questions: {totalAtLevel}</p>
                    <p className="text-3xl font-black text-foreground">{totalAtLevel}</p>
                  </div>

                  {!conf.locked && totalAtLevel > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <h4 className="font-bold text-foreground">Total Completed Questions</h4>
            <p className="text-sm text-muted-foreground">Keep tracking your practice to build strong memory.</p>
          </div>
          <p className="text-2xl font-black text-primary">
            {totalCompleted}
            <span className="text-base text-muted-foreground font-semibold">/{totalTarget}</span>
          </p>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalTarget > 0 ? Math.min(100, (totalCompleted / totalTarget) * 100) : 0}%` }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default NeuronzDashboard;
