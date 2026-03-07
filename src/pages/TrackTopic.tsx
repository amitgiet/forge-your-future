import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { trackChapter, loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { apiService } from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';

const SUBJECTS = [
  { id: 'Physics', color: 'bg-blue-500' },
  { id: 'Chemistry', color: 'bg-green-500' },
  { id: 'Biology', color: 'bg-pink-500' },
];

const TrackTopic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(true);

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

  const filteredChapters = selectedSubject
    ? chapters.filter((ch) => ch.subject?.toLowerCase() === selectedSubject.toLowerCase())
    : [];

  const handleTrackChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter) return;
    setLoading(true);
    try {
      await dispatch(trackChapter(selectedChapter._id)).unwrap();
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      setSuccess(true);
      setTimeout(() => navigate('/revision'), 2000);
    } catch (error) {
      console.error('Failed to track chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Chapter Tracked!</h2>
          <p className="text-sm text-muted-foreground">Starting your 7-level revision journey...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="nf-safe-area">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground">Track New Chapter</h1>
              <p className="text-xs text-muted-foreground">Start your 7-level journey</p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto space-y-4">
          {loadingChapters ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleTrackChapter} className="space-y-4">
              {/* Subject Pills */}
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Select Subject</label>
                <div className="flex gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedSubject(s.id); setSelectedChapter(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        selectedSubject === s.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapters */}
              {selectedSubject && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose Chapter</label>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-border">
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((chapter: any) => (
                          <button
                            key={chapter._id}
                            type="button"
                            onClick={() => setSelectedChapter(chapter)}
                            className={`w-full text-left px-4 py-3 transition-all ${
                              selectedChapter?._id === chapter._id
                                ? 'bg-primary/5 border-l-2 border-l-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">{chapter.name?.en}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {chapter.stats?.totalLines || 0} lines · {chapter.subject}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="py-10 text-center text-muted-foreground text-sm">
                          No chapters found
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Info Box */}
              {selectedChapter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/15 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-foreground/70 leading-relaxed">
                      <p className="font-semibold text-foreground mb-1">What happens next?</p>
                      <p>We'll track all {selectedChapter.stats?.totalLines || 0} NCERT lines and create a 7-level spaced repetition schedule.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading || !selectedChapter}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Tracking...' : 'Track Chapter'}
              </motion.button>
            </form>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default TrackTopic;
