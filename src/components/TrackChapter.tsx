import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, X, CheckCircle2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { trackChapter, loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { apiService } from '@/lib/apiService';

interface Chapter {
  _id: string;
  chapterId: string;
  name: { en: string; hi?: string };
  subject: string;
  ncert: { class: number; chapterNumber: number };
  stats?: { totalLines: number };
}

interface TrackChapterProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Biology'];

const TrackChapter: React.FC<TrackChapterProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.neuronz);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [trackedChapter, setTrackedChapter] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) loadChapters();
  }, [isOpen]);

  const loadChapters = async () => {
    try {
      setLoadingChapters(true);
      const response = await apiService.chapters.getChapters();
      setChapters(response.data.data || []);
      setFilteredChapters(response.data.data || []);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    let filtered = chapters;
    if (selectedSubject !== 'All') filtered = filtered.filter((ch) => ch.subject === selectedSubject);
    if (searchQuery) {
      filtered = filtered.filter(
        (ch) =>
          ch.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.name.hi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredChapters(filtered);
  }, [selectedSubject, searchQuery, chapters]);

  const handleTrackChapter = async (chapterId: string) => {
    try {
      setTrackedChapter(chapterId);
      await dispatch(trackChapter(chapterId)).unwrap();
      setSuccessMessage('Chapter tracked successfully!');
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to track chapter:', err);
    } finally {
      setTrackedChapter(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-4 py-3.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">Track Chapter</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(85vh-60px)]">
            {/* Messages */}
            {successMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> {successMessage}
              </motion.div>
            )}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">{error}</div>
            )}

            {/* Subject Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubject === subject
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Chapters */}
            {loadingChapters ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No chapters found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChapters.map((chapter) => (
                  <motion.div
                    key={chapter._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border p-3.5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-medium text-foreground truncate">{chapter.name.en}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          Class {chapter.ncert.class}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                          {chapter.subject}
                        </span>
                        {chapter.stats?.totalLines && (
                          <span className="text-[10px] text-muted-foreground">{chapter.stats.totalLines} lines</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTrackChapter(chapter._id)}
                      disabled={isLoading || trackedChapter === chapter._id}
                      className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {trackedChapter === chapter._id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Tracking</>
                      ) : (
                        'Track'
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrackChapter;
