import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, Menu, X, Flag, Star, StickyNote,
  AlertTriangle, Eraser, CheckCircle2, Send, Eye, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/* ─────────── types ─────────── */
export interface NTAQuestion {
  _id?: string;
  id?: string;
  question: string;
  options: Record<string, string> | string[];
  correctAnswer?: string | number | null;
  explanation?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  imageUrl?: string;
}

export interface NTASection {
  name: string;
  emoji?: string;
  startIndex: number;
  endIndex: number; // inclusive
}

export type QuestionState =
  | 'not-visited'
  | 'not-answered'
  | 'answered'
  | 'marked-review'
  | 'answered-marked';

export interface QuestionMeta {
  state: QuestionState;
  selectedOption: number | null;
  bookmarked: boolean;
  note: string;
  timeSpent: number; // seconds
}

export interface NTATestPlayerProps {
  questions: NTAQuestion[];
  sections?: NTASection[];
  title?: string;
  duration: number; // seconds
  onSubmit: (data: NTASubmitData) => void;
  onAnswerChange?: (questionIndex: number, answer: number | null, meta: QuestionMeta) => void;
  initialMeta?: QuestionMeta[];
  readOnly?: boolean;
}

export interface NTASubmitData {
  answers: (number | null)[];
  meta: QuestionMeta[];
  timeTaken: number;
}

/* ─────────── helpers ─────────── */
const DEFAULT_SECTIONS: NTASection[] = [
  { name: 'Physics', emoji: '⚛️', startIndex: 0, endIndex: 44 },
  { name: 'Chemistry', emoji: '🧪', startIndex: 45, endIndex: 89 },
  { name: 'Botany', emoji: '🌿', startIndex: 90, endIndex: 134 },
  { name: 'Zoology', emoji: '🐾', startIndex: 135, endIndex: 179 },
];

