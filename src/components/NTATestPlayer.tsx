import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, Menu, X, Flag, Star, StickyNote,
  AlertTriangle, Eraser, CheckCircle2, Send, Eye, BookOpen, Loader2,
  ArrowUp, ArrowDown, Link as LinkIcon, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AnswerPayload, NormalizedQuestion, MatchPair, OrderItem,
  isAnswerPayloadAttempted, getCorrectOptionIndex,
} from '@/lib/questionNormalization';
import DiagramGallery from '@/components/questions/DiagramGallery';
import { apiService } from '@/lib/apiService';

export type NTAQuestion = NormalizedQuestion;
export type QuestionState = 'not-visited' | 'not-answered' | 'answered' | 'marked-review' | 'answered-marked';
export interface NTASection { name: string; emoji?: string; startIndex: number; endIndex: number; }
export interface QuestionMeta { state: QuestionState; answerPayload: AnswerPayload | null; bookmarked: boolean; note: string; timeSpent: number; }
export interface NTASubmitData { answers: (AnswerPayload | null)[]; meta: QuestionMeta[]; timeTaken: number; }
export interface NTATestPlayerProps {
  questions: NTAQuestion[]; sections?: NTASection[]; title?: string; duration: number;
  onSubmit: (data: NTASubmitData) => void;
  onAnswerChange?: (questionIndex: number, answer: AnswerPayload | null, meta: QuestionMeta) => void;
  initialMeta?: QuestionMeta[]; readOnly?: boolean;
}

const DEFAULT_SECTIONS: NTASection[] = [
  { name: 'Physics', emoji: '⚛️', startIndex: 0, endIndex: 44 },
  { name: 'Chemistry', emoji: '🧪', startIndex: 45, endIndex: 89 },
  { name: 'Botany', emoji: '🌿', startIndex: 90, endIndex: 134 },
  { name: 'Zoology', emoji: '🐾', startIndex: 135, endIndex: 179 },
];

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

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const isAttempted = (answerPayload: AnswerPayload | null | undefined) => isAnswerPayloadAttempted(answerPayload);

const getEmbeddableVideoUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : trimmed;
};

interface RendererProps {
  question: NTAQuestion;
  answerPayload: AnswerPayload | null;
  onChange: (answer: AnswerPayload | null) => void;
  readOnly: boolean;
}

