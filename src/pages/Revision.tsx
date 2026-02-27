import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Brain, Clock, Trophy, Zap, PlusCircle, ChevronDown, ChevronUp, Play, CheckCircle2, X, History, ListChecks } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { generateMicroQuizzes, getMasteryProgress, processLineSession } from '@/store/slices/neuronzSlice';
import { apiService } from '@/lib/apiService';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';
import BottomNav from '@/components/BottomNav';
import { trackQuizAttempt } from '@/lib/quizTracking';

type TopicSummary = {
  topicId: string;
  topic: string;
  subject: string;
  totalTracked: number;
  dueNow: number;
  byLevel: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    L5: number;
    L6: number;
    L7: number;
  };
  masteryPercent: number;
  lastActivityAt: string | null;
};

type DueLine = {
  _id: string;
  lineId: {
    _id: string;
    ncertText: string;
    subject: string;
    chapter: number;
    class?: number;
  };
  level: number;
  nextRevision: string;
  lastReviewed: string;
  isMastered: boolean;
};

type TopicDuePayload = {
  topicId: string;
  topic: string;
  subject: string;
  dueNow: number;
  byLevel: {
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    L5: number;
    L6: number;
    L7: number;
  };
  sessionSize: number;
  lines: DueLine[];
};

type SubmissionResult = {
  topic: string;
  lineText: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  previousLevel: number;
  newLevel: number;
  levelAdvanced: boolean;
  nextRevision?: string;
  review: Array<{
    question: string;
    options: string[];
    selectedAnswer: number | null;
    correctAnswer: number;
    explanation?: string;
  }>;
};

type LineAnalytics = {
  topic: string;
  currentLevel: number;
  overallAccuracy: number;
  recentAccuracy: number;
  totalSessions: number;
  currentStreak: number;
  accuracyTrend: Array<{
    sessionNumber: number;
    date: string;
    accuracy: number;
    level: number;
  }>;
};

type TopicHistoryEntry = {
  lineId: string;
  lineText: string;
  subject: string;
  chapter: number | null;
  sessionDate: string;
  quizzesAttempted: number;
  correctAnswers: number;
  accuracy: number;
  levelAfter: number;
  timeSpent: number;
  isAdjustment: boolean;
  review?: Array<{
    question: string;
    options: string[];
    selectedAnswer: number | null;
    correctAnswer: number;
    explanation?: string;
  }>;
};

const LEVEL_COLORS = [
  '',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
];

const getLineContentId = (line: DueLine): string => {
  if (line?.lineId?._id) return line.lineId._id;
  return '';
};

