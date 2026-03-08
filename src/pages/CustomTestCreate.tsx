/**
 * CustomTestCreate.tsx – Melvano-themed Custom Test Generator
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, BookOpen, Beaker, Atom,
  Zap, Target, BarChart3, CheckCircle2, Loader2, AlertCircle, ChevronDown,
  Shuffle, ClockIcon, Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import BottomNav from '@/components/BottomNav';

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

const SUBJECT_CONFIG: Record<Subject, { label: string; Icon: React.ElementType; emoji: string }> = {
  biology: { label: 'Biology', Icon: BookOpen, emoji: '🧬' },
  chemistry: { label: 'Chemistry', Icon: Beaker, emoji: '⚗️' },
  physics: { label: 'Physics', Icon: Atom, emoji: '⚛️' },
};

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; emoji: string }[] = [
  { value: 'mixed', label: 'Mixed', emoji: '🎲' },
  { value: 'easy', label: 'Easy', emoji: '🟢' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'hard', label: 'Hard', emoji: '🔴' },
];

const QUESTION_PRESETS = [10, 20, 30, 45, 60, 90];

const STEPS: Step[] = ['subject', 'chapter', 'subtopics', 'config'];
const STEP_LABELS: Record<Step, string> = {
  subject: 'Subject',
  chapter: 'Chapter',
  subtopics: 'Topics',
  config: 'Configure',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatChapterId(id: string): string {
  return id
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CustomTestCreate() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('subject');
  const [selectedSubjects, setSelectedSubjects] = useState<Set<Subject>>(new Set());
  const subject: Subject | null = selectedSubjects.size === 1 ? [...selectedSubjects][0] : null;
  const isMultiSubject = selectedSubjects.size > 1;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chapterSearch, setChapterSearch] = useState('');

  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [mode, setMode] = useState<Mode>('practice');
  const [title, setTitle] = useState<string>('');
  const [isPYQ, setIsPYQ] = useState<boolean>(false);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load chapters ──────────────────────────────────────────────────────────
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

  // ── Load subtopics ─────────────────────────────────────────────────────────
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

  const availableQuestionCount = useMemo(() => {
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

  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return chapters;
    const q = chapterSearch.toLowerCase();
    return chapters.filter((ch) => ch._id.toLowerCase().includes(q));
  }, [chapters, chapterSearch]);

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
      loadChapters([...selectedSubjects][0]);
      setStep('chapter');
    } else {
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
    if (!subject && !isMultiSubject) return;
    setLoadingTest(true);
    setError(null);

    try {
      const selectedArray = Array.from(selectedSubTopics);
      const firstSubTopic = selectedArray.length === 1 ? selectedArray[0].split('|||')[1] : undefined;
      const firstTopic = selectedArray.length === 1 ? selectedArray[0].split('|||')[0] : undefined;

      const body: Record<string, unknown> = {
        count: questionCount,
        difficulty: difficulty === 'mixed' ? undefined : difficulty,
        isPYQ: isPYQ || undefined,
        mode,
        title: title.trim() || undefined,
      };

      if (isMultiSubject) {
        body.subjects = [...selectedSubjects];
      } else {
        body.subject = subject;
        body.chapterId = selectedChapter?._id;
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

  const effectiveQuestionCount = Math.min(questionCount, availableQuestionCount || questionCount);

  const handleBack = () => {
    if (step === 'subject') navigate(-1);
    else if (step === 'chapter') setStep('subject');
    else if (step === 'subtopics') setStep('chapter');
    else if (step === 'config') {
      if (isMultiSubject) setStep('subject');
      else setStep('subtopics');
    }
  };

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Custom Test</h1>
              <p className="text-xs text-muted-foreground">Build your perfect practice</p>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {currentStepIndex + 1}/{STEPS.length}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : i === currentStepIndex
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:inline ${
                    i === currentStepIndex ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full mx-1 ${
                    i < currentStepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Subject ─────────────────────────────────────────── */}
          {step === 'subject' && (
            <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Choose Subject</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select one for chapter control, or multiple for a combined quiz
                </p>
              </div>

              <div className="space-y-3 mb-5">
                {(Object.entries(SUBJECT_CONFIG) as [Subject, typeof SUBJECT_CONFIG[Subject]][]).map(([sub, cfg]) => {
                  const selected = selectedSubjects.has(sub);
                  return (
                    <motion.button
                      key={sub}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSubject(sub)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        selected ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {cfg.emoji}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-foreground">{cfg.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {selected
                            ? selectedSubjects.size === 1 ? 'Chapter & subtopic control →' : 'Added to combined quiz'
                            : 'Tap to select'}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {selected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {selectedSubjects.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedFromSubject}
                  className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-sm"
                >
                  {isMultiSubject
                    ? `⚡ Combined Quiz (${selectedSubjects.size} subjects)`
                    : `Continue with ${SUBJECT_CONFIG[[...selectedSubjects][0]].label}`}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Chapter ──────────────────────────────────────────── */}
          {step === 'chapter' && (
            <motion.div key="chapter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Select Chapter</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {subject && SUBJECT_CONFIG[subject].emoji} {subject && SUBJECT_CONFIG[subject].label} · {chapters.length} chapters
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {loadingChapters ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm">Loading chapters…</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredChapters.map((ch, idx) => (
                    <motion.button
                      key={ch._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChapter(ch)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{formatChapterId(ch._id)}</div>
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
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Select Topics</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatChapterId(selectedChapter?._id || '')}
                </p>
              </div>

              {loadingSubTopics ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-sm">Loading topics…</span>
                </div>
              ) : (
                <>
                  {/* Selection summary */}
                  <div className="flex items-center justify-between mb-3 p-3 bg-card border border-border rounded-xl">
                    <p className="text-xs text-muted-foreground">
                      {selectedSubTopics.size > 0
                        ? <><span className="font-semibold text-primary">{selectedSubTopics.size}</span> selected · ~{availableQuestionCount} Qs</>
                        : 'Select topics or leave empty for all'}
                    </p>
                    {selectedSubTopics.size > 0 && (
                      <button
                        onClick={() => setSelectedSubTopics(new Set())}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {topicGroups.map((tg) => {
                      const allInTopic = tg.sub_topics.every((st) =>
                        selectedSubTopics.has(`${tg.topic}|||${st.subTopic}`)
                      );
                      const isExpanded = selectedTopic === tg.topic;
                      const selectedCount = tg.sub_topics.filter((st) =>
                        selectedSubTopics.has(`${tg.topic}|||${st.subTopic}`)
                      ).length;
                      const totalQs = tg.sub_topics.reduce((sum, st) => sum + st.uid_count, 0);

                      return (
                        <div key={tg.topic} className="bg-card border border-border rounded-2xl overflow-hidden">
                          {/* Topic header — tap to expand/collapse */}
                          <button
                            onClick={() => setSelectedTopic(isExpanded ? null : tg.topic)}
                            className="w-full flex items-center justify-between p-3 bg-muted/30 text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-foreground truncate">{tg.topic}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {tg.sub_topics.length} subtopics · {totalQs}Q
                                {selectedCount > 0 && (
                                  <span className="text-primary font-medium"> · {selectedCount} selected</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {selectedCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                  {selectedCount}
                                </span>
                              )}
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Collapsible subtopics */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-border">
                                  {/* Select All button */}
                                  <div className="px-3 pt-2 pb-1 flex justify-end">
                                    <button
                                      onClick={() => selectAllSubTopicsInTopic(tg.topic, tg)}
                                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                                        allInTopic
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-card border border-border text-muted-foreground hover:border-primary/40'
                                      }`}
                                    >
                                      {allInTopic ? '✓ Deselect All' : 'Select All'}
                                    </button>
                                  </div>

                                  <div className="p-2 space-y-1">
                                    {tg.sub_topics.map((st) => {
                                      const key = `${tg.topic}|||${st.subTopic}`;
                                      const selected = selectedSubTopics.has(key);
                                      return (
                                        <button
                                          key={st.subTopic}
                                          onClick={() => toggleSubTopic(tg.topic, st.subTopic)}
                                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                                            selected
                                              ? 'bg-primary/10 text-foreground'
                                              : 'text-muted-foreground hover:bg-muted/50'
                                          }`}
                                        >
                                          <span className="text-left leading-tight text-xs">{st.subTopic}</span>
                                          <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{st.uid_count}Q</span>
                                            {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep('config')}
                    className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-sm"
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
              <div className="mb-2">
                <h2 className="text-xl font-bold text-foreground">Configure Test</h2>
                <p className="text-sm text-muted-foreground mt-1">Set your preferences and start</p>
              </div>

              {/* Summary card */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm flex-1">
                  <div className="font-bold text-foreground">
                    {isMultiSubject
                      ? `Combined (${selectedSubjects.size} subjects)`
                      : `${subject && SUBJECT_CONFIG[subject].label} · ${formatChapterId(selectedChapter?._id || '')}`}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {selectedSubTopics.size > 0
                      ? `${selectedSubTopics.size} subtopic(s) · ~${availableQuestionCount} available Qs`
                      : `All subtopics · ~${availableQuestionCount} available Qs`}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-2">Test Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${subject ? SUBJECT_CONFIG[subject].label : 'Combined'} Test`}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Mode */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-3">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['practice', 'test'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                        mode === m
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {m === 'practice' ? '📚 Practice' : '⏱️ Timed Test'}
                    </button>
                  ))}
                </div>
                {mode === 'test' && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <ClockIcon className="w-3 h-3" />
                    72 seconds per question (NEET standard)
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-3">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`py-2.5 rounded-xl font-semibold text-xs border-2 transition-all flex flex-col items-center gap-1 ${
                        difficulty === d.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <span>{d.emoji}</span>
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PYQ Toggle */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsPYQ(!isPYQ)}
                    className={`w-12 h-7 rounded-full transition-all relative ${isPYQ ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow-sm transition-all ${isPYQ ? 'left-6' : 'left-1'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">PYQ Only</div>
                    <div className="text-xs text-muted-foreground">Only previous year questions</div>
                  </div>
                </label>
              </div>

              {/* Question Count */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-3">
                  Questions: <span className="text-primary">{effectiveQuestionCount}</span>
                  {availableQuestionCount > 0 && questionCount > availableQuestionCount && (
                    <span className="text-xs text-destructive ml-2">(max available)</span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {QUESTION_PRESETS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        questionCount === n
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background text-muted-foreground border-border hover:border-primary/30'
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
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateTest}
                disabled={loadingTest}
                className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {loadingTest ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Shuffle className="w-5 h-5" />
                    Start {mode === 'test' ? 'Test' : 'Practice'}
                    <Zap className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
