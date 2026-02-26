import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
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

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }
    loadChapters(selectedSubject, selectedClass ? Number(selectedClass) as 11 | 12 : undefined);
  }, [selectedSubject, selectedClass, language]);

  useEffect(() => {
    if (selectedSubject || query.trim()) {
      searchTopics();
    }
  }, [language]);

  useEffect(() => {
    if (selectedSubject) {
      searchTopics();
    }
  }, [selectedSubject, selectedClass]);

  useEffect(() => {
    sessionStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify({
        selectedClass,
        selectedSubject,
        query
      })
    );
  }, [selectedClass, selectedSubject, query]);

  useEffect(() => {
    if (!selectedTopic?._id) return;
    try {
      const raw = sessionStorage.getItem('ncert_read_map');
      const readMap = raw ? JSON.parse(raw) : {};
      setReadConfirmed(Boolean(readMap[selectedTopic._id]));
    } catch {
      setReadConfirmed(false);
    }
  }, [selectedTopic]);

  const selectedChapter = useMemo(
    () => selectedTopic?.chapter
      ? chapters.find((ch) => ch.chapterId === selectedTopic.chapter?.chapterId) || null
      : null,
    [chapters, selectedTopic]
  );

  const selectedContentSource = selectedTopic?.resolvedContentSource?.resourceUrl
    ? selectedTopic.resolvedContentSource
    : selectedTopic?.chapter?.resolvedContentSource || null;
  const selectedPdfEmbedUrl = selectedContentSource?.resourceUrl
    ? `${API_BASE_URL}/api/v1/ncert-search/pdf-proxy?url=${encodeURIComponent(selectedContentSource.resourceUrl)}`
    : '';
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
    } finally {
      setIsLoadingQuiz(false);
    }
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
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const clearPreview = () => {
    setSelectedTopic(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    setReadConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="nf-heading text-xl text-foreground">NCERT Search</h1>
            <p className="text-xs text-muted-foreground">Subject -&gt; Chapter -&gt; Topic -&gt; Quiz</p>
          </div>
        </motion.div>

        <div className="nf-card mb-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
              }}
              className="h-11 rounded-lg border border-border bg-background text-foreground px-3"
            >
              <option value="" className="bg-background text-foreground" style={{ color: '#111827', backgroundColor: '#ffffff' }}>All classes</option>
              <option value="11" className="bg-background text-foreground" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Class 11</option>
              <option value="12" className="bg-background text-foreground" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Class 12</option>
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-11 rounded-lg border border-border bg-background text-foreground px-3"
            >
              <option value="" className="bg-background text-foreground" style={{ color: '#111827', backgroundColor: '#ffffff' }}>All subjects</option>
              {subjects.map((subject) => (
                <option
                  key={subject}
                  value={subject}
                  className="bg-background text-foreground"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTopics()}
              placeholder="Search topic name"
              className="h-11 rounded-lg border border-border bg-background px-3"
            />
            <button onClick={searchTopics} className="nf-btn-primary h-11">
              <Search className="w-4 h-4 mr-1" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="nf-card">
            <h2 className="nf-heading text-base mb-3">Chapters / Topics</h2>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {topics.length === 0 && <p className="text-sm text-muted-foreground">Select class and subject to load chapters.</p>}
              {topics.map((topic) => {
                const itemSource = resolveItemContentSource(topic);
                const isActive = selectedTopic?._id === topic._id;
                const itemPdfEmbedUrl = itemSource?.resourceUrl
                  ? `${API_BASE_URL}/api/v1/ncert-search/pdf-proxy?url=${encodeURIComponent(itemSource.resourceUrl)}`
                  : '';
                return (
                  <div
                    key={topic._id}
                    className={`w-full rounded-lg border p-3 transition ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTopic(topic);
                          setQuizQuestions([]);
                          setQuizAnswers({});
                          setQuizResult(null);
                          setReadConfirmed(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="font-semibold text-foreground">{topic.displayName || topic.name.en}</p>
                        {/* <p className="text-xs text-muted-foreground">{topic.chapter?.displayName || topic.chapter?.name?.en || topic.chapterId}</p> */}
                        <p className="text-xs text-muted-foreground mt-1">
                          {topic.quiz.hasTaken ? `Best ${topic.quiz.bestScore}% | Attempts ${topic.quiz.attempts}` : 'Not attempted yet'}
                        </p>
                      </button>
                      <button
                        onClick={() => openReader(topic)}
                        disabled={!itemSource?.resourceUrl}
                        className="self-center px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Read
                      </button>
                    </div>
                    {isActive ? (
                      <div className="mt-2">
                        <button
                          onClick={clearPreview}
                          className="mb-2 px-2 py-1 text-xs rounded-md border border-border text-foreground hover:border-primary"
                        >
                          Close Preview
                        </button>
                        {itemSource?.resourceUrl ? (
                          <div className="rounded-md overflow-hidden border border-border bg-background">
                            {itemSource.resourceType === 'pdf' ? (
                              <iframe
                                src={itemPdfEmbedUrl}
                                title={`Inline preview ${topic._id}`}
                                className="w-full h-52"
                              />
                            ) : (
                              <iframe
                                src={itemSource.resourceUrl}
                                title={`Inline preview ${topic._id}`}
                                className="w-full h-52"
                              />
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block nf-card">
            {!selectedTopic && <p className="text-sm text-muted-foreground">Select a topic to read and start quiz.</p>}
            {selectedTopic && (
              <>
                <h2 className="nf-heading text-base">{selectedTopic.displayName || selectedTopic.name.en}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTopic.chapter?.displayName || selectedTopic.chapter?.name?.en || selectedTopic.chapterId}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Class {selectedTopic.chapter?.ncert?.class || '-'} | Chapter {selectedTopic.chapter?.ncert?.chapterNumber || '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Page {selectedTopic.ncertReference?.pageNumber || '-'} | Lines {selectedTopic.ncertReference?.lineRange || '-'}
                </p>

                {selectedContentSource?.resourceUrl ? (
                  <div className="mt-3 rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">NCERT Source</p>
                      <a
                        href={selectedContentSource.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open in new tab
                      </a>
                    </div>
                    {selectedContentSource.resourceType === 'pdf' ? (
                      <iframe
                        src={selectedPdfEmbedUrl}
                        title="NCERT Source PDF Viewer"
                        className="w-full h-72 rounded-md border border-border"
                      />
                    ) : selectedContentSource.resourceType === 'html' ? (
                      <iframe
                        src={selectedContentSource.resourceUrl}
                        title="NCERT Source"
                        className="w-full h-72 rounded-md border border-border"
                      />
                    ) : (
                      <a
                        href={selectedContentSource.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {selectedContentSource.resourceUrl}
                      </a>
                    )}
                    <button
                      onClick={() => openReader(selectedTopic)}
                      className="mt-3 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground font-semibold"
                    >
                      Read Full Screen
                    </button>
                  </div>
                ) : null}

                <div className="mt-3 rounded-lg border border-border p-3 bg-muted/20">
                  <p className="text-sm text-foreground">
                    Read this topic first. After reading, start the associated quiz to mark it as taken.
                  </p>
                  <button onClick={() => setReadConfirmed(true)} className="nf-btn-outline mt-3">
                    Mark as Read
                  </button>
                </div>

                {selectedTopic.quiz.available ? (
                  <button onClick={startTopicQuiz} disabled={!readConfirmed || isLoadingQuiz} className="nf-btn-primary mt-3 w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {selectedTopic.quiz.hasTaken ? 'Reattempt Quiz' : 'Take Quiz'}
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground mt-3">No quiz questions mapped for this topic/chapter yet.</p>
                )}

                {quizQuestions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {quizQuestions.map((q, index) => (
                      <div key={q.questionId} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-semibold text-foreground">{index + 1}. {q.question}</p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt) => (
                            <label key={`${q.questionId}-${opt.key}`} className="flex items-center gap-2 text-sm text-foreground">
                              <input
                                type="radio"
                                name={q.questionId}
                                checked={quizAnswers[q.questionId] === opt.key}
                                onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.questionId]: opt.key }))}
                              />
                              <span>{opt.key}. {opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button onClick={submitTopicQuiz} disabled={isSubmittingQuiz} className="nf-btn-primary w-full">
                      {isSubmittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  </div>
                )}

                {quizResult && (
                  <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-3">
                    <p className="font-semibold text-foreground">Score: {quizResult.percentage}%</p>
                    <p className="text-sm text-muted-foreground">Best Score: {quizResult.bestScore}%</p>
                    <p className="text-sm text-muted-foreground">Attempts: {quizResult.attempts}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selectedChapter && (
          <p className="text-xs text-muted-foreground mt-3">
            Filtered chapter: {selectedChapter.displayName || selectedChapter.name.en}
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default NCERTSearch;
