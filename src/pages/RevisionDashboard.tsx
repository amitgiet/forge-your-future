import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, Target, Zap } from 'lucide-react';
import api from '../lib/api';

const LEVEL_INFO = {
  1: { name: 'Learn', color: 'blue', icon: '📚' },
  2: { name: 'Immediate Recall', color: 'purple', icon: '🧠' },
  3: { name: 'Short-Term Review', color: 'indigo', icon: '📝' },
  4: { name: 'Weekly Reinforcement', color: 'cyan', icon: '🔄' },
  5: { name: 'Monthly Check', color: 'green', icon: '✅' },
  6: { name: 'Pre-Exam Review', color: 'orange', icon: '📖' },
  7: { name: 'Final Boost', color: 'red', icon: '🚀' }
};

const PRIORITY_COLORS = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

export default function RevisionDashboard() {
  const navigate = useNavigate();
  const [dueRevisions, setDueRevisions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load revisions first
      const dueRes = await api.get('/revisions/due');
      setDueRevisions(dueRes.data.data);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Load analytics
      const analyticsRes = await api.get('/revisions/analytics');
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Failed to load revision data:', error);
      // Set empty data on error so page still renders
      setDueRevisions([]);
      setAnalytics({
        dueToday: 0,
        overdue: 0,
        avgRetention: 0,
        mastered: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartRevision = (revision) => {
    setSelectedRevision(revision);
    // Use react-router navigation instead of window.location
    navigate(`/revision?revisionId=${revision._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">7-Level Revision System</h1>
            <p className="text-gray-400 mt-1">Science-backed spaced repetition for NEET</p>
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

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Due Today</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.dueToday}</p>
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
                  <p className="text-3xl font-bold text-red-400 mt-1">{analytics.overdue}</p>
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
                  <p className="text-gray-400 text-sm">Avg Retention</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{analytics.avgRetention}%</p>
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
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.completed}/{analytics.totalTopics}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-blue-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* 7-Level Progress */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Progress Across 7 Levels</h2>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                const info = LEVEL_INFO[level];
                const count = analytics.byLevel[`level${level}`];
                return (
                  <div key={level} className="text-center">
                    <div className="text-2xl mb-2">{info.icon}</div>
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-xs text-gray-400 mt-1">{info.name}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Due Revisions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Due for Revision ({dueRevisions.length})
          </h2>
          
          {dueRevisions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">All caught up! No revisions due today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueRevisions.map((revision) => {
                const levelInfo = LEVEL_INFO[revision.currentLevel];
                return (
                  <motion.div
                    key={revision._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => handleStartRevision(revision)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[revision.priority]}`}></span>
                          <span className="text-white font-semibold">{revision.topic}</span>
                          <span className="text-xs text-gray-400">{revision.subject} • {revision.chapter}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Target className="w-4 h-4" />
                            Level {revision.currentLevel}: {levelInfo.name}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            {revision.retentionScore}% retention
                          </span>
                          {revision.isOverdue && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
                      >
                        Start Revision
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
