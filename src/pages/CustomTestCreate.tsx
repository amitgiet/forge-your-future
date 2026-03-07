/**
 * CustomTestCreate.tsx
 * Full rewrite — now powered by the real curriculum API + /api/v1/questions/test endpoint.
 *
 * Flow:
 *  1. Pick subject → load real chapters from /api/v1/curriculum/:subject/chapters
 *  2. Pick chapter  → load real subtopics (with question counts) from
 *     /api/v1/curriculum/:subject/chapters/:chapterId/subtopics
 *  3. Pick subtopics, difficulty, question count, mode
 *  4. POST /api/v1/questions/test → get random questions
 *  5. Navigate to existing QuizPlayer / TestSession with the returned questions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, BookOpen, Beaker, Atom,
  Zap, Target, BarChart3, CheckCircle2, Loader2, AlertCircle,
  Shuffle, ClockIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Chapter {
  _id: string;
  subject: string;
  order: number;
}

interface SubTopic {
  subTopic: string;
  uid_count: number;
  progress?: { hasTaken: boolean; bestScore: number };
}

interface TopicGroup {
  topic: string;
  sub_topics: SubTopic[];
}

type Subject = 'biology' | 'chemistry' | 'physics';
type Step = 'subject' | 'chapter' | 'subtopics' | 'config';
type Mode = 'practice' | 'test';
type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

// ── Constants ──────────────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<Subject, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  biology: { label: 'Biology', Icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  chemistry: { label: 'Chemistry', Icon: Beaker, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  physics: { label: 'Physics', Icon: Atom, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'mixed', label: 'Mixed', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  { value: 'easy', label: 'Easy', color: 'bg-green-500/20 text-green-400  border-green-500/40' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  { value: 'hard', label: 'Hard', color: 'bg-red-500/20 text-red-400     border-red-500/40' },
];

const QUESTION_PRESETS = [10, 20, 30, 45, 60, 90];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatChapterId(id: string): string {
  // "DIVERSITY IN LIVING WORLD" → capitalize words
  return id
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CustomTestCreate() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('subject');
  // Multi-subject selection — set of selected subjects
  const [selectedSubjects, setSelectedSubjects] = useState<Set<Subject>>(new Set());
  // Derived single subject (for single-subject flow)
  const subject: Subject | null = selectedSubjects.size === 1 ? [...selectedSubjects][0] : null;
  const isMultiSubject = selectedSubjects.size > 1;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [mode, setMode] = useState<Mode>('practice');
  const [title, setTitle] = useState<string>('');
  const [isPYQ, setIsPYQ] = useState<boolean>(false);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load chapters when subject changes ──────────────────────────────────────
  const loadChapters = useCallback(async (sub: Subject) => {
    setLoadingChapters(true);
    setError(null);
    try {
      const res = await api.get(`/curriculum/${sub}/chapters`);
      setChapters(res.data.data || []);
    } catch {
      setError('Failed to load chapters. Please try again.');
    } finally {
      setLoadingChapters(false);
    }
  }, []);

  // ── Load subtopics when chapter changes ─────────────────────────────────────
  const loadSubTopics = useCallback(async (sub: Subject, chapterId: string) => {
    setLoadingSubTopics(true);
    setError(null);
    try {
      const res = await api.get(`/curriculum/${sub}/chapters/${encodeURIComponent(chapterId)}/subtopics`);
      setTopicGroups(res.data.data || []);
    } catch {
      setError('Failed to load subtopics. Please try again.');
    } finally {
      setLoadingSubTopics(false);
    }
  }, []);

  // ── Total question count available in selected subtopics ───────────────────
  const availableQuestionCount = React.useMemo(() => {
    if (selectedSubTopics.size === 0 && topicGroups.length === 0) return 0;
    let total = 0;
    topicGroups.forEach((tg) => {
      tg.sub_topics.forEach((st) => {
        const key = `${tg.topic}|||${st.subTopic}`;
        if (selectedSubTopics.size === 0 || selectedSubTopics.has(key)) {
          total += st.uid_count;
        }
      });
    });
    return total;
  }, [topicGroups, selectedSubTopics]);

  // ── Step handlers ──────────────────────────────────────────────────────────
  const toggleSubject = (sub: Subject) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub);
      else next.add(sub);
      return next;
    });
  };

  const handleProceedFromSubject = () => {
    if (selectedSubjects.size === 0) return;
    setSelectedChapter(null);
    setTopicGroups([]);
    setSelectedSubTopics(new Set());
    if (selectedSubjects.size === 1) {
      // Single subject → show chapter picker
      loadChapters([...selectedSubjects][0]);
      setStep('chapter');
    } else {
      // Multi-subject → skip chapter/subtopic, go straight to config
      setStep('config');
    }
  };

  const handleSelectChapter = (ch: Chapter) => {
    setSelectedChapter(ch);
    setTopicGroups([]);
    setSelectedSubTopics(new Set());
    loadSubTopics(subject!, ch._id);
    setStep('subtopics');
  };

  const toggleSubTopic = (topicName: string, subTopicName: string) => {
    const key = `${topicName}|||${subTopicName}`;
    setSelectedSubTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllSubTopicsInTopic = (topicName: string, topicGroup: TopicGroup) => {
    setSelectedSubTopics((prev) => {
      const next = new Set(prev);
      const allSelected = topicGroup.sub_topics.every((st) =>
        next.has(`${topicName}|||${st.subTopic}`)
      );
      topicGroup.sub_topics.forEach((st) => {
        const key = `${topicName}|||${st.subTopic}`;
        if (allSelected) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };

  // ── Generate test ──────────────────────────────────────────────────────────
  const handleGenerateTest = async () => {
    if (!subject) return;
    setLoadingTest(true);
    setError(null);

    try {
      // Build subtopic filter: if specific ones selected, use first selected's subTopic
      // (for multi-subtopic we send chapterId and let server pick from all)
      const selectedArray = Array.from(selectedSubTopics);
      const firstSubTopic = selectedArray.length === 1
        ? selectedArray[0].split('|||')[1]
        : undefined;
      const firstTopic = selectedArray.length === 1
        ? selectedArray[0].split('|||')[0]
        : undefined;

      const body: Record<string, unknown> = {
        count: questionCount,
        difficulty: difficulty === 'mixed' ? undefined : difficulty,
        isPYQ: isPYQ || undefined,
        mode,
        title: title.trim() || undefined,
      };

      if (isMultiSubject) {
        // Combined quiz — send subjects array
        body.subjects = [...selectedSubjects];
      } else {
        // Single subject quiz
        body.subject = subject;
        body.chapterId = selectedChapter?._id;
        // When a single subtopic is selected, pass that for precision
        if (selectedArray.length === 1) {
          body.subTopic = firstSubTopic;
          body.topic = firstTopic;
        }
      }

      const res = await api.post('/questions/test', body);
      const { data: questions, meta } = res.data;

      if (!questions || questions.length === 0) {
        setError('No questions found for the selected filters. Try different options.');
        return;
      }

      // Navigate to quiz session with questions in state
      navigate('/quiz-session', {
        state: {
          questions,
          mode,
          topic: meta?.filters?.subTopic || meta?.filters?.chapterId || 'Custom Test',
          subject,
          questionCount: questions.length,
        },
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message || 'Failed to generate test. Please try again.');
    } finally {
      setLoadingTest(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const effectiveQuestionCount = Math.min(questionCount, availableQuestionCount || questionCount);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-lg mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button
            onClick={() => {
              if (step === 'subject') navigate(-1);
              else if (step === 'chapter') setStep('subject');
              else if (step === 'subtopics') setStep('chapter');
              else if (step === 'config') {
                if (isMultiSubject) setStep('subject');
                else setStep('subtopics');
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Progress breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            {(['subject', 'chapter', 'subtopics', 'config'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <span className={step === s ? 'text-primary font-semibold' : ''}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
                {i < 3 && <ChevronRight className="w-3 h-3" />}
              </React.Fragment>
            ))}
          </div>

          <h1 className="nf-heading text-2xl nf-gradient-text">Custom Test Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build a test from your selected curriculum topics
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 1: Subject ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 'subject' && (
            <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs text-muted-foreground mb-3">
                Select one subject for chapter-level control, or multiple for a combined NEET-style quiz.
              </p>
              <div className="space-y-3 mb-5">
                {(Object.entries(SUBJECT_CONFIG) as [Subject, typeof SUBJECT_CONFIG[Subject]][]).map(([sub, cfg]) => {
                  const selected = selectedSubjects.has(sub);
                  return (
                    <motion.button
                      key={sub}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSubject(sub)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selected
                        ? cfg.bg + ' shadow-md'
                        : 'border-border bg-card hover:bg-muted/30'
                        }`}
                    >
                      <cfg.Icon className={`w-8 h-8 ${selected ? cfg.color : 'text-muted-foreground'}`} />
                      <div className="text-left flex-1">
                        <div className={`font-bold text-lg ${selected ? cfg.color : 'text-foreground'}`}>{cfg.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {selected
                            ? selectedSubjects.size === 1 ? 'Chapter & subtopic control →' : 'Added to combined quiz'
                            : 'Tap to select'}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? cfg.color + ' border-current bg-current/10' : 'border-muted-foreground'
                        }`}>
                        {selected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {selectedSubjects.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleProceedFromSubject}
                  className="w-full py-4 nf-gradient rounded-xl text-white font-black text-base flex items-center justify-center gap-2 shadow-card"
                >
                  {isMultiSubject
                    ? `⚡ Combined Quiz (${selectedSubjects.size} subjects)`
                    : `${SUBJECT_CONFIG[[...selectedSubjects][0]].label} → Pick Chapter`}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Chapter ──────────────────────────────────────────── */}
          {step === 'chapter' && (
            <motion.div key="chapter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {loadingChapters ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Loading chapters…
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">{chapters.length} chapters available</p>
                  {chapters.map((ch) => (
                    <motion.button
                      key={ch._id}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChapter(ch)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-all text-left"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-foreground">{formatChapterId(ch._id)}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Subtopics ─────────────────────────────────────────── */}
          {step === 'subtopics' && (
            <motion.div key="subtopics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {loadingSubTopics ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Loading subtopics…
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">
                      {selectedSubTopics.size > 0
                        ? `${selectedSubTopics.size} subtopic(s) selected · ~${availableQuestionCount} Qs`
                        : 'Select subtopics (or leave empty to draw from all)'}
                    </p>
                    {selectedSubTopics.size > 0 && (
                      <button
                        onClick={() => setSelectedSubTopics(new Set())}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    {topicGroups.map((tg) => {
                      const allInTopic = tg.sub_topics.every((st) =>
                        selectedSubTopics.has(`${tg.topic}|||${st.subTopic}`)
                      );
                      return (
                        <div key={tg.topic} className="nf-card !p-3">
                          {/* Topic header with Select All */}
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => setSelectedTopic(selectedTopic === tg.topic ? null : tg.topic)}
                              className="font-bold text-sm text-foreground text-left flex-1"
                            >
                              {tg.topic}
                            </button>
                            <button
                              onClick={() => selectAllSubTopicsInTopic(tg.topic, tg)}
                              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${allInTopic
                                ? 'bg-primary/20 text-primary border-primary/40'
                                : 'text-muted-foreground border-border hover:border-primary/40'
                                }`}
                            >
                              {allInTopic ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            {tg.sub_topics.map((st) => {
                              const key = `${tg.topic}|||${st.subTopic}`;
                              const selected = selectedSubTopics.has(key);
                              return (
                                <button
                                  key={st.subTopic}
                                  onClick={() => toggleSubTopic(tg.topic, st.subTopic)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all border ${selected
                                    ? 'bg-primary/15 border-primary/50 text-foreground'
                                    : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'
                                    }`}
                                >
                                  <span className="text-left leading-tight">{st.subTopic}</span>
                                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <span className="text-xs opacity-60">{st.uid_count}Q</span>
                                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('config')}
                    className="w-full py-4 nf-gradient rounded-xl text-white font-black text-base flex items-center justify-center gap-2 shadow-card"
                  >
                    <Target className="w-5 h-5" />
                    Configure Test
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Config & Generate ─────────────────────────────────── */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Summary card */}
              <div className="nf-card !p-4 flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold text-foreground mb-0.5">
                    {subject && SUBJECT_CONFIG[subject].label} · {formatChapterId(selectedChapter?._id || '')}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selectedSubTopics.size > 0
                      ? `${selectedSubTopics.size} subtopic(s) · ~${availableQuestionCount} available Qs`
                      : `All subtopics · ~${availableQuestionCount} available Qs`}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="nf-card !p-4">
                <label className="block text-sm font-bold text-foreground mb-2">Test Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${subject ? SUBJECT_CONFIG[subject].label : ''} – ${formatChapterId(selectedChapter?._id || '').substring(0, 25)} Test`}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Mode */}
              <div className="nf-card !p-4">
                <label className="block text-sm font-bold text-foreground mb-3">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['practice', 'test'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-3 rounded-xl font-bold text-sm border transition-all ${mode === m
                        ? 'nf-gradient text-white border-transparent shadow-card'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/60'
                        }`}
                    >
                      {m === 'practice' ? '📚 Practice' : '⏱️ Timed Test'}
                    </button>
                  ))}
                </div>
                {mode === 'test' && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    72 seconds per question (NEET standard)
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div className="nf-card !p-4">
                <label className="block text-sm font-bold text-foreground mb-3">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`py-2.5 rounded-xl font-semibold text-sm border transition-all ${difficulty === d.value
                        ? d.color + ' shadow-sm scale-[1.02]'
                        : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PYQ Toggle */}
              <div className="nf-card !p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsPYQ(!isPYQ)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isPYQ ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isPYQ ? 'left-7' : 'left-1'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">PYQ Only</div>
                    <div className="text-xs text-muted-foreground">Only previous year questions</div>
                  </div>
                </label>
              </div>

              {/* Question Count */}
              <div className="nf-card !p-4">
                <label className="block text-sm font-bold text-foreground mb-3">
                  Questions: <span className="text-primary">{effectiveQuestionCount}</span>
                  {availableQuestionCount > 0 && questionCount > availableQuestionCount && (
                    <span className="text-xs text-amber-400 ml-2">(max available)</span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {QUESTION_PRESETS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`py-2 rounded-lg text-sm font-bold border transition-all ${questionCount === n
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={5} max={200} step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleGenerateTest}
                disabled={loadingTest}
                className="w-full py-4 nf-gradient rounded-xl text-white font-black text-lg flex items-center justify-center gap-2 shadow-card disabled:opacity-60"
              >
                {loadingTest ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Shuffle className="w-5 h-5" />
                    Generate & Start {mode === 'test' ? 'Test' : 'Practice'}
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
