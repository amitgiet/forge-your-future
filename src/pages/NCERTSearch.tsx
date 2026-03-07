import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search, ChevronRight, CheckCircle2, Trophy, X, Filter } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import apiService from '@/lib/apiService';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

type Resource = {
  resourceType: 'pdf' | 'text' | 'html' | 'external';
  resourceUrl?: string;
};

type ContentSource = {
  en?: Resource;
  hi?: Resource;
  resourceType?: 'pdf' | 'text' | 'html' | 'external';
  resourceUrl?: string;
};

type Chapter = {
  _id: string;
  chapterId: string;
  subject: string;
  name: { en: string; hi?: string };
  displayName?: string;
  ncert?: { class?: number; chapterNumber?: number };
  contentSource?: ContentSource | null;
  resolvedContentSource?: Resource | null;
};

type TopicResult = {
  _id: string;
  topicId: string;
  name: { en: string; hi?: string };
  displayName?: string;
  subject: string;
  chapterId: string;
  chapter: {
    chapterId: string;
    name: { en: string; hi?: string };
    displayName?: string;
    ncert?: { class?: number; chapterNumber?: number };
    contentSource?: ContentSource | null;
    resolvedContentSource?: Resource | null;
  } | null;
  ncertReference?: { pageNumber?: number; lineRange?: string } | null;
  contentSource?: ContentSource | null;
  resolvedContentSource?: Resource | null;
  quiz: {
    sourceType: 'topic' | 'chapter';
    available: boolean;
    totalQuestions: number;
    hasTaken: boolean;
    attempts: number;
    bestScore: number;
    lastScore: number;
    lastAttemptAt: string | null;
  };
};

type QuizQuestion = {
  questionId: string;
  question: string;
  options: Array<{ key: string; text: string }>;
  explanation?: string;
};

