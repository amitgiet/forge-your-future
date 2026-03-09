import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Home, RotateCcw, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import { trackQuizAttempt } from '@/lib/quizTracking';
import apiService from '@/lib/apiService';
import NTATestPlayer from '@/components/NTATestPlayer';

type SummaryState = {
  score: number;
  total: number;
  percentage: number;
  subject: string;
  topic: string;
  chapterLabel?: string;
  attemptedAt?: string;
};

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    mode,
    answers = [],
    totalQuestions,
    subject = 'General',
    topic = 'General',
    returnTo,
    returnLabel,
    prefillPrompt,
    retryTo,
    retryState,
    summary,
    curriculumRunId,
    remainingSeconds,
  } = (location.state || {}) as any;

  const [submittedSummary, setSubmittedSummary] = useState<SummaryState | null>(null);
  const [showReview, setShowReview] = useState(false);
  const hasTrackedRef = useRef(false);
  const hasSubmittedRunRef = useRef(false);

  const formatChapterLabel = (raw: string) => {
    const v = String(raw || '').trim();
    if (!v) return 'General';
    const m = v.match(/^([a-z]+)_ai_generated$/i);
    if (m?.[1]) {
      const subj = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      return `AI Generated (${subj})`;
    }
    return v;
  };

  const incomingSummary: SummaryState | null =
    summary && typeof summary === 'object'
      ? {
        score: Number(summary.score || 0),
        total: Number(summary.total || 0),
        percentage: Number(summary.percentage || 0),
        subject: String(summary.subject || subject || 'General'),
        topic: String(summary.topic || topic || 'General'),
        chapterLabel: summary.chapterLabel ? String(summary.chapterLabel) : undefined,
        attemptedAt: summary.attemptedAt ? String(summary.attemptedAt) : undefined,
      }
      : null;

  const summaryState = submittedSummary || incomingSummary;

  const safeTotalQuestions =
    typeof totalQuestions === 'number' && totalQuestions > 0
      ? totalQuestions
      : Array.isArray(answers)
        ? answers.length
        : summaryState?.total || 0;

  const hasAnswerDetails = Array.isArray(answers) && answers.length > 0;
  const localCorrectCount = hasAnswerDetails ? answers?.filter((a: any) => a.correct).length || 0 : 0;

  const correctCount = summaryState ? Number(summaryState.score || 0) : localCorrectCount;
  const percentage = summaryState
    ? Number(summaryState.percentage || 0)
    : (safeTotalQuestions > 0 ? Math.round((localCorrectCount / safeTotalQuestions) * 100) : 0);

  const effectiveSubject = summaryState?.subject || subject;
  const effectiveTopic = summaryState?.topic || topic;
  const effectiveChapterLabel = summaryState?.chapterLabel ? formatChapterLabel(summaryState.chapterLabel) : undefined;

  const rank = Math.floor(Math.random() * 500000) + 1;
  const totalUsers = 2000000;
  const improvement = Math.floor(Math.random() * 50) - 10;

  const chapterStats = hasAnswerDetails
    ? answers?.reduce((acc: any, answer: any) => {
      const chapterKey = formatChapterLabel(answer.chapter);
      if (!acc[chapterKey]) {
        acc[chapterKey] = { correct: 0, total: 0 };
      }
      acc[chapterKey].total += 1;
      if (answer.correct) acc[chapterKey].correct += 1;
      return acc;
    }, {})
    : effectiveChapterLabel
      ? { [effectiveChapterLabel]: { correct: correctCount, total: safeTotalQuestions } }
      : {};

  const weakChapters = Object.entries(chapterStats || {})
    .map(([chapter, stats]: [string, any]) => ({
      chapter: formatChapterLabel(chapter),
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }))
    .filter((c) => c.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  const getMedal = () => {
    if (percentage >= 90) return '??';
    if (percentage >= 75) return '??';
    if (percentage >= 60) return '??';
    return '??';
  };

  useEffect(() => {
    if (!curriculumRunId || hasSubmittedRunRef.current || !hasAnswerDetails) return;

    const submitRun = async () => {
      hasSubmittedRunRef.current = true;
      try {
        const answerIndexes = answers.map((a: any) => (typeof a?.selected === 'number' ? a.selected : null));
        const questionTimes = answers.map((a: any) => Number(a?.timeTaken || 0));
        const elapsedSeconds = questionTimes.reduce((sum: number, t: number) => sum + t, 0);

        const res = await apiService.curriculum.submitRun(curriculumRunId, {
          answers: answerIndexes,
          questionTimes,
          elapsedSeconds,
          remainingSeconds: typeof remainingSeconds === 'number' ? remainingSeconds : null,
        });

        const serverSummary = res.data?.data?.summary;
        if (serverSummary) {
          setSubmittedSummary({
            score: Number(serverSummary.score || 0),
            total: Number(serverSummary.total || 0),
            percentage: Number(serverSummary.percentage || 0),
            subject: String(serverSummary.subject || subject || 'General'),
            topic: String(serverSummary.topic || topic || 'General'),
            chapterLabel: serverSummary.chapterLabel ? String(serverSummary.chapterLabel) : undefined,
            attemptedAt: serverSummary.attemptedAt ? String(serverSummary.attemptedAt) : undefined,
          });
        }
      } catch (error) {
        console.error('Curriculum run submit failed:', error);
      }
    };

    submitRun();
  }, [curriculumRunId, hasAnswerDetails, answers, remainingSeconds, subject, topic]);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    if (!hasAnswerDetails || safeTotalQuestions <= 0) return;

    hasTrackedRef.current = true;

    trackQuizAttempt({
      quizType: mode === 'test' ? 'normal_test' : 'normal_practice',
      totalQuestions: safeTotalQuestions,
      correctAnswers: correctCount,
      timeTaken: answers?.reduce((sum: number, a: any) => sum + (a?.timeTaken || 0), 0) || 0,
      subject: effectiveSubject,
      topic: effectiveTopic,
      metadata: {
        mode,
      },
    }).catch((err) => {
      console.error('Quiz tracking failed:', err);
    });
  }, [mode, safeTotalQuestions, correctCount, answers, effectiveSubject, effectiveTopic, hasAnswerDetails]);

  if (!safeTotalQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="nf-card max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No quiz session found</h2>
          <p className="text-sm text-muted-foreground mb-5">Start a new quiz to see your results here.</p>
          <button onClick={() => navigate('/quiz-start')} className="nf-btn-primary w-full">Start Quiz</button>
        </div>
      </div>
    );
  }

  if (showReview && location.state?.questions) {
    return (
      <NTATestPlayer
        questions={location.state.questions.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer ?? null
        }))}
        title={(effectiveSubject || 'Quiz') + ' Review'}
        duration={location.state.timeTaken || 0}
        onSubmit={() => setShowReview(false)}
        readOnly={true}
        initialMeta={location.state.meta}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-6">
          <div className="text-6xl mb-4">{getMedal()}</div>
          <h1 className="text-3xl font-black text-foreground mb-2">{correctCount}/{safeTotalQuestions}</h1>
          <p className="text-xl font-bold text-primary mb-1">{percentage}% Score</p>
          <p className="text-sm text-muted-foreground">{effectiveSubject} • {effectiveTopic}</p>
          {!hasAnswerDetails && summaryState?.attemptedAt && (
            <p className="text-xs text-muted-foreground mt-1">Last attempt: {new Date(summaryState.attemptedAt).toLocaleString()}</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="nf-card mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-success">{correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-destructive">{safeTotalQuestions - correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-primary">{percentage}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </motion.div>

        {mode === 'test' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="nf-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                <span className="font-bold text-foreground">Your Rank</span>
              </div>
              <span className="text-2xl font-black text-secondary">{(rank / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Out of {(totalUsers / 100000).toFixed(1)}L users</span>
              <div className={`flex items-center gap-1 ${improvement >= 0 ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{improvement >= 0 ? '+' : ''}{improvement}</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="nf-card mb-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chapter Performance
          </h2>
          <div className="space-y-3">
            {Object.entries(chapterStats || {}).map(([chapter, stats]: [string, any]) => {
              const accuracy = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={chapter}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{chapter}</span>
                    <span className={`text-sm font-bold ${accuracy >= 75 ? 'text-success' : accuracy >= 50 ? 'text-warning-foreground' : 'text-destructive'}`}>
                      {accuracy}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${accuracy}%` }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className={`h-full ${accuracy >= 75 ? 'bg-success' : accuracy >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {weakChapters.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="nf-card bg-destructive/10 border-destructive/30 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-destructive" />
              <h2 className="font-bold text-destructive">Weak Areas Detected</h2>
            </div>
            <div className="space-y-2">
              {weakChapters.map((chapter) => (
                <div key={chapter.chapter} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{chapter.chapter}</span>
                  <span className="font-bold text-destructive">{chapter.accuracy}% ?</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (returnTo) {
                  navigate(String(returnTo), {
                    state: {
                      prefillPrompt: String(prefillPrompt || `Give me another quiz on ${effectiveTopic} and focus on my mistakes.`),
                    },
                  });
                  return;
                }
                navigate('/start-practice', { state: { weakness: weakChapters[0] } });
              }}
              className="w-full mt-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Fix Weak Areas
            </button>
          </motion.div>
        )}

        <div className={`grid ${returnTo ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
          {returnTo && (
            <button
              onClick={() =>
                navigate(String(returnTo), {
                  state: { prefillPrompt: String(prefillPrompt || '') },
                })
              }
              className="nf-btn-outline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {String(returnLabel || 'Back')}
            </button>
          )}
          <button
            onClick={() => {
              if (retryTo) {
                navigate(String(retryTo), { state: retryState });
                return;
              }
              navigate('/quiz-start', { state: { subject: effectiveSubject, topic: effectiveTopic } });
            }}
            className="nf-btn-outline flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retry
          </button>
          <button onClick={() => navigate('/dashboard')} className="nf-btn-primary flex items-center justify-center gap-2">
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {location.state?.questions && (
          <button
            onClick={() => setShowReview(true)}
            className="w-full mt-3 py-3 rounded-xl bg-violet-600/10 text-violet-600 font-bold flex items-center justify-center gap-2 hover:bg-violet-600/20 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Review Answers
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
