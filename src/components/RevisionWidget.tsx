import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const LEVEL_ICONS = ['📚', '🧠', '📝', '🔄', '✅', '📖', '🚀'];

export default function RevisionWidget() {
  const [dueRevisions, setDueRevisions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRevisions();
  }, []);

  const loadRevisions = async () => {
    try {
      const [dueRes, analyticsRes] = await Promise.all([
        api.get('/revisions/due'),
        api.get('/revisions/analytics')
      ]);
      setDueRevisions(dueRes.data.data.slice(0, 3)); // Show top 3
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Failed to load revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!analytics || analytics.dueToday === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 nf-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="nf-heading text-foreground">7-Level Revision</h3>
        </div>
        <button
          onClick={() => navigate('/revision-dashboard')}
          className="text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{analytics.dueToday}</div>
          <div className="text-xs text-gray-400">Due Today</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{analytics.overdue}</div>
          <div className="text-xs text-gray-400">Overdue</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{analytics.avgRetention}%</div>
          <div className="text-xs text-gray-400">Retention</div>
        </div>
      </div>

      {/* Due Topics */}
      <div className="space-y-2">
        {dueRevisions.map((revision) => (
          <motion.div
            key={revision._id}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/revision?revisionId=${revision._id}`)}
            className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg flex-shrink-0">{LEVEL_ICONS[revision.currentLevel - 1]}</span>
                  <span className="text-white font-semibold text-sm break-words line-clamp-2">{revision.topic}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  <span>{revision.subject}</span>
                  <span>•</span>
                  <span>Level {revision.currentLevel}</span>
                  {revision.isOverdue && (
                    <>
                      <span>•</span>
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                {revision.retentionScore}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/revision-dashboard')}
        className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
      >
        Start Revising ({analytics.dueToday} topics)
      </motion.button>
    </motion.div>
  );
}