function getOptionArray(q: NTAQuestion): string[] {
  if (Array.isArray(q.options)) return q.options;
  return ['A', 'B', 'C', 'D'].map((k) => (q.options as Record<string, string>)[k] ?? '');
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const STATE_COLORS: Record<QuestionState, string> = {
  'not-visited': 'bg-muted text-muted-foreground border-border',
  'not-answered': 'bg-destructive/20 text-destructive border-destructive/30',
  'answered': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  'marked-review': 'bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30',
  'answered-marked': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
};

const STATE_LABELS: Record<QuestionState, string> = {
  'not-visited': 'Not Visited',
  'not-answered': 'Not Answered',
  'answered': 'Answered',
  'marked-review': 'Marked for Review',
  'answered-marked': 'Answered & Marked',
};

/* ─────────── component ─────────── */
const NTATestPlayer: React.FC<NTATestPlayerProps> = ({
  questions,
  sections: sectionsProp,
  title = 'Mock Test',
  duration,
  onSubmit,
  onAnswerChange,
  initialMeta,
  readOnly = false,
}) => {
  const totalQ = questions.length;

  // Build sections
  const sections = useMemo(() => {
    if (sectionsProp && sectionsProp.length > 0) return sectionsProp;
    if (totalQ <= 50) return [{ name: 'All', emoji: '📝', startIndex: 0, endIndex: totalQ - 1 }];
    return DEFAULT_SECTIONS.map((s) => ({
      ...s,
      endIndex: Math.min(s.endIndex, totalQ - 1),
    })).filter((s) => s.startIndex < totalQ);
  }, [sectionsProp, totalQ]);

  // State
  const [currentQ, setCurrentQ] = useState(0);
  const [meta, setMeta] = useState<QuestionMeta[]>(() =>
    initialMeta ??
    Array.from({ length: totalQ }, () => ({
      state: 'not-visited' as QuestionState,
      selectedOption: null,
      bookmarked: false,
      note: '',
      timeSpent: 0,
    }))
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-question timer
  const questionEntryTime = useRef(Date.now());

  // Mark current as visited on mount/change
  useEffect(() => {
    questionEntryTime.current = Date.now();
    setMeta((prev) => {
      const next = [...prev];
      if (next[currentQ].state === 'not-visited') {
        next[currentQ] = { ...next[currentQ], state: 'not-answered' };
      }
      return next;
    });
  }, [currentQ]);

  // Record time spent when leaving a question
  const recordTimeSpent = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionEntryTime.current) / 1000);
    setMeta((prev) => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], timeSpent: next[currentQ].timeSpent + elapsed };
      return next;
    });
  }, [currentQ]);

  // Countdown timer
  useEffect(() => {
    if (readOnly) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [readOnly]);

  // Current section
  const currentSection = useMemo(
    () => sections.find((s) => currentQ >= s.startIndex && currentQ <= s.endIndex) ?? sections[0],
    [currentQ, sections]
  );

  // Stats
  const stats = useMemo(() => {
    const s = { answered: 0, notAnswered: 0, markedReview: 0, notVisited: 0, answeredMarked: 0 };
    meta.forEach((m) => {
      if (m.state === 'answered') s.answered++;
      else if (m.state === 'not-answered') s.notAnswered++;
      else if (m.state === 'marked-review') s.markedReview++;
      else if (m.state === 'not-visited') s.notVisited++;
      else if (m.state === 'answered-marked') s.answeredMarked++;
    });
    return s;
  }, [meta]);

  // Section stats
  const sectionStats = useCallback(
    (sec: NTASection) => {
      let attempted = 0;
      let total = 0;
      for (let i = sec.startIndex; i <= Math.min(sec.endIndex, totalQ - 1); i++) {
        total++;
        if (meta[i].state === 'answered' || meta[i].state === 'answered-marked') attempted++;
      }
      return { attempted, total };
    },
    [meta, totalQ]
  );

  /* ─── actions ─── */
  const selectOption = (optIndex: number) => {
    if (readOnly) return;
    setMeta((prev) => {
      const next = [...prev];
      const cur = next[currentQ];
      const wasMarked = cur.state === 'marked-review' || cur.state === 'answered-marked';
      next[currentQ] = {
        ...cur,
        selectedOption: optIndex,
        state: wasMarked ? 'answered-marked' : 'answered',
      };
      return next;
    });
    onAnswerChange?.(currentQ, optIndex, meta[currentQ]);
  };

  const clearAnswer = () => {
    if (readOnly) return;
    setMeta((prev) => {
      const next = [...prev];
      const cur = next[currentQ];
      const wasMarked = cur.state === 'marked-review' || cur.state === 'answered-marked';
      next[currentQ] = {
        ...cur,
        selectedOption: null,
        state: wasMarked ? 'marked-review' : 'not-answered',
      };
      return next;
    });
    onAnswerChange?.(currentQ, null, meta[currentQ]);
  };

  const toggleMarkReview = () => {
    if (readOnly) return;
    setMeta((prev) => {
      const next = [...prev];
      const cur = next[currentQ];
      const hasAnswer = cur.selectedOption !== null;
      const isMarked = cur.state === 'marked-review' || cur.state === 'answered-marked';
      if (isMarked) {
        next[currentQ] = { ...cur, state: hasAnswer ? 'answered' : 'not-answered' };
      } else {
        next[currentQ] = { ...cur, state: hasAnswer ? 'answered-marked' : 'marked-review' };
      }
      return next;
    });
  };

  const toggleBookmark = () => {
    setMeta((prev) => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], bookmarked: !next[currentQ].bookmarked };
      return next;
    });
  };

  const updateNote = (text: string) => {
    setMeta((prev) => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], note: text };
      return next;
    });
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= totalQ) return;
    recordTimeSpent();
    setCurrentQ(index);
    setPaletteOpen(false);
  };

  const saveAndNext = () => {
    recordTimeSpent();
    if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1);
  };

  const markAndNext = () => {
    if (!readOnly) {
      setMeta((prev) => {
        const next = [...prev];
        const cur = next[currentQ];
        const hasAnswer = cur.selectedOption !== null;
        next[currentQ] = { ...cur, state: hasAnswer ? 'answered-marked' : 'marked-review' };
        return next;
      });
    }
    recordTimeSpent();
    if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    recordTimeSpent();
    const answers = meta.map((m) => m.selectedOption);
    await onSubmit({ answers, meta, timeTaken: duration - timeLeft });
  };

  const q = questions[currentQ];
  const opts = getOptionArray(q);
  const curMeta = meta[currentQ];
  const isMarked = curMeta.state === 'marked-review' || curMeta.state === 'answered-marked';
  const optionLabels = ['A', 'B', 'C', 'D'];

  // Timer color
  const timerUrgent = timeLeft < 300;
  const timerWarning = timeLeft < 900 && !timerUrgent;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ═══ TOP BAR ═══ */}
      <div className="flex-shrink-0 bg-card border-b border-border px-3 py-2 safe-area-top">
        {/* Row 1: Title & Timer */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-sm font-bold text-foreground truncate flex-1 mr-2">{title}</h1>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
              timerUrgent
                ? 'bg-destructive/15 text-destructive animate-pulse'
                : timerWarning
                ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Row 2: Section, Q number, palette trigger */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {currentSection.emoji} {currentSection.name}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Q {currentQ + 1}/{totalQ}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Palette Trigger */}
            <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
                <QuestionPalette
                  sections={sections}
                  meta={meta}
                  currentQ={currentQ}
                  totalQ={totalQ}
                  stats={stats}
                  sectionStats={sectionStats}
                  onSelect={goTo}
                  onClose={() => setPaletteOpen(false)}
                />
              </SheetContent>
            </Sheet>

            {/* Submit */}
            {!readOnly && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs font-bold px-3"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ QUESTION AREA ═══ */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {/* Question header row */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Question {currentQ + 1}
              </span>
              <div className="flex items-center gap-1">
                {/* Bookmark */}
                <button
                  onClick={toggleBookmark}
                  className={`p-1.5 rounded-lg transition-colors ${
                    curMeta.bookmarked
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Star className="w-4 h-4" fill={curMeta.bookmarked ? 'currentColor' : 'none'} />
                </button>
                {/* Note */}
                <button
                  onClick={() => setNoteOpen(!noteOpen)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    curMeta.note
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                </button>
                {/* Mark for review indicator */}
                {isMarked && (
                  <span className="p-1.5 rounded-lg text-violet-500 bg-violet-500/10">
                    <Flag className="w-4 h-4" fill="currentColor" />
                  </span>
                )}
              </div>
            </div>

            {/* Note editor */}
            <AnimatePresence>
              {noteOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <Textarea
                    placeholder="Add a personal note for this question..."
                    value={curMeta.note}
                    onChange={(e) => updateNote(e.target.value)}
                    className="text-sm min-h-[60px] bg-muted/50"
                    readOnly={readOnly}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question text */}
            <div className="text-sm leading-relaxed text-foreground mb-4 select-text">
              <p className="whitespace-pre-wrap">{q.question}</p>
            </div>

            {/* Image */}
            {q.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-border">
                <img
                  src={q.imageUrl}
                  alt={`Question ${currentQ + 1}`}
                  className="w-full object-contain max-h-60"
                  loading="lazy"
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-2.5">
              {opts.map((opt, i) => {
                const isSelected = curMeta.selectedOption === i;
                let optClass =
                  'flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none';

                if (readOnly) {
                  // Show correct/incorrect
                  const correctIdx =
                    typeof q.correctAnswer === 'string'
                      ? q.correctAnswer.charCodeAt(0) - 65
                      : typeof q.correctAnswer === 'number'
                      ? q.correctAnswer
                      : null;
                  if (correctIdx === i) {
                    optClass += ' border-emerald-500 bg-emerald-500/10';
                  } else if (isSelected && correctIdx !== i) {
                    optClass += ' border-destructive bg-destructive/10';
                  } else {
                    optClass += ' border-border bg-card';
                  }
                } else if (isSelected) {
                  optClass += ' border-primary bg-primary/10 shadow-sm';
                } else {
                  optClass += ' border-border bg-card hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]';
                }

                return (
                  <motion.button
                    key={i}
                    className={optClass}
                    onClick={() => selectOption(i)}
                    disabled={readOnly}
                    whileTap={readOnly ? {} : { scale: 0.98 }}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {optionLabels[i]}
                    </span>
                    <span className="text-sm text-left leading-relaxed pt-0.5">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation in review mode */}
            {readOnly && q.explanation && (
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Explanation
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM CONTROLS ═══ */}
      <div className="flex-shrink-0 border-t border-border bg-card px-2 py-2 safe-area-bottom">
        {/* Row 1: Action buttons */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 flex-1"
            onClick={clearAnswer}
            disabled={readOnly || curMeta.selectedOption === null}
          >
            <Eraser className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
          <Button
            variant={isMarked ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 flex-1 ${isMarked ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
            onClick={toggleMarkReview}
            disabled={readOnly}
          >
            <Flag className="w-3.5 h-3.5 mr-1" />
            {isMarked ? 'Unmark' : 'Mark Review'}
          </Button>
          <Button
            variant={curMeta.bookmarked ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 ${curMeta.bookmarked ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
            onClick={toggleBookmark}
          >
            <Star className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Row 2: Navigation */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-shrink-0"
            onClick={() => goTo(currentQ - 1)}
            disabled={currentQ === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {!readOnly ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="h-10 flex-1 text-xs font-bold"
                onClick={saveAndNext}
              >
                Save & Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="sm"
                className="h-10 flex-1 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white"
                onClick={markAndNext}
              >
                Mark & Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="h-10 flex-1 text-xs font-bold"
              onClick={() => goTo(currentQ + 1)}
              disabled={currentQ >= totalQ - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* ═══ SUBMIT DIALOG ═══ */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Submit Test?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to submit? You cannot change answers after submission.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Answered: {stats.answered + stats.answeredMarked}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-2">
                    <X className="w-4 h-4 text-destructive" />
                    <span className="font-medium">Unanswered: {stats.notAnswered}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-violet-500/10 rounded-lg px-3 py-2">
                    <Flag className="w-4 h-4 text-violet-600" />
                    <span className="font-medium">Review: {stats.markedReview + stats.answeredMarked}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Not Visited: {stats.notVisited}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ─────────── QUESTION PALETTE ─────────── */
interface PaletteProps {
  sections: NTASection[];
  meta: QuestionMeta[];
  currentQ: number;
  totalQ: number;
  stats: { answered: number; notAnswered: number; markedReview: number; notVisited: number; answeredMarked: number };
  sectionStats: (sec: NTASection) => { attempted: number; total: number };
  onSelect: (index: number) => void;
  onClose: () => void;
}

const QuestionPalette: React.FC<PaletteProps> = ({
  sections,
  meta,
  currentQ,
  totalQ,
  stats,
  sectionStats,
  onSelect,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="p-4 pb-2 border-b border-border">
        <SheetTitle className="text-base">Question Palette</SheetTitle>
      </SheetHeader>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-border">
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          {(Object.keys(STATE_COLORS) as QuestionState[]).map((state) => (
            <div key={state} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm border ${STATE_COLORS[state]}`} />
              <span className="text-muted-foreground truncate">{STATE_LABELS[state]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs flex-wrap">
        <span className="font-medium text-emerald-600">✓ {stats.answered + stats.answeredMarked}</span>
        <span className="font-medium text-destructive">✗ {stats.notAnswered}</span>
        <span className="font-medium text-violet-600">⚑ {stats.markedReview + stats.answeredMarked}</span>
        <span className="font-medium text-muted-foreground">○ {stats.notVisited}</span>
      </div>

      {/* Section tabs */}
      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-border">
        {sections.map((sec, si) => {
          const ss = sectionStats(sec);
          return (
            <button
              key={si}
              onClick={() => setActiveSection(si)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSection === si
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {sec.emoji} {sec.name}
              <span className="ml-1 opacity-70">
                {ss.attempted}/{ss.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-6 gap-2">
          {Array.from(
            {
              length: Math.min(
                sections[activeSection].endIndex,
                totalQ - 1
              ) -
                sections[activeSection].startIndex +
                1,
            },
            (_, i) => {
              const qIdx = sections[activeSection].startIndex + i;
              const m = meta[qIdx];
              const isCurrent = qIdx === currentQ;
              return (
                <button
                  key={qIdx}
                  onClick={() => onSelect(qIdx)}
                  className={`
                    relative w-full aspect-square rounded-lg border-2 flex items-center justify-center
                    text-xs font-bold transition-all
                    ${STATE_COLORS[m.state]}
                    ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-105' : ''}
                  `}
                >
                  {qIdx + 1}
                  {m.bookmarked && (
                    <Star className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default NTATestPlayer;
