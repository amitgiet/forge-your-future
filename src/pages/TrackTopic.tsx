import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { trackChapter, loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { apiService } from '@/lib/apiService';

const TrackTopic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(true);

  // Load chapters on mount
  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setLoadingChapters(true);
      const response = await apiService.chapters.getChapters();
      setChapters(response.data.data || []);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      setLoadingChapters(false);
    }
  };

  // Filter chapters by subject
  const filteredChapters = selectedSubject 
    ? chapters.filter((ch) => ch.subject === selectedSubject.toLowerCase())
    : [];

  const handleTrackChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter) return;

    setLoading(true);
    try {
      // Track the chapter using NeuronZ system
      await dispatch(trackChapter(selectedChapter._id)).unwrap();
      
      // Reload due lines and mastery
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/revision');
      }, 2000);
    } catch (error) {
      console.error('Failed to track chapter:', error);
      alert('Failed to track chapter. Please try again.');
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
          <h2 className="text-2xl font-bold text-white mb-2">Chapter Tracked!</h2>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Track New Chapter</h1>
          <p className="text-gray-400 mt-2">Start your 7-level revision journey for a new chapter</p>
        </div>

        {loadingChapters ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-6"
            >
              <form onSubmit={handleTrackChapter} className="space-y-6">
                
                {/* Subject */}
                <div>
                  <label className="block text-white font-semibold mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedChapter(null);
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                {/* Chapter */}
                {selectedSubject && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-white font-semibold mb-2">Chapter</label>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((chapter) => (
                          <button
                            key={chapter._id}
                            type="button"
                            onClick={() => setSelectedChapter(chapter)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedChapter?._id === chapter._id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/20 bg-white/5 hover:border-purple-500/50'
                            }`}
                          >
                            <div className="font-semibold text-white">{chapter.name.en}</div>
                            <div className="text-sm text-gray-400">
                              {chapter.stats?.totalLines || 0} lines • {chapter.subject}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No chapters found for this subject
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Info Box */}
                {selectedChapter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-semibold text-white mb-1">What happens next?</p>
                        <p>We'll track all {selectedChapter.stats?.totalLines || 0} NCERT lines from this chapter and create a 7-level spaced repetition schedule. You'll be reminded when it's time to revise each line.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !selectedChapter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Tracking...' : 'Track Chapter'}
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackTopic;