const MCQRenderer: React.FC<RendererProps> = ({ question, answerPayload, onChange, readOnly }) => {
  const options = Array.isArray(question.typeData?.options) ? question.typeData.options : [];
  const selected = answerPayload?.kind === 'mcq' ? answerPayload.selectedOption : null;
  const correctIdx = getCorrectOptionIndex(question);
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-2.5">
      {options.map((opt: string, i: number) => {
        const isSelected = selected === i;
        let row = 'flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none ';
        if (readOnly) {
          row += correctIdx === i
            ? 'border-emerald-500 bg-emerald-500/10'
            : isSelected ? 'border-destructive bg-destructive/10' : 'border-border bg-card';
        } else {
          row += isSelected
            ? 'border-primary bg-primary/10 shadow-sm'
            : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]';
        }
        return (
          <motion.button key={i} className={row} onClick={() => onChange({ kind: 'mcq', selectedOption: i })} disabled={readOnly} whileTap={readOnly ? {} : { scale: 0.98 }}>
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'}`}>
              {labels[i] || String(i + 1)}
            </span>
            <span className="text-sm text-left leading-relaxed pt-0.5" style={{ whiteSpace: 'pre-wrap' }}>{(opt || '').replace(/\\n/g, '\n').replace(/\/n/g, '\n')}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

const FillupRenderer: React.FC<RendererProps> = ({ answerPayload, onChange, readOnly }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</label>
    <Input
      className="mt-2 h-11"
      value={answerPayload?.kind === 'fillup' ? answerPayload.value : ''}
      disabled={readOnly}
      placeholder="Type your answer"
      onChange={(e) => onChange({ kind: 'fillup', value: e.target.value })}
    />
  </div>
);

const MatchRenderer: React.FC<RendererProps> = ({ question, answerPayload, onChange, readOnly }) => {
  const pairs: MatchPair[] = Array.isArray(question.typeData?.pairs) ? question.typeData.pairs : [];
  const selectedPairs = answerPayload?.kind === 'match' ? answerPayload.pairs : {};
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const rightColumn = useMemo(() => [...pairs].sort((a, b) => a.right.localeCompare(b.right)), [pairs]);

  const assign = (leftId: string, rightValue: string) => {
    onChange({ kind: 'match', pairs: { ...selectedPairs, [leftId]: rightValue } });
    setActiveLeft(null);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column A</p>
        {pairs.map((pair) => (
          <button key={pair.id} disabled={readOnly} onClick={() => setActiveLeft(pair.id)} className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${activeLeft === pair.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
            <div className="font-medium text-foreground whitespace-pre-wrap">{pair.left}</div>
            <div className="mt-1 text-xs text-muted-foreground">{selectedPairs[pair.id] ? `Matched: ${selectedPairs[pair.id]}` : 'Select this row, then choose from Column B'}</div>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column B</p>
        {rightColumn.map((pair) => {
          const linked = Object.entries(selectedPairs).find(([, value]) => value === pair.right)?.[0];
          return (
            <button key={`${pair.id}-right`} disabled={readOnly || !activeLeft} onClick={() => activeLeft && assign(activeLeft, pair.right)} className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${linked ? 'border-primary/40 bg-primary/5' : 'border-border bg-background'} ${!activeLeft && !readOnly ? 'opacity-60' : ''}`}>
              <div className="font-medium text-foreground whitespace-pre-wrap">{pair.right}</div>
              <div className="mt-1 text-xs text-muted-foreground">{linked ? `Assigned to ${pairs.find((item) => item.id === linked)?.left || 'left item'}` : 'Tap after selecting a left item'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const OrderRenderer: React.FC<RendererProps> = ({ question, answerPayload, onChange, readOnly }) => {
  const items: OrderItem[] = Array.isArray(question.typeData?.items) ? question.typeData.items : [];
  const orderedIds = answerPayload?.kind === 'order' && answerPayload.orderedIds.length ? answerPayload.orderedIds : items.map((item) => item.id);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedIds.length) return;
    const next = [...orderedIds];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange({ kind: 'order', orderedIds: next });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arrange in the correct order</p>
      {orderedIds.map((id, index) => {
        const item = items.find((entry) => entry.id === id);
        return (
          <div key={id} className="rounded-lg border border-border bg-background px-3 py-2 flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
            <span className="flex-1 text-sm text-foreground whitespace-pre-wrap">{item?.text || id}</span>
            {!readOnly && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => move(index, 1)} disabled={index === orderedIds.length - 1}><ArrowDown className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FlashcardRenderer: React.FC<RendererProps> = ({ question, answerPayload, onChange, readOnly }) => {
  const flipped = answerPayload?.kind === 'flashcard' ? answerPayload.flipped : false;
  const completed = answerPayload?.kind === 'flashcard' ? answerPayload.completed : false;
  const front = question.typeData?.front || question.question;
  const back = question.typeData?.back || question.explanation;

  const update = (next: Partial<{ flipped: boolean; completed: boolean }>) => {
    onChange({ kind: 'flashcard', flipped: next.flipped ?? flipped, completed: next.completed ?? completed });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="min-h-[180px] rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-center text-center">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{(flipped ? back : front || '').replace(/\\n/g, '\n').replace(/\/n/g, '\n')}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex-1" disabled={readOnly} onClick={() => update({ flipped: !flipped })}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {flipped ? 'Show Front' : 'Flip Card'}
        </Button>
        <Button className="flex-1" disabled={readOnly} onClick={() => update({ completed: !completed, flipped: true })}>
          {completed ? 'Completed' : 'Mark Complete'}
        </Button>
      </div>
    </div>
  );
};

const VideoRenderer: React.FC<RendererProps> = ({ question, answerPayload, onChange, readOnly }) => {
  const completed = answerPayload?.kind === 'video' ? answerPayload.completed : false;
  const videoUrl = getEmbeddableVideoUrl(question.videoUrl || question.typeData?.videoUrl);
  const prompt = question.typeData?.prompt || question.question;

  return (
    <div className="space-y-3">
      {videoUrl ? (
        <div className="rounded-xl overflow-hidden border border-border bg-card aspect-video">
          <iframe
            src={videoUrl}
            title={`Video question ${question.id}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Video URL is not available for this question.</div>
      )}

      {prompt ? <div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground whitespace-pre-wrap">{(prompt || '').replace(/\\n/g, '\n').replace(/\/n/g, '\n')}</div> : null}

      <div className="flex items-center gap-2">
        <Button className="flex-1" disabled={readOnly} onClick={() => onChange({ kind: 'video', completed: !completed })}>
          {completed ? 'Completed' : 'Mark Watched'}
        </Button>
        {question.videoUrl ? (
          <Button variant="outline" className="flex-1" asChild>
            <a href={question.videoUrl} target="_blank" rel="noreferrer">
              <LinkIcon className="w-4 h-4 mr-2" />
              Open Video
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const UnsupportedRenderer: React.FC<RendererProps> = ({ question }) => (
  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
    <p className="text-sm font-semibold text-destructive">This question type is not available in the current dataset.</p>
    <p className="mt-2 text-xs text-muted-foreground">Type: {question.type}</p>
    <p className="text-xs text-muted-foreground">Question ID: {question.questionId || question.id}</p>
    <p className="mt-2 text-sm text-foreground">{question.unsupportedReason || 'Missing structured data for rendering.'}</p>
  </div>
);

const QuestionRenderer: React.FC<RendererProps> = (props) => {
  if (!props.question.isSupported) return <UnsupportedRenderer {...props} />;
  switch (props.question.type) {
    case 'mcq': return <MCQRenderer {...props} />;
    case 'fillup': return <FillupRenderer {...props} />;
    case 'match': return <MatchRenderer {...props} />;
    case 'order': return <OrderRenderer {...props} />;
    case 'flashcard': return <FlashcardRenderer {...props} />;
    case 'video': return <VideoRenderer {...props} />;
    default: return <UnsupportedRenderer {...props} />;
  }
};

const NTATestPlayer: React.FC<NTATestPlayerProps> = ({
  questions, sections: sectionsProp, title = 'Mock Test', duration, onSubmit, onAnswerChange, initialMeta, readOnly = false,
}) => {
  const totalQ = questions.length;
  const sections = useMemo(() => {
    if (sectionsProp?.length) return sectionsProp;
    if (totalQ <= 50) return [{ name: 'All', emoji: '📝', startIndex: 0, endIndex: totalQ - 1 }];
    return DEFAULT_SECTIONS.map((section) => ({ ...section, endIndex: Math.min(section.endIndex, totalQ - 1) })).filter((section) => section.startIndex < totalQ);
  }, [sectionsProp, totalQ]);

  const [currentQ, setCurrentQ] = useState(0);
  const [meta, setMeta] = useState<QuestionMeta[]>(() => initialMeta ?? Array.from({ length: totalQ }, () => ({
    state: 'not-visited' as QuestionState, answerPayload: null, bookmarked: false, note: '', timeSpent: 0,
  })));
  const [timeLeft, setTimeLeft] = useState(duration);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchedImages, setFetchedImages] = useState<Record<string, string>>({});
  const questionEntryTime = useRef(Date.now());

  useEffect(() => {
    const q = questions[currentQ];
    if (q && !q.imageUrl && q.questionId && (q.subject === 'biology' || !q.subject) && !fetchedImages[q.questionId]) {
      apiService.curriculum.getImageFallback(q.subject || 'biology', String(q.questionId))
      .then(res => {
        if (res.data.success && res.data.imageUrl) {
          setFetchedImages(prev => ({ ...prev, [String(q.questionId)]: res.data.imageUrl }));
        }
      })
      .catch(err => console.log('Image fetch fallback failed', err));
    }
  }, [currentQ, questions, fetchedImages]);

  useEffect(() => {
    questionEntryTime.current = Date.now();
    setMeta((prev) => {
      const next = [...prev];
      if (next[currentQ]?.state === 'not-visited') next[currentQ] = { ...next[currentQ], state: 'not-answered' };
      return next;
    });
  }, [currentQ]);

  const recordTimeSpent = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionEntryTime.current) / 1000);
    setMeta((prev) => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], timeSpent: next[currentQ].timeSpent + elapsed };
      return next;
    });
  }, [currentQ]);

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

  const currentSection = useMemo(() => sections.find((section) => currentQ >= section.startIndex && currentQ <= section.endIndex) ?? sections[0], [currentQ, sections]);

  const stats = useMemo(() => {
    const counts = { answered: 0, notAnswered: 0, markedReview: 0, notVisited: 0, answeredMarked: 0 };
    meta.forEach((entry) => {
      if (entry.state === 'answered') counts.answered++;
      else if (entry.state === 'not-answered') counts.notAnswered++;
      else if (entry.state === 'marked-review') counts.markedReview++;
      else if (entry.state === 'not-visited') counts.notVisited++;
      else if (entry.state === 'answered-marked') counts.answeredMarked++;
    });
    return counts;
  }, [meta]);

  const sectionStats = useCallback((section: NTASection) => {
    let attempted = 0; let total = 0;
    for (let index = section.startIndex; index <= Math.min(section.endIndex, totalQ - 1); index += 1) {
      total += 1;
      if (isAttempted(meta[index]?.answerPayload)) attempted += 1;
    }
    return { attempted, total };
  }, [meta, totalQ]);

  const updateCurrentMeta = (updater: (current: QuestionMeta) => QuestionMeta) => {
    setMeta((prev) => {
      const next = [...prev];
      next[currentQ] = updater(next[currentQ]);
      onAnswerChange?.(currentQ, next[currentQ].answerPayload, next[currentQ]);
      return next;
    });
  };

  const handleAnswerPayloadChange = (answerPayload: AnswerPayload | null) => {
    if (readOnly) return;
    updateCurrentMeta((current) => {
      const attempted = isAttempted(answerPayload);
      const marked = current.state === 'marked-review' || current.state === 'answered-marked';
      return { ...current, answerPayload, state: attempted ? (marked ? 'answered-marked' : 'answered') : (marked ? 'marked-review' : 'not-answered') };
    });
  };

  const clearAnswer = () => !readOnly && handleAnswerPayloadChange(null);
  const toggleMarkReview = () => !readOnly && updateCurrentMeta((current) => {
    const attempted = isAttempted(current.answerPayload);
    const marked = current.state === 'marked-review' || current.state === 'answered-marked';
    return { ...current, state: marked ? (attempted ? 'answered' : 'not-answered') : (attempted ? 'answered-marked' : 'marked-review') };
  });
  const toggleBookmark = () => updateCurrentMeta((current) => ({ ...current, bookmarked: !current.bookmarked }));
  const updateNote = (text: string) => updateCurrentMeta((current) => ({ ...current, note: text }));
  const goTo = (index: number) => { if (index < 0 || index >= totalQ) return; recordTimeSpent(); setCurrentQ(index); setPaletteOpen(false); };
  const saveAndNext = () => { recordTimeSpent(); if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1); };
  const markAndNext = () => { if (!readOnly) toggleMarkReview(); recordTimeSpent(); if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1); };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true); setShowSubmitDialog(false); recordTimeSpent();
    try {
      await onSubmit({ answers: meta.map((entry) => entry.answerPayload), meta, timeTaken: duration - timeLeft });
    } catch (error) {
      console.error('Failed to submit test:', error);
      setIsSubmitting(false); setShowSubmitDialog(true);
    }
  };

  const q = questions[currentQ];
  const curMeta = meta[currentQ];
  const isMarked = curMeta?.state === 'marked-review' || curMeta?.state === 'answered-marked';
  const timerUrgent = timeLeft < 300;
  const timerWarning = timeLeft < 900 && !timerUrgent;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex-shrink-0 bg-card border-b border-border px-3 py-2 safe-area-top">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-sm font-bold text-foreground truncate flex-1 mr-2">{title}</h1>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${timerUrgent ? 'bg-destructive/15 text-destructive animate-pulse' : timerWarning ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-primary/10 text-primary'}`}>
            <Clock className="w-3.5 h-3.5" />{formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">{currentSection?.emoji} {currentSection?.name}</Badge>
            <span className="text-xs text-muted-foreground font-medium">Q {currentQ + 1}/{totalQ}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Menu className="w-4 h-4" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
                <QuestionPalette sections={sections} meta={meta} currentQ={currentQ} totalQ={totalQ} stats={stats} sectionStats={sectionStats} onSelect={goTo} />
              </SheetContent>
            </Sheet>
            {!readOnly && (
              <Button variant="destructive" size="sm" className="h-8 text-xs font-bold px-3" onClick={() => setShowSubmitDialog(true)} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Question {currentQ + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={toggleBookmark} className={`p-1.5 rounded-lg transition-colors ${curMeta?.bookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <Star className="w-4 h-4" fill={curMeta?.bookmarked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => setNoteOpen(!noteOpen)} className={`p-1.5 rounded-lg transition-colors ${curMeta?.note ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <StickyNote className="w-4 h-4" />
                </button>
                {isMarked && <span className="p-1.5 rounded-lg text-violet-500 bg-violet-500/10"><Flag className="w-4 h-4" fill="currentColor" /></span>}
              </div>
            </div>

            <AnimatePresence>
              {noteOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                  <Textarea placeholder="Add a personal note for this question..." value={curMeta?.note || ''} onChange={(e) => updateNote(e.target.value)} className="text-sm min-h-[60px] bg-muted/50" readOnly={readOnly} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-sm leading-relaxed text-foreground mb-4 select-text">
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {(q?.question || '').replace(/\\n/g, '\n').replace(/\/n/g, '\n')}
              </p>
            </div>

            {/* Consolidate Diagram Display: Show either the main imageUrl (or fallback) OR the gallery warnings, but not both if they represent the same thing */}
            {(q?.imageUrl || (q?.questionId && fetchedImages[String(q.questionId)])) ? (
              <div className="mb-4 rounded-xl overflow-hidden border border-border bg-card">
                <img 
                  src={q?.imageUrl || fetchedImages[String(q?.questionId)]} 
                  alt={`Question ${currentQ + 1}`} 
                  className="w-full object-contain max-h-72" 
                  loading="lazy" 
                />
              </div>
            ) : null}

            {/* Only show DiagramGallery for diagrams that are NOT already covered by the main imageUrl fallback */}
            <DiagramGallery 
              diagrams={q?.resolvedQuestionDiagrams?.filter(d => 
                d.status !== 'missing' || (!(q?.imageUrl || fetchedImages[String(q.questionId)]))
              )} 
              className="mb-4" 
            />

            <QuestionRenderer question={q} answerPayload={curMeta?.answerPayload} onChange={handleAnswerPayloadChange} readOnly={readOnly} />

            {readOnly && (q?.explanation || q?.resolvedExplanationDiagrams?.length) && (
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Explanation</p>
                {q?.explanation ? (
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                    {q.explanation.replace(/\\n/g, '\n').replace(/\/n/g, '\n')}
                  </p>
                ) : null}
                {q?.explanationImageUrl ? (
                  <div className="mt-3 rounded-xl overflow-hidden border border-border bg-card">
                    <img src={q.explanationImageUrl} alt={`Explanation ${currentQ + 1}`} className="w-full object-contain max-h-60" loading="lazy" />
                  </div>
                ) : null}
                <DiagramGallery diagrams={q?.resolvedExplanationDiagrams} className="mt-3" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 border-t border-border bg-card px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-between gap-1 mb-2">
          <Button variant="outline" size="sm" className="text-xs h-8 flex-1" onClick={clearAnswer} disabled={readOnly || !isAttempted(curMeta?.answerPayload)}><Eraser className="w-3.5 h-3.5 mr-1" />Clear</Button>
          <Button variant={isMarked ? 'default' : 'outline'} size="sm" className={`text-xs h-8 flex-1 ${isMarked ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`} onClick={toggleMarkReview} disabled={readOnly}><Flag className="w-3.5 h-3.5 mr-1" />{isMarked ? 'Unmark' : 'Mark Review'}</Button>
          <Button variant={curMeta?.bookmarked ? 'default' : 'outline'} size="sm" className={`text-xs h-8 ${curMeta?.bookmarked ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`} onClick={toggleBookmark}><Star className="w-3.5 h-3.5" /></Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-10 flex-shrink-0" onClick={() => goTo(currentQ - 1)} disabled={currentQ === 0}><ChevronLeft className="w-4 h-4" /></Button>
          {!readOnly ? (
            <>
              <Button variant="secondary" size="sm" className="h-10 flex-1 text-xs font-bold" onClick={saveAndNext}>Save & Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
              <Button size="sm" className="h-10 flex-1 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white" onClick={markAndNext}>Mark & Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" className="h-10 flex-1 text-xs font-bold" onClick={() => goTo(currentQ + 1)} disabled={currentQ >= totalQ - 1}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
          )}
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Submit Test?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Are you sure you want to submit? You cannot change answers after submission.</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg px-3 py-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-medium">Answered: {stats.answered + stats.answeredMarked}</span></div>
                  <div className="flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-2"><X className="w-4 h-4 text-destructive" /><span className="font-medium">Unanswered: {stats.notAnswered}</span></div>
                  <div className="flex items-center gap-2 bg-violet-500/10 rounded-lg px-3 py-2"><Flag className="w-4 h-4 text-violet-600" /><span className="font-medium">Review: {stats.markedReview + stats.answeredMarked}</span></div>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"><Eye className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Not Visited: {stats.notVisited}</span></div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Test'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Submitting your test</p>
                <p className="text-xs text-muted-foreground">Preparing report and analysis...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PaletteProps {
  sections: NTASection[]; meta: QuestionMeta[]; currentQ: number; totalQ: number;
  stats: { answered: number; notAnswered: number; markedReview: number; notVisited: number; answeredMarked: number };
  sectionStats: (section: NTASection) => { attempted: number; total: number };
  onSelect: (index: number) => void;
}

const QuestionPalette: React.FC<PaletteProps> = ({ sections, meta, currentQ, totalQ, stats, sectionStats, onSelect }) => {
  const [activeSection, setActiveSection] = useState(0);
  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-4 pb-2 border-b border-border"><SheetTitle className="text-base">Question Palette</SheetTitle></SheetHeader>
      <div className="px-4 py-2 border-b border-border"><div className="grid grid-cols-3 gap-1.5 text-[10px]">{(Object.keys(STATE_COLORS) as QuestionState[]).map((state) => (<div key={state} className="flex items-center gap-1"><span className={`w-3 h-3 rounded-sm border ${STATE_COLORS[state]}`} /><span className="text-muted-foreground truncate">{STATE_LABELS[state]}</span></div>))}</div></div>
      <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs flex-wrap">
        <span className="font-medium text-emerald-600">✓ {stats.answered + stats.answeredMarked}</span>
        <span className="font-medium text-destructive">✕ {stats.notAnswered}</span>
        <span className="font-medium text-violet-600">⚑ {stats.markedReview + stats.answeredMarked}</span>
        <span className="font-medium text-muted-foreground">○ {stats.notVisited}</span>
      </div>
      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-border">{sections.map((section, index) => { const current = sectionStats(section); return <button key={index} onClick={() => setActiveSection(index)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSection === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{section.emoji} {section.name}<span className="ml-1 opacity-70">{current.attempted}/{current.total}</span></button>; })}</div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: Math.min(sections[activeSection].endIndex, totalQ - 1) - sections[activeSection].startIndex + 1 }, (_, i) => {
            const qIdx = sections[activeSection].startIndex + i;
            const entry = meta[qIdx];
            const isCurrent = qIdx === currentQ;
            return <button key={qIdx} onClick={() => onSelect(qIdx)} className={`relative w-full aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${STATE_COLORS[entry.state]} ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-105' : ''}`}>{qIdx + 1}{entry.bookmarked && <Star className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />}</button>;
          })}
        </div>
      </div>
    </div>
  );
};

export default NTATestPlayer;
