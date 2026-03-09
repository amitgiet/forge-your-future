import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FlaskConical, Atom, Zap, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import apiService from '@/lib/apiService';

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Zap className="w-5 h-5" />,
  chemistry: <FlaskConical className="w-5 h-5" />,
  biology: <Atom className="w-5 h-5" />,
};

const FormulaCards: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await apiService.formulas.getSubjects();
        if (res.data?.success) {
          setSubjects(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load formula subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const openChapter = (subjectTitle: string, chapter: any) => {
    navigate(`/formula-cards/${encodeURIComponent(chapter.title)}`, {
      state: { subjectTitle, chapterTitle: chapter.title, chapterColor: chapter.color },
    });
  };

  const calculateCardsCount = (subject: any) => {
    return subject.chapters.reduce((acc: number, curr: any) => acc + (curr.cardsCount || 0), 0);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">📋 Formula Cards</h1>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" />
            <p className="text-sm">Loading concepts...</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <motion.div
              key={subject._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Subject header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-muted text-foreground">
                    {/* fallback to icon or atom */}
                    {subjectIcons[subject.title?.toLowerCase()] || <Atom className="w-5 h-5" />}
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">{subject.title}</h2>
                    <p className="text-xs text-muted-foreground">{calculateCardsCount(subject)} Formula Cards</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <p className="text-xs text-muted-foreground mb-2">Explore chapters</p>

              {/* Horizontal chapter cards */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {subject.chapters.map((chapter: any) => (
                  <motion.button
                    key={chapter._id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openChapter(subject.title, chapter)}
                    className="flex-shrink-0 w-[130px] h-[140px] rounded-2xl p-3 flex flex-col justify-between text-left relative overflow-hidden"
                    style={{ backgroundColor: chapter.color || '#37B24D' }}
                  >
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-3 relative z-10 drop-shadow-md">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-auto relative z-10">
                      <span className="text-[11px] text-white/90 font-medium px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm shadow-sm">
                        📄 {chapter.cardsCount || 0}
                      </span>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10" />

                    {/* BG Image overlay if provided */}
                    {chapter.bgColor && (
                      <div
                        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-overlay"
                        style={{ backgroundImage: `url(${chapter.bgColor})`, filter: 'brightness(2) contrast(1.2)' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FormulaCards;
