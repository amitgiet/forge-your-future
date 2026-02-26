import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';

const LEVEL_INFO: Record<number, { name: string; icon: string }> = {
  1: { name: 'New', icon: 'L1' },
  2: { name: 'Learning', icon: 'L2' },
  3: { name: 'Short Review', icon: 'L3' },
  4: { name: 'Reinforcement', icon: 'L4' },
  5: { name: 'Strong', icon: 'L5' },
  6: { name: 'Expert', icon: 'L6' },
  7: { name: 'Mastered', icon: 'L7' },
};

export default function RevisionDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  const startOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const overdueCount = useMemo(() => {
    if (!dueLines?.lines?.length) return 0;
    return dueLines.lines.filter((line: any) => {
      if (!line?.nextRevision) return false;
      const nextRevisionDate = new Date(line.nextRevision);
      return !Number.isNaN(nextRevisionDate.getTime()) && nextRevisionDate < startOfToday;
    }).length;
  }, [dueLines, startOfToday]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const dueTotal = dueLines?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">NeuronZ Revision Dashboard</h1>
            <p className="text-gray-400 mt-1">Live due lines from the NeuronZ schedule</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/revision/track')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
          >
            + Track New Topic
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Due Today</p>
                <p className="text-3xl font-bold text-white mt-1">{dueTotal}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{overdueCount}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mastery</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{masteryProgress?.masteryPercentage || 0}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mastered Lines</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{masteryProgress?.masteredLines || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-400" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Due by Level</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((level) => {
              const count = dueLines?.byLevel?.[`L${level}` as keyof NonNullable<typeof dueLines>['byLevel']]?.length || 0;
              return (
                <div key={level} className="text-center bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-sm text-gray-400">{LEVEL_INFO[level].icon}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-gray-400 mt-1">{LEVEL_INFO[level].name}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Due Lines ({dueTotal})</h2>

          {dueTotal === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">All caught up! No NeuronZ revisions due.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueLines?.lines?.map((line: any) => {
                const subject = line?.lineId?.subject || 'Subject';
                const chapter = line?.lineId?.chapter || 'Chapter';
                const text = line?.lineId?.ncertText || 'NCERT Line';

                return (
                  <motion.div
                    key={line._id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/revision?revisionId=${line._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-200 text-xs font-semibold">
                            L{line.level}
                          </span>
                          <span className="text-white font-semibold line-clamp-2">{text}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {subject}
                          </span>
                          <span>{chapter}</span>
                          <span>{Math.round(line.overallAccuracy || 0)}% accuracy</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
                      >
                        Start
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

