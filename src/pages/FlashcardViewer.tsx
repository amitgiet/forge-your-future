import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Bookmark,
  Globe,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Flame,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { WebFlipCard3D, type FlashcardItem } from '@/components/flashcards/WebFlipCard3D';
import { DiagramLightboxModal } from '@/components/flashcards/DiagramLightboxModal';
import { useDeckResume } from '@/hooks/useDeckResume';
import apiService from '@/lib/apiService';

export default function FlashcardViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const chapterTitle =
    searchParams.get('chapterTitle') ||
    location.state?.chapterTitle ||
    'General Revision';
  const mode = searchParams.get('mode') || (location.state?.mode as string) || 'chapter';
  const subjectTitle = location.state?.subjectTitle || 'Revision';

  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState<boolean>(true);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; overlayUrl?: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Session review stats
  const [sessionStats, setSessionStats] = useState<{ again: number; hard: number; mastered: number }>({
    again: 0,
    hard: 0,
    mastered: 0,
  });

  const cardStartTimeRef = useRef<number>(Date.now());

  const { resumeIndex, recordReview, isLoaded: resumeLoaded } = useDeckResume({
    deckType: 'flashcard',
    chapterTitle,
  });

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'due') {
        const res = await apiService.flashcards.getDueDeck({
          chapterTitle: chapterTitle !== 'General Revision' ? chapterTitle : undefined,
          limit: 30,
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCards(res.data.data);
        }
      } else {
        const res = await apiService.flashcards.getChapterDeck(chapterTitle, {
          limit: 60,
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setCards(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load flashcard deck:', err);
      toast.error('Failed to load flashcard deck. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [chapterTitle, mode]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Jump to saved resume pointer when ready
  const initialResumeApplied = useRef<boolean>(false);
  useEffect(() => {
    if (!initialResumeApplied.current && resumeLoaded && resumeIndex > 0 && cards.length > 0) {
      initialResumeApplied.current = true;
      const targetIdx = Math.min(resumeIndex, cards.length - 1);
      setCurrentIndex(targetIdx);
    }
  }, [resumeLoaded, cards, resumeIndex]);

  useEffect(() => {
    cardStartTimeRef.current = Date.now();
    setIsFlipped(false);
  }, [currentIndex]);

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback((quality: 1 | 3 | 5) => {
    if (!currentCard) return;

    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - cardStartTimeRef.current) / 1000)
    );

    // Update session metrics
    setSessionStats((prev) => ({
      ...prev,
      again: quality === 1 ? prev.again + 1 : prev.again,
      hard: quality === 3 ? prev.hard + 1 : prev.hard,
      mastered: quality === 5 ? prev.mastered + 1 : prev.mastered,
    }));

    recordReview(
      {
        cardId: currentCard._id || currentCard.cardId || '',
        quality,
        timeSpentSeconds: elapsedSeconds,
        isBookmarked: currentCard.progress?.isBookmarked || false,
        topicTitle: currentCard.topicTitle,
      },
      currentIndex + 1
    );

    setIsFlipped(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentCard, currentIndex, cards.length, recordReview]);

  const toggleBookmark = useCallback(() => {
    if (!currentCard) return;
    const nextBookmarked = !currentCard.progress?.isBookmarked;

    setCards((prev) =>
      prev.map((c, i) =>
        i === currentIndex
          ? { ...c, progress: { ...(c.progress || {}), isBookmarked: nextBookmarked } }
          : c
      )
    );

    if (nextBookmarked) {
      toast.success('Card added to bookmarks');
    } else {
      toast.info('Card removed from bookmarks');
    }

    apiService.flashcards
      .updateCardProgress(currentCard._id || currentCard.cardId || '', {
        isBookmarked: nextBookmarked,
        chapterTitle,
        topicTitle: currentCard.topicTitle,
      })
      .catch((err) => {
        console.warn('Failed saving bookmark state:', err);
      });
  }, [currentCard, currentIndex, chapterTitle]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRate(1);
      } else if (e.key === '2') {
        e.preventDefault();
        handleRate(3);
      } else if (e.key === '3') {
        e.preventDefault();
        handleRate(5);
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex + 1 < cards.length) {
          e.preventDefault();
          setCurrentIndex((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, currentIndex, cards.length]);

  const handleRestartDeck = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsFlipped(false);
    setSessionStats({ again: 0, hard: 0, mastered: 0 });
  };

  const handleBackToHub = () => {
    navigate('/app/formula-cards?tab=flashcards');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500/30">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : handleBackToHub())}
              className="p-2 rounded-xl bg-muted/70 hover:bg-muted text-foreground transition-colors shrink-0"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-foreground truncate">
                {chapterTitle}
              </h1>
              {cards.length > 0 && !isCompleted && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>
                    Card {currentIndex + 1} of {cards.length}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-500 font-medium">
                    {Math.round(((currentIndex + 1) / cards.length) * 100)}% Complete
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage((l) => (l === 'en' ? 'hi' : 'en'))}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Toggle English / Hindi prompt & explanation"
            >
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{language === 'en' ? 'EN' : 'HI'}</span>
            </button>

            {/* Bookmark button */}
            {currentCard && !isCompleted && (
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-xl border transition-all ${
                  currentCard.progress?.isBookmarked
                    ? 'border-amber-400 bg-amber-500/15 text-amber-500 shadow-sm'
                    : 'border-border bg-muted/60 hover:bg-muted text-muted-foreground'
                }`}
                title={currentCard.progress?.isBookmarked ? 'Remove bookmark' : 'Bookmark card'}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={currentCard.progress?.isBookmarked ? 'currentColor' : 'none'}
                />
              </button>
            )}
          </div>
        </div>

        {/* ── Progress Bar ── */}
        {cards.length > 0 && !isCompleted && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* ── Main Stage ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl w-full mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Loading active recall cards...
            </h3>
            <p className="text-xs text-muted-foreground">
              Retrieving NCERT questions, unlabeled diagrams & solution models
            </p>
          </div>
        ) : isCompleted ? (
          /* ── Deck Completed Celebration State ── */
          <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-extrabold text-foreground mb-1">
              Deck Completed!
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              You reviewed {cards.length} cards from <span className="font-medium text-foreground">{chapterTitle}</span>.
            </p>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {sessionStats.mastered}
                </span>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Got It</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {sessionStats.hard}
                </span>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Hard</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {sessionStats.again}
                </span>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Again</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleRestartDeck}
                className="flex-1 py-3 px-4 rounded-xl border border-border bg-muted/60 hover:bg-muted font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Again</span>
              </button>

              <button
                onClick={handleBackToHub}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/25"
              >
                <span>Back to Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : !currentCard ? (
          /* ── Empty State ── */
          <div className="text-center py-16 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">No Cards in this Deck</h3>
            <p className="text-xs text-muted-foreground mb-6">
              There are currently no active recall cards scheduled for this chapter.
            </p>
            <button
              onClick={handleBackToHub}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to Revision Hub
            </button>
          </div>
        ) : (
          /* ── Active Card Stage ── */
          <div className="w-full flex flex-col items-center">
            <WebFlipCard3D
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              language={language}
              onExpandDiagram={(url, overlayUrl) =>
                setLightboxImage({ url, overlayUrl })
              }
            />

            {/* Desktop Navigation Helper Pills */}
            <div className="mt-4 hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Card (←)</span>
              </button>
              <span>•</span>
              <button
                disabled={currentIndex >= cards.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(cards.length - 1, i + 1))}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <span>Next Card (→)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Ergonomic 3-Tier SM-2 Rating Bar ── */}
      {currentCard && !loading && !isCompleted && (
        <footer className="sticky bottom-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-4 shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            {/* Button 1: Again (Quality 1) */}
            <button
              onClick={() => handleRate(1)}
              className="flex-1 py-3 px-3 sm:px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-600 dark:text-rose-300 border border-rose-500/30 flex flex-col items-center justify-center transition-all group"
              title="Lapse penalty - review within 24h (Hotkey: 1)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span>🔴</span>
                <span>Again</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-rose-500/20 text-[10px] font-mono border border-rose-500/30">
                  1
                </kbd>
              </div>
              <span className="text-[11px] text-rose-500/80 font-medium mt-0.5">
                &lt; 24h Review
              </span>
            </button>

            {/* Button 2: Hard (Quality 3) */}
            <button
              onClick={() => handleRate(3)}
              className="flex-1 py-3 px-3 sm:px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center transition-all group"
              title="Slight ease penalty - review in 3 days (Hotkey: 2)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span>🟡</span>
                <span>Hard</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] font-mono border border-amber-500/30">
                  2
                </kbd>
              </div>
              <span className="text-[11px] text-amber-500/80 font-medium mt-0.5">
                3 Days Review
              </span>
            </button>

            {/* Button 3: Got It (Quality 5) */}
            <button
              onClick={() => handleRate(5)}
              className="flex-1 py-3 px-3 sm:px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex flex-col items-center justify-center transition-all group shadow-sm"
              title="Mastered - ease boost & spaced interval (Hotkey: 3)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span>🟢</span>
                <span>Got It</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-emerald-500/25 text-[10px] font-mono border border-emerald-500/40">
                  3
                </kbd>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Mastered
              </span>
            </button>
          </div>
        </footer>
      )}

      {/* ── Interactive Lightbox Modal ── */}
      {lightboxImage && (
        <DiagramLightboxModal
          visible={true}
          imageUrl={lightboxImage.url}
          overlayUrl={lightboxImage.overlayUrl}
          title={currentCard?.topicTitle || chapterTitle}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