const NCERTSearch = () => {
  const FILTERS_STORAGE_KEY = 'ncert_search_filters';
  const readStoredFilters = () => {
    try {
      const raw = sessionStorage.getItem(FILTERS_STORAGE_KEY);
      if (!raw) return { selectedClass: '', selectedSubject: '', query: '' };
      const parsed = JSON.parse(raw);
      return {
        selectedClass: parsed.selectedClass || '',
        selectedSubject: parsed.selectedSubject || '',
        query: parsed.query || ''
      };
    } catch {
      return { selectedClass: '', selectedSubject: '', query: '' };
    }
  };
  const initialFilters = readStoredFilters();

  const navigate = useNavigate();
  const { language } = useLanguage();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(initialFilters.selectedClass);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(initialFilters.selectedSubject);
  const [query, setQuery] = useState(initialFilters.query);
  const [topics, setTopics] = useState<TopicResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | null>>({});
  const [quizResult, setQuizResult] = useState<{ percentage: number; bestScore: number; attempts: number } | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  const loadSubjects = async () => {
    const response = await apiService.ncertSearch.getSubjects();
    setSubjects(response.data?.data || []);
  };

  const loadChapters = async (subject: string, ncertClass?: 11 | 12) => {
    const response = await apiService.ncertSearch.getChapters(subject || undefined, language, ncertClass);
    setChapters(response.data?.data || []);
  };

  const searchTopics = async () => {
    setIsSearching(true);
    try {
      const response = await apiService.ncertSearch.getTopics({
        subject: selectedSubject || undefined,
        query: query.trim() || undefined,
        limit: 100,
        lang: language,
        class: selectedClass ? Number(selectedClass) as 11 | 12 : undefined
      });
      setTopics(response.data?.data || []);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  useEffect(() => {
    if (!selectedSubject) { setChapters([]); return; }
    loadChapters(selectedSubject, selectedClass ? Number(selectedClass) as 11 | 12 : undefined);
  }, [selectedSubject, selectedClass, language]);

  useEffect(() => {
    if (selectedSubject || query.trim()) searchTopics();
  }, [language]);

  useEffect(() => {
    if (selectedSubject) searchTopics();
  }, [selectedSubject, selectedClass]);

  useEffect(() => {
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({ selectedClass, selectedSubject, query }));
  }, [selectedClass, selectedSubject, query]);

  useEffect(() => {
    if (!selectedTopic?._id) return;
    try {
      const raw = sessionStorage.getItem('ncert_read_map');
      const readMap = raw ? JSON.parse(raw) : {};
      setReadConfirmed(Boolean(readMap[selectedTopic._id]));
    } catch { setReadConfirmed(false); }
  }, [selectedTopic]);

  const selectedChapter = useMemo(
    () => selectedTopic?.chapter
      ? chapters.find((ch) => ch.chapterId === selectedTopic.chapter?.chapterId) || null
      : null,
    [chapters, selectedTopic]
  );

  const resolveItemContentSource = (item: TopicResult) =>
    item?.resolvedContentSource?.resourceUrl
      ? item.resolvedContentSource
      : item?.chapter?.resolvedContentSource || null;

  const openReader = (item: TopicResult) => {
    const source = resolveItemContentSource(item);
    if (!source?.resourceUrl) return;
    const title = item.displayName || item.name.en || item.chapter?.displayName || item.chapterId;
    navigate(
      `/ncert-reader?url=${encodeURIComponent(source.resourceUrl)}&type=${encodeURIComponent(source.resourceType || 'external')}&title=${encodeURIComponent(title)}&itemKey=${encodeURIComponent(item._id)}`
    );
  };

  const openTopicDetail = (topic: TopicResult) => {
    setSelectedTopic(topic);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    setReadConfirmed(false);
    setShowDetailSheet(true);
  };

  const startTopicQuiz = async () => {
    if (!selectedTopic) return;
    setIsLoadingQuiz(true);
    setQuizResult(null);
    try {
      const response = await apiService.ncertSearch.getTopicQuiz(selectedTopic._id, 10);
      const questions = response.data?.data?.questions || [];
      setQuizQuestions(questions);
      setQuizAnswers({});
      setQuizStartedAt(Date.now());
    } finally { setIsLoadingQuiz(false); }
  };

  const submitTopicQuiz = async () => {
    if (!selectedTopic || quizQuestions.length === 0) return;
    setIsSubmittingQuiz(true);
    try {
      const answers = quizQuestions.map((q) => ({
        questionId: q.questionId,
        selectedOption: quizAnswers[q.questionId] ?? null
      }));
      const response = await apiService.ncertSearch.submitTopicQuiz(selectedTopic._id, {
        questionIds: quizQuestions.map((q) => q.questionId),
        answers,
        timeTaken: quizStartedAt ? Math.floor((Date.now() - quizStartedAt) / 1000) : 0
      });
      const data = response.data?.data;
      setQuizResult({
        percentage: data?.score?.percentage || 0,
        bestScore: data?.analytics?.bestScore || 0,
        attempts: data?.analytics?.attempts || 1
      });
      await searchTopics();
    } finally { setIsSubmittingQuiz(false); }
  };

  const closeDetail = () => {
    setShowDetailSheet(false);
    setSelectedTopic(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    setReadConfirmed(false);
  };

  const selectedContentSource = selectedTopic?.resolvedContentSource?.resourceUrl
    ? selectedTopic.resolvedContentSource
    : selectedTopic?.chapter?.resolvedContentSource || null;
  const selectedPdfEmbedUrl = selectedContentSource?.resourceUrl
    ? `${API_BASE_URL}/api/v1/ncert-search/pdf-proxy?url=${encodeURIComponent(selectedContentSource.resourceUrl)}`
    : '';

  const attemptedCount = topics.filter(t => t.quiz.hasTaken).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground tracking-tight">NCERT Search</h1>
            <p className="text-xs text-muted-foreground">Browse topics & practice quizzes</p>
          </div>
          {topics.length > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {attemptedCount}/{topics.length}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto mt-4 space-y-4">
        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Filters</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-xl border border-border bg-muted/50 text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-10 rounded-xl border border-border bg-muted/50 text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2.5 mt-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTopics()}
                placeholder="Search topic…"
                className="w-full h-10 rounded-xl border border-border bg-muted/50 text-sm pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={searchTopics}
              disabled={isSearching}
              className="h-10 px-5 rounded-xl text-sm font-semibold text-primary-foreground"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {isSearching ? '...' : 'Go'}
            </button>
          </div>
        </motion.div>

        {/* Topics List */}
        <div className="space-y-2.5">
          {isSearching && (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!isSearching && topics.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border p-8 text-center"
            >
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Select a class & subject to browse topics</p>
            </motion.div>
          )}

          {!isSearching && topics.map((topic, i) => {
            const itemSource = resolveItemContentSource(topic);
            return (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 p-3.5">
                  {/* Status icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${topic.quiz.hasTaken
                      ? 'bg-green-50 dark:bg-green-500/10'
                      : 'bg-primary/10'
                    }`}>
                    {topic.quiz.hasTaken
                      ? <CheckCircle2 className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                      : <BookOpen className="w-4.5 h-4.5 text-primary" />
                    }
                  </div>

                  {/* Info */}
                  <button
                    onClick={() => openTopicDetail(topic)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-semibold text-foreground truncate">
                      {topic.displayName || topic.name.en}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {topic.chapter?.displayName || topic.chapter?.name?.en || topic.chapterId}
                    </p>
                    {topic.quiz.hasTaken && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Best {topic.quiz.bestScore}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {topic.quiz.attempts} attempt{topic.quiz.attempts !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {itemSource?.resourceUrl && (
                      <button
                        onClick={() => openReader(topic)}
                        className="px-3 py-1.5 text-xs rounded-lg font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        Read
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Bottom Sheet (mobile) / Side Panel (desktop) */}
      <AnimatePresence>
        {showDetailSheet && selectedTopic && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetail}
              className="fixed inset-0 z-40 bg-black/40"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-card rounded-t-3xl border-t border-border shadow-lg overflow-y-auto md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] md:rounded-t-none md:rounded-l-3xl md:border-l md:border-t-0"
            >
              {/* Handle bar (mobile) */}
              <div className="flex justify-center pt-3 md:hidden">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <h2 className="text-base font-bold text-foreground leading-snug">
                      {selectedTopic.displayName || selectedTopic.name.en}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTopic.chapter?.displayName || selectedTopic.chapter?.name?.en || selectedTopic.chapterId}
                    </p>
                  </div>
                  <button
                    onClick={closeDetail}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    Class {selectedTopic.chapter?.ncert?.class || '—'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                    Ch. {selectedTopic.chapter?.ncert?.chapterNumber || '—'}
                  </span>
                  {selectedTopic.ncertReference?.pageNumber && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      Pg. {selectedTopic.ncertReference.pageNumber}
                    </span>
                  )}
                </div>

                {/* PDF preview */}
                {selectedContentSource?.resourceUrl && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                      <p className="text-xs font-semibold text-foreground">NCERT Source</p>
                      <a
                        href={selectedContentSource.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-medium"
                      >
                        Open ↗
                      </a>
                    </div>
                    {selectedContentSource.resourceType === 'pdf' ? (
                      <iframe src={selectedPdfEmbedUrl} title="PDF" className="w-full h-52 border-t border-border" />
                    ) : selectedContentSource.resourceType === 'html' ? (
                      <iframe src={selectedContentSource.resourceUrl} title="HTML" className="w-full h-52 border-t border-border" />
                    ) : (
                      <a href={selectedContentSource.resourceUrl} target="_blank" rel="noreferrer" className="block px-3 py-2 text-sm text-primary break-all">
                        {selectedContentSource.resourceUrl}
                      </a>
                    )}
                    <button
                      onClick={() => openReader(selectedTopic)}
                      className="w-full py-2.5 text-xs font-semibold text-primary border-t border-border hover:bg-primary/5 transition-colors"
                    >
                      Open Full Screen Reader
                    </button>
                  </div>
                )}

                {/* Mark as read */}
                {!readConfirmed && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3.5">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      📖 Read this topic first, then mark as read to unlock the quiz.
                    </p>
                    <button
                      onClick={() => setReadConfirmed(true)}
                      className="mt-2.5 w-full h-9 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                    >
                      Mark as Read ✓
                    </button>
                  </div>
                )}

                {readConfirmed && !quizQuestions.length && !quizResult && (
                  <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-3">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Marked as read
                    </p>
                  </div>
                )}

                {/* Quiz CTA */}
                {selectedTopic.quiz.available ? (
                  quizQuestions.length === 0 && !quizResult && (
                    <button
                      onClick={startTopicQuiz}
                      disabled={!readConfirmed || isLoadingQuiz}
                      className="w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: readConfirmed ? 'var(--gradient-primary)' : undefined }}
                    >
                      <BookOpen className="w-4 h-4" />
                      {isLoadingQuiz ? 'Loading…' : selectedTopic.quiz.hasTaken ? 'Reattempt Quiz' : 'Take Quiz'}
                    </button>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No quiz available for this topic yet.</p>
                )}

                {/* Quiz Questions */}
                {quizQuestions.length > 0 && !quizResult && (
                  <div className="space-y-3">
                    {quizQuestions.map((q, index) => (
                      <div key={q.questionId} className="rounded-xl border border-border p-3.5 bg-muted/30">
                        <p className="text-sm font-semibold text-foreground leading-snug">
                          {index + 1}. {q.question}
                        </p>
                        <div className="mt-2.5 space-y-1.5">
                          {q.options.map((opt) => {
                            const selected = quizAnswers[q.questionId] === opt.key;
                            return (
                              <button
                                key={`${q.questionId}-${opt.key}`}
                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.questionId]: opt.key }))}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${selected
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : 'border-border bg-card text-foreground hover:border-primary/40'
                                  }`}
                              >
                                <span className="font-semibold mr-1.5">{opt.key}.</span>{opt.text}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={submitTopicQuiz}
                      disabled={isSubmittingQuiz}
                      className="w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-50"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {isSubmittingQuiz ? 'Submitting…' : 'Submit Quiz'}
                    </button>
                  </div>
                )}

                {/* Quiz Result */}
                {quizResult && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center"
                  >
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{quizResult.percentage}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best: {quizResult.bestScore}% · Attempts: {quizResult.attempts}
                    </p>
                    <button
                      onClick={() => { setQuizQuestions([]); setQuizResult(null); }}
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default NCERTSearch;
