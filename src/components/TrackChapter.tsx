import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { trackChapter, loadDueLines, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { apiService } from '@/lib/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Chapter {
  _id: string;
  chapterId: string;
  name: {
    en: string;
    hi?: string;
  };
  subject: string;
  ncert: {
    class: number;
    chapterNumber: number;
  };
  stats?: {
    totalLines: number;
  };
}

interface TrackChapterProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrackChapter: React.FC<TrackChapterProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.neuronz);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [trackedChapter, setTrackedChapter] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    if (isOpen) {
      loadChapters();
    }
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

    if (selectedSubject !== 'All') {
      filtered = filtered.filter((ch) => ch.subject === selectedSubject);
    }

    if (searchQuery) {
      filtered = filtered.filter((ch) =>
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
      setSuccessMessage(`Chapter tracked successfully!`);
      
      // Reload due lines and mastery
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Track New Chapter</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedSubject === subject
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="search" className="text-sm font-medium text-muted-foreground">
                Search Chapter
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Chapters List */}
          {loadingChapters ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No chapters found</p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
              {filteredChapters.map((chapter) => (
                <motion.div
                  key={chapter._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border hover:border-primary/50 transition">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{chapter.name.en}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Class {chapter.ncert.class}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {chapter.subject}
                          </Badge>
                          {chapter.stats?.totalLines && (
                            <Badge variant="outline" className="text-xs bg-primary/10">
                              {chapter.stats.totalLines} lines
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleTrackChapter(chapter._id)}
                        disabled={isLoading || trackedChapter === chapter._id}
                        className="ml-4"
                        size="sm"
                      >
                        {trackedChapter === chapter._id && isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Tracking...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Track
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TrackChapter;
