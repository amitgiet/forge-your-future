import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';

const LEVEL_ICONS = ['📚', '🧠', '📝', '🔄', '✅', '📖', '🚀'];

export default function RevisionWidget() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  if (isLoading) return null;
  if (!dueLines || dueLines.total === 0) return null;

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
          <div className="text-2xl font-bold text-black">{dueLines.total}</div>
          <div className="text-xs text-gray-400">Due Today</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">0</div>
          <div className="text-xs text-gray-400">Overdue</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{masteryProgress?.masteryPercentage || 0}%</div>
          <div className="text-xs text-gray-400">Mastered</div>
        </div>
      </div>

      {/* Due Topics */}
      <div className="space-y-2">
        {dueLines.lines.slice(0, 3).map((line: any) => (
          <motion.div
            key={line._id}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/revision?revisionId=${line._id}`)}
            className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg flex-shrink-0">{LEVEL_ICONS[line.level - 1]}</span>
                  <span className=" font-semibold text-sm break-words line-clamp-2">
                    {line.lineId?.ncertText || 'NCERT Line'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  <span>{line.lineId?.subject}</span>
                  <span>•</span>
                  <span>Level {line.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <TrendingUp className="w-3 h-3" />
                {Math.round(line.overallAccuracy || 0)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/revision')}
        className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
      >
        Start Revising ({dueLines.total} topics)
      </motion.button>
    </motion.div>
  );
}
