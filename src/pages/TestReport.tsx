import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Clock, Target, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';

export default function TestReport() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await apiService.tests.getAttempt(attemptId!);
      setAttempt(res.data.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const { results, weakAreas, testId } = attempt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Report</h1>
          <p className="text-gray-400">{testId.title}</p>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 mb-6"
        >
          <div className="grid grid-cols-4 gap-6 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">{results.percentage.toFixed(1)}%</div>
              <div className="text-white/80">Your Score</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{results.marksObtained}</div>
              <div className="text-white/80">Marks Obtained</div>
              <div className="text-sm text-white/60">out of {results.totalMarks}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">#{results.rank}</div>
              <div className="text-white/80">Your Rank</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{results.percentile.toFixed(1)}</div>
              <div className="text-white/80">Percentile</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-3xl font-bold text-white">{results.correct}</div>
            <div className="text-gray-400">Correct</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <XCircle className="w-8 h-8 text-red-400 mb-2" />
            <div className="text-3xl font-bold text-white">{results.incorrect}</div>
            <div className="text-gray-400">Incorrect</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <AlertCircle className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-3xl font-bold text-white">{results.skipped}</div>
            <div className="text-gray-400">Skipped</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <Clock className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-3xl font-bold text-white">{Math.floor(results.timeAnalysis.avgTimePerQuestion)}s</div>
            <div className="text-gray-400">Avg Time/Q</div>
          </motion.div>
        </div>

        {/* Subject-wise Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Subject-wise Performance</h2>
          <div className="space-y-4">
            {results.subjectWise.map((subject: any) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{subject.subject}</span>
                  <span className="text-gray-400">{subject.correct}/{subject.total} • {subject.accuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      subject.accuracy >= 80 ? 'bg-green-500' :
                      subject.accuracy >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">Weak Areas Identified</h2>
            </div>
            <div className="space-y-3">
              {weakAreas.map((area: any, idx: number) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{area.chapter}</div>
                      <div className="text-sm text-gray-400">{area.subject} • {area.questionsWrong} wrong • {area.accuracy.toFixed(1)}% accuracy</div>
                    </div>
                    <button
                      onClick={() => navigate(`/revision/track?subject=${area.subject}&chapter=${area.chapter}`)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold flex items-center gap-2"
                    >
                      Fix This
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chapter-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Chapter-wise Analysis</h2>
          <div className="grid grid-cols-2 gap-4">
            {results.chapterWise.map((chapter: any, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <div className="text-white font-semibold mb-1">{chapter.chapter}</div>
                <div className="text-sm text-gray-400 mb-2">{chapter.subject}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{chapter.correct}/{chapter.total}</span>
                  <span className={`text-sm font-bold ${
                    chapter.accuracy >= 80 ? 'text-green-400' :
                    chapter.accuracy >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {chapter.accuracy.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tests')}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold"
          >
            Back to Tests
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/test/${testId._id}/solutions/${attemptId}`)}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
          >
            View Solutions
          </motion.button>
        </div>
      </div>
    </div>
  );
}