const Revision = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { masteryProgress } = useAppSelector((state) => state.neuronz);

  const [topicSummary, setTopicSummary] = useState<TopicSummary[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);
  const [topicDueMap, setTopicDueMap] = useState<Record<string, TopicDuePayload>>({});

  const [selectedLine, setSelectedLine] = useState<DueLine | null>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [generatingQuizzes, setGeneratingQuizzes] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<SubmissionResult | null>(null);
  const [showSubmissionReview, setShowSubmissionReview] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ line: DueLine; analytics: LineAnalytics | null } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [topicHistoryModal, setTopicHistoryModal] = useState<{ topicName: string; entries: TopicHistoryEntry[] } | null>(null);
  const [topicHistoryLoading, setTopicHistoryLoading] = useState(false);
  const [selectedTopicHistoryEntry, setSelectedTopicHistoryEntry] = useState<TopicHistoryEntry | null>(null);

  const hasAutoStarted = useRef(false);

  const dueCount = useMemo(
    () => topicSummary.reduce((sum, topic) => sum + topic.dueNow, 0),
    [topicSummary]
  );

  const loadTopicSummary = async () => {
    setIsLoadingTopics(true);
    try {
      const response = await apiService.neuronz.getTopicSummary();
      setTopicSummary(response.data?.data?.topics || []);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const loadTopicDue = async (topicId: string, sessionSize = 6) => {
    setLoadingTopicId(topicId);
    try {
      const response = await apiService.neuronz.getTopicDueLines(topicId, sessionSize);
      const payload: TopicDuePayload = response.data?.data;
      setTopicDueMap((prev) => ({ ...prev, [topicId]: payload }));
      return payload;
    } finally {
      setLoadingTopicId(null);
    }
  };

  useEffect(() => {
    void loadTopicSummary();
    void dispatch(getMasteryProgress());
  }, [dispatch]);

  useEffect(() => {
    const autoStart = searchParams.get('autoStart') === '1';
    if (!autoStart || hasAutoStarted.current || topicSummary.length === 0) return;

    const firstTopic = topicSummary.find((topic) => topic.dueNow > 0) || topicSummary[0];
    if (!firstTopic) return;

    hasAutoStarted.current = true;
    setExpandedTopicId(firstTopic.topicId);
    void loadTopicDue(firstTopic.topicId, 6).then((payload) => {
      const firstLine = payload?.lines?.[0];
      if (firstLine) {
        void startLineSession(firstLine);
      }
    });
  }, [searchParams, topicSummary]);

  const startLineSession = async (line: DueLine) => {
    const lineContentId = getLineContentId(line);
    if (!lineContentId) {
      alert('Unable to start revision for this line. Missing line ID.');
      return;
    }

    setSelectedLine(line);
    setGeneratingQuizzes(true);

    try {
      const result = await dispatch(generateMicroQuizzes(lineContentId)).unwrap();
      const transformed: QuizQuestion[] = result.map((quiz: any) => ({
        id: quiz._id || Math.random().toString(),
        question: quiz.question,
        type: 'mcq' as const,
        options: quiz.options,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation
      }));
      setQuizzes(transformed);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setSelectedLine(null);
    } finally {
      setGeneratingQuizzes(false);
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    if (!selectedLine) return;
    const lineContentId = getLineContentId(selectedLine);
    if (!lineContentId) {
      alert('Unable to submit revision. Missing line ID.');
      return;
    }

    const correctCount = data.answers.filter((ans, idx) => ans !== null && ans === quizzes[idx].correctAnswer).length;

    // Build review data first
    const review = quizzes.map((quiz, idx) => {
      const rawAnswer = data.answers[idx];
      const selectedAnswer = typeof rawAnswer === 'number' ? rawAnswer : null;
      return {
        question: quiz.question,
        options: Array.isArray(quiz.options) ? quiz.options.map((opt) => String(opt)) : [],
        selectedAnswer,
        correctAnswer: Number(quiz.correctAnswer),
        explanation: quiz.explanation
      };
    });

    try {
      const result = await dispatch(processLineSession({
        lineId: lineContentId,
        correctAnswers: correctCount,
        totalQuizzes: quizzes.length,
        timeSpent: data.timeTaken,
        review // Pass review data to backend
      })).unwrap();

      if (result?.limitReached) {
        alert(result.message || 'Daily limit reached for today.');
      }

      const payload = result?.data || result;

      setLastSubmission({
        topic: expandedTopicId || 'topic',
        lineText: selectedLine.lineId?.ncertText || 'NCERT Line',
        correctAnswers: correctCount,
        totalQuestions: quizzes.length,
        accuracy: Math.round((correctCount / Math.max(1, quizzes.length)) * 100),
        previousLevel: selectedLine.level,
        newLevel: Number(payload?.newLevel || selectedLine.level),
        levelAdvanced: Boolean(payload?.levelAdvanced),
        nextRevision: payload?.nextRevision,
        review
      });

      void trackQuizAttempt({
        quizType: 'neuronz',
        totalQuestions: quizzes.length,
        correctAnswers: correctCount,
        timeTaken: data.timeTaken,
        subject: selectedLine.lineId?.subject || 'General',
        topic: selectedLine.lineId?.ncertText || 'NCERT Line',
        lineId: lineContentId,
        metadata: { level: selectedLine.level }
      });

      setSelectedLine(null);
      setQuizzes([]);

      await Promise.all([
        loadTopicSummary(),
        dispatch(getMasteryProgress())
      ]);

      if (expandedTopicId) {
        await loadTopicDue(expandedTopicId, 6);
      }
    } catch (error) {
      console.error('Failed to submit session:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const toggleTopic = async (topicId: string) => {
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
      return;
    }

    setExpandedTopicId(topicId);
    if (!topicDueMap[topicId]) {
      await loadTopicDue(topicId, 6);
    }
  };

  const openSubmissionHistory = async (line: DueLine) => {
    const lineContentId = getLineContentId(line);
    if (!lineContentId) {
      alert('Unable to load history. Missing line ID.');
      return;
    }

    setHistoryLoading(true);
    setHistoryModal({ line, analytics: null });
    try {
      const response = await apiService.neuronz.getLineAnalytics(lineContentId);
      setHistoryModal({
        line,
        analytics: response.data?.data || null
      });
    } catch (error) {
      console.error('Failed to load line history:', error);
      setHistoryModal({ line, analytics: null });
    } finally {
      setHistoryLoading(false);
    }
  };

  const openTopicSubmissionHistory = async (topicId: string, topicName: string) => {
    setTopicHistoryLoading(true);
    setTopicHistoryModal({ topicName, entries: [] });
    try {
      const response = await apiService.neuronz.getTopicSubmissionHistory(topicId, 20);
      const entries = response.data?.data?.entries || [];
      setTopicHistoryModal({ topicName, entries });
    } catch (error) {
      console.error('Failed to load topic submission history:', error);
      setTopicHistoryModal({ topicName, entries: [] });
    } finally {
      setTopicHistoryLoading(false);
    }
  };

  if (selectedLine && quizzes.length > 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <motion.button
            onClick={() => setSelectedLine(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="mb-4 p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">NCERT Line:</p>
            <p className="text-sm font-medium text-foreground">{selectedLine.lineId?.ncertText}</p>
          </div>
        </div>

        <QuizPlayer
          questions={quizzes}
          title={`Revision Quiz - Level ${selectedLine.level}`}
          onSubmit={handleQuizSubmit}
          showPalette={true}
          showTimer={false}
          allowReviewMarking={false}
          config={{
            showExplanations: true,
            showDifficulty: false,
            showMarks: false
          }}
        />

        <BottomNav />
      </div>
    );
  }

  if (generatingQuizzes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating micro-quizzes...</p>
          <p className="text-xs text-muted-foreground mt-2">This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                NEURONZ
              </h1>
              <p className="text-xs text-muted-foreground">Spaced Revision</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            <span className="font-bold text-foreground">{dueCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="nf-card-glass p-3 text-center col-span-1">
            <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{dueCount}</p>
            <p className="text-[10px] text-muted-foreground">Due</p>
          </div>

          <div className="nf-card-glass p-3 text-center col-span-1">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{masteryProgress?.masteredLines || 0}</p>
            <p className="text-[10px] text-muted-foreground">Mastered</p>
          </div>

          <div className="nf-card-glass p-3 text-center col-span-1">
            <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">L{masteryProgress?.averageLevel?.toFixed(1) || '1.0'}</p>
            <p className="text-[10px] text-muted-foreground">Avg Lvl</p>
          </div>

          <button
            onClick={() => navigate('/start-practice')}
            className="nf-card-glass p-3 text-center bg-primary/10 hover:bg-primary/20 transition-colors col-span-1 flex flex-col justify-center items-center"
          >
            <PlusCircle className="w-5 h-5 text-primary mb-1" />
            <p className="text-sm font-bold text-primary">Track Topic</p>
          </button>
        </div>

        {isLoadingTopics ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading topic revision cards...</p>
          </div>
        ) : topicSummary.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-success/20 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No mapped content yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              No mapped NCERT lines/questions yet for your tracked topics. Ask admin/content team to map topic content.
            </p>
            <button onClick={() => navigate('/start-practice')} className="nf-btn-primary !w-auto px-8">
              Track Topic
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {lastSubmission && (
              <div className="nf-card border border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Revision Submitted</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{lastSubmission.lineText}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLastSubmission(null)}
                    className="p-1 rounded hover:bg-muted"
                    aria-label="Dismiss result"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Score</p>
                    <p className="text-sm font-bold text-foreground">
                      {lastSubmission.correctAnswers}/{lastSubmission.totalQuestions}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Accuracy</p>
                    <p className="text-sm font-bold text-foreground">{lastSubmission.accuracy}%</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground">Level</p>
                    <p className="text-sm font-bold text-foreground">L{lastSubmission.previousLevel} to L{lastSubmission.newLevel}</p>
                  </div>
                </div>
                {lastSubmission.nextRevision ? (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Next review: {new Date(lastSubmission.nextRevision).toLocaleString()}
                  </p>
                ) : null}
                <div className="mt-3">
                  <button
                    onClick={() => setShowSubmissionReview(true)}
                    className="nf-btn-outline !w-auto h-8 px-3 text-xs"
                  >
                    <ListChecks className="w-3 h-3 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            )}
            <p className="text-sm font-semibold text-foreground">Choose topic to revise</p>

            {topicSummary.map((topic) => {
              const isExpanded = expandedTopicId === topic.topicId;
              const duePayload = topicDueMap[topic.topicId];
              const dueLines = duePayload?.lines || [];

              return (
                <motion.div key={topic.topicId} className="nf-card w-full">
                  <button
                    onClick={() => void toggleTopic(topic.topicId)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{topic.topic}</p>
                        <p className="text-xs text-muted-foreground capitalize">{topic.subject}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Due</p>
                        <p className="text-sm font-bold text-foreground">{topic.dueNow}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Tracked</p>
                        <p className="text-sm font-bold text-foreground">{topic.totalTracked}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p className="text-[10px] text-muted-foreground">Mastery</p>
                        <p className="text-sm font-bold text-foreground">{topic.masteryPercent}%</p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 border-t border-border pt-3">
                      <div className="mb-3">
                        <button
                          onClick={() => void openTopicSubmissionHistory(topic.topicId, topic.topic)}
                          className="nf-btn-outline !w-auto h-8 px-3 text-xs"
                        >
                          <History className="w-3 h-3 mr-1" />
                          View Past Submissions
                        </button>
                      </div>
                      {loadingTopicId === topic.topicId ? (
                        <p className="text-xs text-muted-foreground">Loading due lines...</p>
                      ) : dueLines.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No due lines in this topic right now.</p>
                      ) : (
                        <div className="space-y-2">
                          {dueLines.map((line) => (
                            <div key={line._id} className="rounded-lg border border-border p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full border font-bold ${LEVEL_COLORS[line.level]}`}>
                                    L{line.level}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Chapter {line.lineId?.chapter || '-'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* <button
                                    onClick={() => void openSubmissionHistory(line)}
                                    className="nf-btn-outline !w-auto h-8 px-3 text-xs"
                                  >
                                    <History className="w-3 h-3 mr-1" />
                                    History
                                  </button> */}
                                  <button
                                    onClick={() => void startLineSession(line)}
                                    className="nf-btn-primary !w-auto h-8 px-3 text-xs"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Start
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-foreground mt-2 line-clamp-2">
                                {line.lineId?.ncertText || 'NCERT line'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {historyModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-3"
          onClick={() => setHistoryModal(null)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-xl p-4 max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Past Submissions</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {historyModal.line.lineId?.ncertText || 'NCERT line'}
                </p>
              </div>
              <button className="p-1 rounded hover:bg-muted" onClick={() => setHistoryModal(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {historyLoading ? (
              <p className="text-sm text-muted-foreground">Loading submission history...</p>
            ) : historyModal.analytics ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Sessions</p>
                    <p className="text-sm font-bold text-foreground">{historyModal.analytics.totalSessions}</p>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Overall</p>
                    <p className="text-sm font-bold text-foreground">{historyModal.analytics.overallAccuracy}%</p>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Current</p>
                    <p className="text-sm font-bold text-foreground">L{historyModal.analytics.currentLevel}</p>
                  </div>
                </div>

                {historyModal.analytics.accuracyTrend?.length ? (
                  <div className="space-y-2">
                    {historyModal.analytics.accuracyTrend
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={`${entry.sessionNumber}-${entry.date}`} className="rounded-md border border-border p-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">Session {entry.sessionNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString()}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Accuracy: <span className="text-foreground font-semibold">{entry.accuracy}%</span> | Level after: <span className="text-foreground font-semibold">L{entry.level}</span>
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No previous submissions found for this line.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No submission history available yet.</p>
            )}
          </div>
        </div>
      )}

      {topicHistoryModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-3"
          onClick={() => setTopicHistoryModal(null)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-xl p-4 max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Past Submissions</p>
                <p className="text-xs text-muted-foreground">{topicHistoryModal.topicName}</p>
              </div>
              <button className="p-1 rounded hover:bg-muted" onClick={() => setTopicHistoryModal(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {topicHistoryLoading ? (
              <p className="text-sm text-muted-foreground">Loading submission history...</p>
            ) : topicHistoryModal.entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past submissions found for this topic yet.</p>
            ) : (
              <div className="space-y-2">
                {topicHistoryModal.entries.map((entry, idx) => (
                  <div key={`${entry.lineId}-${entry.sessionDate}-${idx}`} className="rounded-md border border-border bg-card p-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-2">{entry.lineText}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.sessionDate).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Score: <span className="text-foreground font-semibold">{entry.correctAnswers}/{entry.quizzesAttempted}</span> | Accuracy: <span className="text-foreground font-semibold">{entry.accuracy}%</span> | Level after: <span className="text-foreground font-semibold">L{entry.levelAfter}</span>
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => setSelectedTopicHistoryEntry(entry)}
                        className="nf-btn-outline !w-auto h-7 px-3 text-xs"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTopicHistoryEntry && (
        <div
          className="fixed inset-0 bg-black/50 z-[75] flex items-center justify-center p-3"
          onClick={() => setSelectedTopicHistoryEntry(null)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border rounded-xl p-4 max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Submission Details</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{selectedTopicHistoryEntry.lineText}</p>
              </div>
              <button className="p-1 rounded hover:bg-muted" onClick={() => setSelectedTopicHistoryEntry(null)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Score</p>
                <p className="text-sm font-bold text-foreground">{selectedTopicHistoryEntry.correctAnswers}/{selectedTopicHistoryEntry.quizzesAttempted}</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Accuracy</p>
                <p className="text-sm font-bold text-foreground">{selectedTopicHistoryEntry.accuracy}%</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Level</p>
                <p className="text-sm font-bold text-foreground">L{selectedTopicHistoryEntry.levelAfter}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold mb-3 text-foreground">Your Answers & Correct Answers</h3>

            {selectedTopicHistoryEntry.review && selectedTopicHistoryEntry.review.length > 0 ? (
              <div className="space-y-3">
                {selectedTopicHistoryEntry.review.map((item, idx) => (
                  <div key={`${idx}-${item.question}`} className="mb-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="font-bold text-foreground mb-2">Q{idx + 1}: {item.question}</div>
                    <div className="flex flex-col gap-1">
                      {item.options.map((opt, optIdx) => {
                        const isCorrect = item.correctAnswer === optIdx;
                        const isUserSelected = item.selectedAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded text-sm transition-all ${
                              isCorrect
                                ? 'bg-success/20 text-success font-bold border border-success/50'
                                : isUserSelected
                                  ? 'bg-destructive/10 text-destructive border border-destructive/50'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              <div className="flex gap-1 text-xs">
                                {isCorrect && <span className="font-bold">✓ Correct</span>}
                                {isUserSelected && !isCorrect && <span className="text-destructive">← Your Answer</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {item.explanation && (
                      <div className="mt-2 p-2 rounded bg-muted/30 border-l-2 border-primary">
                        <p className="text-xs text-muted-foreground"><span className="font-bold">Explanation:</span> {item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No detailed quiz data available for this submission.</p>
            )}
          </div>
        </div>
      )}

      {showSubmissionReview && lastSubmission && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-3"
          onClick={() => setShowSubmissionReview(false)}
        >
          <div
            className="w-full max-w-2xl bg-card border border-border rounded-xl p-4 max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Submitted Quiz Details</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{lastSubmission.lineText}</p>
              </div>
              <button className="p-1 rounded hover:bg-muted" onClick={() => setShowSubmissionReview(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Score</p>
                <p className="text-sm font-bold text-foreground">
                  {lastSubmission.correctAnswers}/{lastSubmission.totalQuestions}
                </p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Accuracy</p>
                <p className="text-sm font-bold text-foreground">{lastSubmission.accuracy}%</p>
              </div>
              <div className="rounded-md bg-muted p-2">
                <p className="text-[10px] text-muted-foreground">Level</p>
                <p className="text-sm font-bold text-foreground">L{lastSubmission.previousLevel} to L{lastSubmission.newLevel}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold mb-3 text-foreground">Your Answers & Correct Answers</h3>

            <div className="space-y-3">
              {lastSubmission.review.map((item, idx) => (
                <div key={`${idx}-${item.question}`} className="mb-3 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="font-bold text-foreground mb-2">Q{idx + 1}: {item.question}</div>
                  <div className="flex flex-col gap-1">
                    {item.options.map((opt, optIdx) => {
                      const isCorrect = item.correctAnswer === optIdx;
                      const isUserSelected = item.selectedAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-2 rounded text-sm transition-all ${
                            isCorrect
                              ? 'bg-success/20 text-success font-bold border border-success/50'
                              : isUserSelected
                                ? 'bg-destructive/10 text-destructive border border-destructive/50'
                                : 'text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            <div className="flex gap-1 text-xs">
                              {isCorrect && <span className="font-bold">✓ Correct</span>}
                              {isUserSelected && !isCorrect && <span className="text-destructive">← Your Answer</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {item.explanation && (
                    <div className="mt-2 p-2 rounded bg-muted/30 border-l-2 border-primary">
                      <p className="text-xs text-muted-foreground"><span className="font-bold">Explanation:</span> {item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Revision;
