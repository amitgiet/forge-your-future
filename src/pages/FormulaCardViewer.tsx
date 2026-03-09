import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, Bookmark, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Loader2, Menu } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import apiService from '@/lib/apiService';

interface Card {
  _id: string;
  title: string;
  imgUrl: string;
}

interface CardProgress {
  status: 'unseen' | 'learning' | 'memorized' | 'need_revision';
  isBookmarked: boolean;
}

const SWIPE_THRESHOLD = 60;

const FormulaCardViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectTitle, chapterTitle, topicTitle: stateTopicTitle, cards: stateCards = [], startIndex = 0 } = (location.state || {}) as {
    subjectTitle?: string;
    chapterTitle?: string;
    topicTitle?: string;
    cards?: Card[];
    startIndex?: number;
  };

  const [cards, setCards] = useState<Card[]>(stateCards);
  const [loading, setLoading] = useState(!stateCards.length);
  const [current, setCurrent] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Progress state mapping: cardId -> { status, isBookmarked }
  const [progressMap, setProgressMap] = useState<Record<string, CardProgress>>({});

  useEffect(() => {
    const fetchData = async () => {
      let activeCards = stateCards;

      // Fallback fetch if missing
      if (!activeCards.length && stateTopicTitle) {
        try {
          const res = await apiService.formulas.getCards(stateTopicTitle);
          if (res.data?.success) {
            activeCards = res.data.data;
            setCards(activeCards);
          }
        } catch (error) {
          console.error('Failed to load cards:', error);
        }
      }

      // Fetch progress
      if (stateTopicTitle) {
        try {
          const progRes = await apiService.formulas.getTopicProgress(stateTopicTitle);
          if (progRes.data?.success) {
            const tempMap: Record<string, CardProgress> = {};
            progRes.data.data.forEach((p: any) => {
              tempMap[p.cardId] = { status: p.status, isBookmarked: p.isBookmarked };
            });
            setProgressMap(tempMap);
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [stateTopicTitle, stateCards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">No cards found for this topic.</p>
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-primary">Go Back</button>
      </div>
    );
  }

  const card = cards[current];
  const progress = progressMap[card._id] || { status: 'unseen', isBookmarked: false };

  const updateProgress = async (updates: Partial<CardProgress>) => {
    // Optimistic UI update
    setProgressMap(prev => ({
      ...prev,
      [card._id]: {
        ...(prev[card._id] || { status: 'unseen', isBookmarked: false }),
        ...updates
      }
    }));

    // Network update
    try {
      await apiService.formulas.updateCardProgress(card._id, {
        ...updates,
        chapterTitle,
        topicTitle: stateTopicTitle
      });
    } catch (error) {
      console.error('Failed to update progress', error);
      // We could revert optimistic update here on fail, but we'll ignore for simplicity
    }
  };

  const toggleBookmark = () => updateProgress({ isBookmarked: !progress.isBookmarked });
  const setStatus = (status: CardProgress['status']) => updateProgress({ status });

  const goTo = (idx: number, dir: number) => {
    if (idx < 0 || idx >= cards.length) return;
    setDirection(dir);
    setCurrent(idx);

    // Mark as learning automatically when viewing
    const nextCard = cards[idx];
    const prevStatus = progressMap[nextCard._id]?.status;
    if (!prevStatus || prevStatus === 'unseen') {
      // Defer API call to not block UI thread
      setTimeout(() => {
        apiService.formulas.updateCardProgress(nextCard._id, {
          status: 'learning',
          chapterTitle,
          topicTitle: stateTopicTitle
        }).then(() => {
          setProgressMap(prev => ({
            ...prev,
            [nextCard._id]: { ...(prev[nextCard._id] || { isBookmarked: false }), status: 'learning' }
          }));
        }).catch(() => { });
      }, 500);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && current < cards.length - 1) {
      goTo(current + 1, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && current > 0) {
      goTo(current - 1, -1);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-[11px] text-muted-foreground truncate">
            {chapterTitle} • {stateTopicTitle}
          </p>
          <h1 className="text-sm font-bold text-foreground truncate">{card.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {current + 1}/{cards.length}
          </span>
          <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
              <CardPalette
                cards={cards}
                progressMap={progressMap}
                current={current}
                onSelect={(idx) => { goTo(idx, idx > current ? 1 : -1); setPaletteOpen(false); }}
              />
            </SheetContent>
          </Sheet>
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted ml-0.5">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-2 py-4">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={card._id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md mx-auto cursor-grab active:cursor-grabbing"
          >
            <div className={`rounded-2xl overflow-hidden bg-card border shadow-lg transition-colors ${progress.status === 'memorized' ? 'border-green-500/50 shadow-green-500/10' :
              progress.status === 'need_revision' ? 'border-red-500/50 shadow-red-500/10' :
                'border-border'
              }`}>
              <img
                src={card.imgUrl}
                alt={card.title}
                className="w-full object-contain max-h-[70vh] bg-white"
                draggable={false}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows (desktop) */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1, -1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/80 hover:bg-muted hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {current < cards.length - 1 && (
          <button
            onClick={() => goTo(current + 1, 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/80 hover:bg-muted hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-center gap-8">
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full transition-colors ${progress.isBookmarked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
        >
          <Bookmark className="w-5 h-5" fill={progress.isBookmarked ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={() => setStatus('memorized')}
          className={`p-3 rounded-full transition-colors flex items-center gap-1.5 ${progress.status === 'memorized'
            ? 'bg-green-500/30 text-green-700 shadow-sm'
            : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
            }`}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>

        <button
          onClick={() => setStatus('need_revision')}
          className={`p-3 rounded-full transition-colors flex items-center gap-1.5 ${progress.status === 'need_revision'
            ? 'bg-red-500/30 text-red-700 shadow-sm'
            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            }`}
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-4">
        {cards.length <= 15 ? cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-5' : 'bg-muted-foreground/30'
              }`}
          />
        )) : (
          <div className="text-[10px] text-muted-foreground font-medium">
            Swipe left/right to browse {cards.length} cards
          </div>
        )}
      </div>
    </div>
  );
};

const STATE_COLORS: Record<string, string> = {
  'unseen': 'bg-muted text-muted-foreground border-border',
  'learning': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'memorized': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  'need_revision': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
};

const STATE_LABELS: Record<string, string> = {
  'unseen': 'Not Seen',
  'learning': 'Learning',
  'memorized': 'Memorized',
  'need_revision': 'Need Revision',
};

interface PaletteProps {
  cards: Card[];
  progressMap: Record<string, CardProgress>;
  current: number;
  onSelect: (index: number) => void;
}

const CardPalette: React.FC<PaletteProps> = ({ cards, progressMap, current, onSelect }) => {
  // calculate stats
  const stats = { unseen: 0, learning: 0, memorized: 0, need_revision: 0, bookmarked: 0 };
  cards.forEach(c => {
    const p = progressMap[c._id] || { status: 'unseen', isBookmarked: false };
    stats[p.status]++;
    if (p.isBookmarked) stats.bookmarked++;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <SheetHeader className="p-4 pb-2 border-b border-border text-left">
        <SheetTitle className="text-base">Cards Palette</SheetTitle>
      </SheetHeader>

      {/* Legend */}
      <div className="px-4 py-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {(Object.keys(STATE_COLORS)).map((state) => (
            <div key={state} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm border ${STATE_COLORS[state]}`} />
              <span className="text-muted-foreground truncate">{STATE_LABELS[state]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs flex-wrap">
        <span className="font-medium text-green-600">✓ {stats.memorized}</span>
        <span className="font-medium text-red-500">✗ {stats.need_revision}</span>
        <span className="font-medium text-blue-600">○ {stats.learning}</span>
        <span className="font-medium text-muted-foreground">− {stats.unseen}</span>
        <span className="font-medium text-amber-500 ml-2">★ {stats.bookmarked}</span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {cards.map((c, i) => {
            const p = progressMap[c._id] || { status: 'unseen', isBookmarked: false };
            const isCurrent = i === current;
            return (
              <button
                key={c._id}
                onClick={() => onSelect(i)}
                className={`
                  relative w-full aspect-square rounded-lg border-2 flex items-center justify-center
                  text-xs font-bold transition-all
                  ${STATE_COLORS[p.status]}
                  ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-105' : 'hover:scale-95'}
                `}
              >
                {i + 1}
                {p.isBookmarked && (
                  <Bookmark className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-background stroke-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormulaCardViewer;
