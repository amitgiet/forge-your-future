import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, Bookmark, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  _id: string;
  title: string;
  imgUrl: string;
}

const SWIPE_THRESHOLD = 60;

const FormulaCardViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectTitle, chapterTitle, topicTitle, cards = [], startIndex = 0 } = (location.state || {}) as {
    subjectTitle?: string;
    chapterTitle?: string;
    topicTitle?: string;
    cards?: Card[];
    startIndex?: number;
  };

  const [current, setCurrent] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  if (!cards.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No cards available</p>
      </div>
    );
  }

  const card = cards[current];

  const goTo = (idx: number, dir: number) => {
    if (idx < 0 || idx >= cards.length) return;
    setDirection(dir);
    setCurrent(idx);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && current < cards.length - 1) {
      goTo(current + 1, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && current > 0) {
      goTo(current - 1, -1);
    }
  };

  const toggleBookmark = () => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(card._id) ? next.delete(card._id) : next.add(card._id);
      return next;
    });
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
            {chapterTitle} • {topicTitle}
          </p>
          <h1 className="text-sm font-bold text-foreground truncate">{card.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {current + 1}/{cards.length}
          </span>
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted">
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
            <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-lg">
              <img
                src={card.imgUrl}
                alt={card.title}
                className="w-full object-contain max-h-[70vh]"
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
          className={`p-3 rounded-full transition-colors ${
            bookmarked.has(card._id) ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-5 h-5" fill={bookmarked.has(card._id) ? 'currentColor' : 'none'} />
        </button>
        <button className="p-3 rounded-full bg-green-500/15 text-green-600 hover:bg-green-500/25 transition-colors">
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors">
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-4">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-primary w-5' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FormulaCardViewer;
