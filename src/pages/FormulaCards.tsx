import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  BookOpen,
  FlaskConical,
  Atom,
  RotateCcw,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import apiService from '@/lib/apiService';
import { getStoredResumeIndex } from '@/hooks/useDeckResume';

type RevisionTab = 'formulas' | 'flashcards';

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Zap className="w-5 h-5 text-blue-500" />,
  chemistry: <FlaskConical className="w-5 h-5 text-amber-500" />,
  biology: <Atom className="w-5 h-5 text-emerald-500" />,
};

const normalizeDriveUrl = (raw?: string): string => {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/drive\.google\.com|googleusercontent\.com/i.test(trimmed)) {
    const fromQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fromPath = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = fromQuery?.[1] || fromPath?.[1];
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
    }
  }
  return trimmed;
};

export default function FormulaCards() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as RevisionTab) || 'formulas';
  const [activeTab, setActiveTab] = useState<RevisionTab>(
    tabParam === 'flashcards' ? 'flashcards' : 'formulas'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [formulaSubjects, setFormulaSubjects] = useState<any[]>([]);
  const [flashcardSubjects, setFlashcardSubjects] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize state with URL param if searchParams change
  useEffect(() => {
    const currentParam = searchParams.get('tab') as RevisionTab;
    if (currentParam && (currentParam === 'formulas' || currentParam === 'flashcards')) {
      setActiveTab(currentParam);
    }
  }, [searchParams]);

  const switchTab = (tab: RevisionTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, fSubRes, fcSubRes] = await Promise.allSettled([
        apiService.revision.getHubSummary(),
        apiService.formulas.getSubjects(),
        apiService.flashcards.getSubjects(),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data?.success) {
        setSummaryData(sumRes.value.data.data);
      }
      if (fSubRes.status === 'fulfilled' && fSubRes.value.data?.success) {
        setFormulaSubjects(fSubRes.value.data.data || []);
      }
      if (fcSubRes.status === 'fulfilled' && fcSubRes.value.data?.success) {
        setFlashcardSubjects(fcSubRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load revision hub data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentSubjects = useMemo(() => {
    const list = activeTab === 'formulas' ? formulaSubjects : flashcardSubjects;
    if (selectedSubject === 'all') return list;
    return list.filter(
      (s) => (s.title || '').toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [activeTab, formulaSubjects, flashcardSubjects, selectedSubject]);

  const openFormulaChapter = (subjectTitle: string, chapter: any) => {
    navigate(`/app/formula-cards/${encodeURIComponent(chapter.title)}`, {
      state: {
        chapter: chapter.title,
        chapterTitle: chapter.title,
        subjectTitle,
        chapterColor: chapter.color,
      },
    });
  };

  const openFlashcardChapter = (subjectTitle: string, chapter: any) => {
    navigate(
      `/app/formula-cards/flashcard-viewer?chapterTitle=${encodeURIComponent(chapter.title)}`,
      {
        state: {
          chapterTitle: chapter.title,
          subjectTitle,
          chapterColor: chapter.color,
        },
      }
    );
  };

  const calculateCardsCount = (subject: any) => {
    return (
      subject.chapters?.reduce(
        (acc: number, curr: any) => acc + (curr.cardsCount || 0),
        0
      ) || 0
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* ── Sticky Header with 2-Tab Segmented Switcher & Subject Filter ── */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-3">
          {/* Top Title Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/app/dashboard'))}
                className="p-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-extrabold text-lg sm:text-xl text-foreground flex items-center gap-2">
                  Formulas & Flashcards
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {activeTab === 'formulas'
                    ? 'Mathematical rapid retrieval & high-speed skimming'
                    : 'Active recall & NCERT diagram deciphering'}
                </p>
              </div>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm shrink-0">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold font-mono">
                {summaryData?.dailyStreak ?? 14} Day Streak
              </span>
            </div>
          </div>

          {/* ── 2-Tab Segmented Switcher ── */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/80 border border-border mb-3">
            <button
              type="button"
              onClick={() => switchTab('formulas')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'formulas'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>🧮 Formulas (Skim)</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('flashcards')}
              className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>🗂️ Flashcards (Recall)</span>
            </button>
          </div>

          {/* ── Subject Filter Pills ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', 'biology', 'chemistry', 'physics'].map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                    isSelected
                      ? activeTab === 'formulas'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {sub === 'all'
                    ? 'All Subjects'
                    : sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-6">
        {/* ── Spaced Repetition Due Today Hero Card ── */}
        {summaryData && summaryData.dailyDueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">⚡</span>
                <h3 className="font-extrabold text-sm sm:text-base text-foreground">
                  Spaced Repetition Due Today
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {summaryData.dailyDueCount} cards
                </span>{' '}
                scheduled by the SM-2 retention engine for memory consolidation.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  activeTab === 'formulas'
                    ? '/app/formula-cards/viewer?mode=due'
                    : '/app/formula-cards/flashcard-viewer?mode=due'
                )
              }
              className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all shrink-0 ${
                activeTab === 'formulas'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/30'
              }`}
            >
              <span>Start Blitz ▶</span>
            </button>
          </motion.div>
        )}

        {/* ── Subjects & Chapters Grid / Carousels ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-9 h-9 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              Loading curriculum decks & mastery stats...
            </p>
          </div>
        ) : currentSubjects.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">No Decks Found</h3>
            <p className="text-xs text-muted-foreground">
              No {activeTab} available for {selectedSubject === 'all' ? 'the selected filter' : selectedSubject}.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {currentSubjects.map((subject) => (
              <div key={subject._id || subject.title} className="space-y-3">
                {/* Subject Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs">
                      {subjectIcons[(subject.title || '').toLowerCase()] || (
                        <Atom className="w-5 h-5 text-foreground" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm sm:text-base text-foreground capitalize">
                        {subject.displayName || subject.title}
                      </h2>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {calculateCardsCount(subject)}{' '}
                        {activeTab === 'formulas' ? 'Formula Cards' : 'Active Flashcards'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Chapters Carousel / Row */}
                <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                  {subject.chapters?.map((chapter: any) => {
                    const localResume = getStoredResumeIndex(
                      activeTab === 'formulas' ? 'formula' : 'flashcard',
                      chapter.title
                    );
                    const resumePointer =
                      chapter.resumeIndex && chapter.resumeIndex > 0
                        ? chapter.resumeIndex
                        : localResume;
                    const hasResume = resumePointer > 0;
                    const hasMastery =
                      chapter.masteryPercentage !== undefined &&
                      chapter.masteryPercentage > 0;

                    const bgImg = normalizeDriveUrl(chapter.bgColor);

                    return (
                      <motion.button
                        key={chapter._id || chapter.title}
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          activeTab === 'formulas'
                            ? openFormulaChapter(subject.title, chapter)
                            : openFlashcardChapter(subject.title, chapter)
                        }
                        className="w-[170px] sm:w-[190px] h-[185px] sm:h-[195px] shrink-0 rounded-2xl p-4 flex flex-col justify-between text-left relative overflow-hidden transition-shadow hover:shadow-lg focus:outline-none"
                        style={{
                          backgroundColor:
                            chapter.color ||
                            (activeTab === 'formulas' ? '#2563eb' : '#059669'),
                        }}
                      >
                        {/* Top: Title & Resume Pill */}
                        <div className="relative z-10">
                          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-3 drop-shadow-sm">
                            {chapter.title}
                          </h3>

                          {hasResume && (
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] tracking-wide shadow-sm">
                              Resume: #{resumePointer} ▶
                            </div>
                          )}
                        </div>

                        {/* Bottom: Mastery Progress & Card Count */}
                        <div className="relative z-10 space-y-2">
                          {hasMastery && (
                            <div>
                              <div className="w-full h-1.5 bg-black/25 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, chapter.masteryPercentage)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-white/90 font-medium">
                                {chapter.masteryPercentage}% Mastered
                              </span>
                            </div>
                          )}

                          <div className="inline-flex items-center gap-1 text-[11px] text-white/95 font-medium px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-sm shadow-sm">
                            <span>{activeTab === 'formulas' ? '🧮' : '🗂️'}</span>
                            <span>{chapter.cardsCount || 0} cards</span>
                          </div>
                        </div>

                        {/* Background Decorative Shapes */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                        {bgImg && (
                          <div
                            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-overlay"
                            style={{
                              backgroundImage: `url(${bgImg})`,
                              filter: 'brightness(2) contrast(1.2)',
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
