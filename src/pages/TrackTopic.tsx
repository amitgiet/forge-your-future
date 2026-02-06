import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];

const CHAPTERS = {
  Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Physiology']
};

export default function TrackTopic() {
  const [formData, setFormData] = useState({
    subject: '',
    chapter: '',
    topic: ''
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/revisions/start', formData);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/revision';
      }, 2000);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert('Failed to start tracking. This topic may already be tracked.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Topic Added!</h2>
          <p className="text-gray-400">Starting your 7-level revision journey...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Track New Topic</h1>
          <p className="text-gray-400 mt-2">Start your 7-level revision journey for a new topic</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Subject */}
            <div>
              <label className="block text-white font-semibold mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            {formData.subject && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-white font-semibold mb-2">Chapter</label>
                <select
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select Chapter</option>
                  {CHAPTERS[formData.subject as keyof typeof CHAPTERS]?.map((chapter) => (
                    <option key={chapter} value={chapter}>{chapter}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Topic */}
            {formData.chapter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-white font-semibold mb-2">Topic Name</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Newton's Laws of Motion"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-white mb-1">What happens next?</p>
                  <p>We'll schedule your revisions across 7 levels using spaced repetition. You'll get reminders when it's time to revise this topic.</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-bold text-lg disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Tracking'}
            </motion.button>
          </form>
        </motion.div>

        {/* 7-Level Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-white font-bold mb-4">The 7-Level System</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>📚 <strong>Level 1:</strong> Learn (Today)</p>
            <p>🧠 <strong>Level 2:</strong> Immediate Recall (Same day)</p>
            <p>📝 <strong>Level 3:</strong> Short-Term Review (1-2 days)</p>
            <p>🔄 <strong>Level 4:</strong> Weekly Reinforcement (7 days)</p>
            <p>✅ <strong>Level 5:</strong> Monthly Check (30 days)</p>
            <p>📖 <strong>Level 6:</strong> Pre-Exam Review (Before major tests)</p>
            <p>🚀 <strong>Level 7:</strong> Final Boost (Before NEET)</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
