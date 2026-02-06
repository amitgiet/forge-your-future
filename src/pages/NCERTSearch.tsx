import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Search, BookOpen, Clock, StickyNote, Bell, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { apiService } from '@/lib/apiService';

// Types
interface Chapter {
  _id: string;
  chapterId: string;
  name: string;
  ncert: {
    class: number;
    subject: string;
    chapterNumber: number;
  };
}

interface NCERTLine {
  _id: string;
  lineId: string;
  ncertText: string;
  pageNumber: number;
  lineNumber: number;
  userProgress?: {
    level: number;
    isMastered: boolean;
    nextRevision: string;
  } | null;
}

const NCERTSearch = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('biology');
  const [selectedClass, setSelectedClass] = useState<number>(11);

  // Data state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lines, setLines] = useState<NCERTLine[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial load of chapters
  useEffect(() => {
    fetchChapters();
  }, [selectedSubject, selectedClass]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      // In a real app we might filter by query too
      const response = await apiService.chapters.getChapters(selectedSubject);
      // Client-side filter for class if API doesn't support it strictly or for safety
      const filtered = response.data.data.filter((c: any) => c.ncert.class === selectedClass);
      setChapters(filtered);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    try {
      setLoading(true);
      // Using our new API
      const response = await apiService.neuronz.getLinesByChapter(chapter.chapterId);
      setLines(response.data.data);
    } catch (error) {
      console.error('Failed to load lines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedChapter) {
      setSelectedChapter(null);
      setLines([]);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLineClick = (line: NCERTLine) => {
    // Start session for this line
    // Pass the line object or ID via state/params
    navigate('/quiz', { state: { lineId: line.lineId, mode: 'new' } });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="bg-primary/30 text-primary font-medium px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter lines if search query exists
  const filteredLines = query
    ? lines.filter(l => l.ncertText.toLowerCase().includes(query.toLowerCase()))
    : lines;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {selectedChapter ? `Ch ${selectedChapter.ncert.chapterNumber}: ${selectedChapter.name}` : t('ncert.title')}
            </h1>
            {selectedChapter && <p className="text-xs text-muted-foreground">{lines.length} lines available</p>}
          </div>
        </div>

        {!selectedChapter && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {['biology', 'physics', 'chemistry'].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${selectedSubject === sub
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedChapter ? "Search in this chapter..." : "Search chapters..."}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </motion.div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading && <div className="text-center py-10 text-muted-foreground">Loading...</div>}

          {/* Chapter List */}
          {!selectedChapter && !loading && (
            <div className="space-y-3">
              {chapters
                .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
                .map((chapter, index) => (
                  <motion.button
                    key={chapter._id}
                    onClick={() => handleChapterSelect(chapter)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full nf-card text-left flex items-center justify-between group hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <p className="text-xs text-primary font-semibold mb-1">Chapter {chapter.ncert.chapterNumber}</p>
                      <h3 className="font-semibold text-foreground">{chapter.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>
                ))}
            </div>
          )}

          {/* Lines List */}
          {selectedChapter && !loading && (
            <div className="space-y-4">
              {filteredLines.map((line, index) => (
                <motion.div
                  key={line._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="nf-card cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleLineClick(line)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                        pg.{line.pageNumber}
                      </span>
                      {line.userProgress ? (
                        <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${line.userProgress.isMastered
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                          }`}>
                          {line.userProgress.isMastered ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {line.userProgress.isMastered ? 'Mastered' : `L${line.userProgress.level}`}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded font-medium bg-muted text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" /> New
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed pl-2 border-l-2 border-muted/50">
                    {highlightText(line.ncertText, query)}
                  </p>
                </motion.div>
              ))}

              {filteredLines.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No lines found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default NCERTSearch;