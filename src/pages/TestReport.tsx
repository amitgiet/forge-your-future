import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, Clock, Target, AlertCircle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, BarChart3, Timer, Zap, BookOpen, Flag, RotateCcw
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../lib/apiService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import DiagramGallery from '@/components/questions/DiagramGallery';
import type { QuestionMeta } from '@/components/NTATestPlayer';
import {
  AnswerPayload,
  answerPayloadFromAttempt,
  getCorrectOptionIndex,
  normalizeQuestions,
} from '@/lib/questionNormalization';
import { resolveDiagramMediaForQuestions } from '@/lib/questionMedia';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export default function TestReport() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openExplanations, setOpenExplanations] = useState<Record<string, boolean>>({});
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);
  const returnTo: string | null = (location.state as any)?.returnTo ?? null;
  const returnLabel: string = (location.state as any)?.returnLabel ?? 'Back';
  const returnState: Record<string, unknown> | null = (location.state as any)?.returnState ?? null;
  const retryTo: string | null = (location.state as any)?.retryTo ?? null;
  const retryState: Record<string, unknown> | null = (location.state as any)?.retryState ?? null;

  const toggleExplanation = (key: string) => {
    setOpenExplanations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // NTA meta from navigation state (per-question timing, bookmarks, etc.)
  const ntaMeta: QuestionMeta[] | null = (location.state as any)?.meta ?? null;
  const totalTimeTaken: number = (location.state as any)?.timeTaken ?? 0;

  useEffect(() => {
    const attemptData = (location.state as any)?.attemptData;
    if (attemptData) {
      setAttempt(attemptData);
      setLoading(false);
    } else {
      loadReport();
    }
  }, []);

  const loadReport = async () => {
    try {
      const res = await apiService.tests.getAttempt(attemptId!);
      setAttempt(res.data.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Time analytics from NTA meta
  const timeAnalytics = useMemo(() => {
    if (!ntaMeta) return null;
    const times = ntaMeta.map((m) => m.timeSpent);
    const total = times.reduce((a, b) => a + b, 0);
    const avg = total / times.length;
    const fast = times.filter((t) => t < 30).length;
    const medium = times.filter((t) => t >= 30 && t <= 90).length;
    const slow = times.filter((t) => t > 90).length;
    const bookmarked = ntaMeta.filter((m) => m.bookmarked).length;
    const markedReview = ntaMeta.filter(
      (m) => m.state === 'marked-review' || m.state === 'answered-marked'
    ).length;
    const sorted = [...times].sort((a, b) => b - a);
    const slowest5 = sorted.slice(0, 5).map((t, i) => ({
      time: t,
      qIndex: times.indexOf(t),
    }));
    return { total, avg, fast, medium, slow, bookmarked, markedReview, slowest5 };
  }, [ntaMeta]);

  const baseReviewQuestions = useMemo(() => {
    const stateQuestions = Array.isArray((location.state as any)?.questions)
      ? (location.state as any).questions
      : null;

    if (stateQuestions?.length) {
      const alreadyNormalized = Boolean(
        stateQuestions[0] &&
        typeof stateQuestions[0] === 'object' &&
        'questionDiagramRefs' in stateQuestions[0] &&
        'resolvedQuestionDiagrams' in stateQuestions[0]
      );
      return alreadyNormalized ? stateQuestions : normalizeQuestions(stateQuestions);
    }

    const testQuestions = Array.isArray(attempt?.testId?.questions)
      ? attempt.testId.questions
      : Array.isArray(attempt?.test?.questions)
        ? attempt.test.questions
        : Array.isArray(attempt?.questions)
          ? attempt.questions
          : [];
    const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];

    const answerMap = new Map<string, any>();
    answers.forEach((answer: any) => {
      const questionId = String(answer?.questionId?._id || answer?.questionId || '');
      if (questionId) {
        answerMap.set(questionId, answer);
      }
    });

    return normalizeQuestions(testQuestions).map((question: any, idx: number) => {
      const questionId = String(question?._id || question?.id || '');
      const answer = questionId ? answerMap.get(questionId) : null;

      return {
        ...question,
        _id: questionId || String(idx),
        id: questionId || String(idx),
        userAnswer: answerPayloadFromAttempt(question, answer),
        evaluationStatus: answer?.evaluationStatus || null,
        evaluationReason: answer?.evaluationReason || null,
      };
    });
  }, [attempt, location.state]);

  useEffect(() => {
    let active = true;

    const loadReviewQuestions = async () => {
      if (!baseReviewQuestions.length) {
        setReviewQuestions([]);
        return;
      }

      const needsResolution = baseReviewQuestions.some((question: any) => (
        (question.questionDiagramRefs?.length || question.explanationDiagramRefs?.length) &&
        !(question.resolvedQuestionDiagrams?.length || question.resolvedExplanationDiagrams?.length)
      ));

      if (!needsResolution) {
        setReviewQuestions(baseReviewQuestions);
        return;
      }

      const resolved = await resolveDiagramMediaForQuestions(baseReviewQuestions);
      if (active) {
        setReviewQuestions(resolved);
      }
    };

    loadReviewQuestions();

    return () => {
      active = false;
    };
  }, [baseReviewQuestions]);

  const renderAnswerReview = (q: any) => {
    const payload = q.userAnswer as AnswerPayload | null;

    if (q.type === 'mcq') {
      const options = Array.isArray(q.typeData?.options) ? q.typeData.options : [];
      const selectedIdx = payload?.kind === 'mcq' ? payload.selectedOption : null;
      const correctIdx = getCorrectOptionIndex(q);
      const isCorrect = selectedIdx !== null && correctIdx !== null && selectedIdx === correctIdx;
      const isUnattempted = selectedIdx === null;

      return (
        <>
          <div className="space-y-1.5 mb-2">
            {options.map((opt: string, optIdx: number) => {
              const isSelected = selectedIdx === optIdx;
              const isRight = correctIdx === optIdx;
              const rowClass = isRight
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : isSelected && !isRight
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'border-border bg-card';

              return (
                <div key={optIdx} className={`rounded-lg border px-2.5 py-2 text-xs ${rowClass}`}>
                  <span className="font-semibold mr-1">{optionLabels[optIdx]}.</span>
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            <p className="text-muted-foreground">
              Your Answer:{' '}
              <span className={isUnattempted ? 'text-muted-foreground' : isCorrect ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>
                {isUnattempted ? 'Not Attempted' : optionLabels[selectedIdx ?? -1] || 'Invalid'}
              </span>
            </p>
            <p className="text-muted-foreground">
              Correct Answer:{' '}
              <span className="text-emerald-600 font-semibold">
                {correctIdx === null ? 'N/A' : optionLabels[correctIdx] || 'N/A'}
              </span>
            </p>
          </div>
        </>
      );
    }

    if (q.type === 'fillup') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
          <p className="text-muted-foreground">Your Answer: <span className="text-foreground font-semibold">{payload?.kind === 'fillup' && payload.value ? payload.value : 'Not Attempted'}</span></p>
          <p className="text-muted-foreground">Accepted Answer(s): <span className="text-emerald-600 font-semibold">{(q.typeData?.acceptedAnswers || []).join(', ') || 'N/A'}</span></p>
        </div>
      );
    }

    if (q.type === 'match') {
      const pairs = Array.isArray(q.typeData?.pairs) ? q.typeData.pairs : [];
      const userPairs = payload?.kind === 'match' ? payload.pairs : {};
      return (
        <div className="space-y-1.5">
          {pairs.map((pair: any) => {
            const userValue = userPairs?.[pair.id] || '';
            const correct = userValue && userValue === pair.right;
            return (
              <div key={pair.id} className={`rounded-lg border px-2.5 py-2 text-xs ${correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-border bg-card'}`}>
                <div className="font-semibold text-foreground">{pair.left}</div>
                <div className="mt-1 text-muted-foreground">Your match: {userValue || 'Not matched'}</div>
                <div className="text-emerald-600">Correct match: {pair.right}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (q.type === 'order') {
      const items = Array.isArray(q.typeData?.items) ? q.typeData.items : [];
      const orderedIds = payload?.kind === 'order' ? payload.orderedIds : [];
      const currentOrder = orderedIds.length ? orderedIds : items.map((item: any) => item.id);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <p className="font-semibold text-foreground mb-2">Your Order</p>
            <div className="space-y-1">{currentOrder.map((id: string, index: number) => <div key={`${id}-${index}`}>{index + 1}. {items.find((item: any) => item.id === id)?.text || id}</div>)}</div>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="font-semibold text-foreground mb-2">Correct Order</p>
            <div className="space-y-1">{(q.typeData?.correctOrder || []).map((id: string, index: number) => <div key={`${id}-correct-${index}`}>{index + 1}. {items.find((item: any) => item.id === id)?.text || id}</div>)}</div>
          </div>
        </div>
      );
    }

    if (q.type === 'flashcard') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <p className="font-semibold text-foreground mb-2">Front</p>
            <p className="text-foreground/85 whitespace-pre-wrap">{q.typeData?.front || q.question}</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="font-semibold text-foreground mb-2">Back</p>
            <p className="text-foreground/85 whitespace-pre-wrap">{q.typeData?.back || q.explanation}</p>
            <p className="mt-2 text-muted-foreground">Status: {payload?.kind === 'flashcard' && payload.completed ? 'Completed' : 'Viewed'}</p>
          </div>
        </div>
      );
    }

    if (q.type === 'video') {
      const videoUrl = q.videoUrl || q.typeData?.videoUrl;
      return (
        <div className="rounded-lg border border-border bg-card p-2.5 text-xs">
          <p className="font-semibold text-foreground mb-1">Video Question</p>
          <p className="text-muted-foreground">Status: {payload?.kind === 'video' && payload.completed ? 'Completed' : 'Not completed'}</p>
          {videoUrl ? <a href={videoUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold">Open video</a> : null}
        </div>
      );
    }

    return <div className="rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground">Unsupported question data.</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <AlertCircle className="w-12 h-12 text-destructive mb-3" />
        <p className="text-muted-foreground mb-4">Could not load report</p>
        <Button onClick={() => navigate('/app/tests')}>Back to Tests</Button>
      </div>
    );
  }

  const { results, weakAreas, testId } = attempt;
  const scorePercent = results?.percentage ?? 0;
  const scoreColor =
    scorePercent >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : scorePercent >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-destructive';

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              returnTo
                ? navigate(returnTo, returnState ? { state: returnState } : undefined)
                : navigate('/app/tests')
            }
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">Test Report</h1>
            <p className="text-xs text-muted-foreground truncate">{testId?.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* ═══ SCORE CARD ═══ */}
        <motion.div {...anim(0)}>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="bg-primary/5 p-5">
              <div className="text-center mb-4">
                <div className={`text-5xl font-black ${scoreColor}`}>
                  {scorePercent.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {results?.marksObtained ?? 0} / {results?.totalMarks ?? 0} marks
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {results?.rank && (
                  <div className="bg-card rounded-xl p-3 text-center">
                    <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">#{results.rank}</div>
                    <div className="text-[10px] text-muted-foreground">Rank</div>
                  </div>
                )}
                {results?.percentile && (
                  <div className="bg-card rounded-xl p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{results.percentile.toFixed(1)}</div>
                    <div className="text-[10px] text-muted-foreground">Percentile</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ═══ STATS ROW ═══ */}
        <motion.div {...anim(0.1)}>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: CheckCircle, label: 'Correct', value: results?.correct ?? 0, color: 'text-emerald-600' },
              { icon: XCircle, label: 'Wrong', value: results?.incorrect ?? 0, color: 'text-destructive' },
              { icon: AlertCircle, label: 'Skipped', value: results?.skipped ?? 0, color: 'text-amber-500' },
              {
                icon: Clock,
                label: 'Avg Time',
                value: `${Math.round(results?.timeAnalysis?.avgTimePerQuestion ?? 0)}s`,
                color: 'text-primary',
              },
            ].map((stat, i) => (
              <Card key={i} className="p-3 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
          {((results?.partial ?? 0) > 0 || (results?.ungradedQuestions ?? 0) > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(results?.partial ?? 0) > 0 && (
                <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  Partial: {results.partial}
                </Badge>
              )}
              {(results?.ungradedQuestions ?? 0) > 0 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Ungraded Items: {results.ungradedQuestions}
                </Badge>
              )}
              {results?.completionWise && (
                <Badge variant="secondary" className="text-xs">
                  Completed: {(results.completionWise.flashcardCompleted ?? 0) + (results.completionWise.videoCompleted ?? 0)}/
                  {(results.completionWise.flashcardTotal ?? 0) + (results.completionWise.videoTotal ?? 0)}
                </Badge>
              )}
            </div>
          )}
        </motion.div>

        {/* ═══ TIME ANALYTICS (from NTA meta) ═══ */}
        {timeAnalytics && (
          <motion.div {...anim(0.15)}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" />
                  Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Time</span>
                  <span className="font-bold text-foreground">{formatDuration(totalTimeTaken || timeAnalytics.total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Avg per Question</span>
                  <span className="font-bold text-foreground">{Math.round(timeAnalytics.avg)}s</span>
                </div>

                {/* Distribution */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Speed Distribution</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                      <div className="text-sm font-bold text-foreground">{timeAnalytics.fast}</div>
                      <div className="text-[10px] text-muted-foreground">&lt;30s</div>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                      <Clock className="w-3.5 h-3.5 text-amber-600 mx-auto mb-0.5" />
                      <div className="text-sm font-bold text-foreground">{timeAnalytics.medium}</div>
                      <div className="text-[10px] text-muted-foreground">30–90s</div>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-2 text-center">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive mx-auto mb-0.5" />
                      <div className="text-sm font-bold text-foreground">{timeAnalytics.slow}</div>
                      <div className="text-[10px] text-muted-foreground">&gt;90s</div>
                    </div>
                  </div>
                </div>

                {/* Bookmarks & Review */}
                {(timeAnalytics.bookmarked > 0 || timeAnalytics.markedReview > 0) && (
                  <div className="flex gap-3 pt-1">
                    {timeAnalytics.bookmarked > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {timeAnalytics.bookmarked} bookmarked
                      </Badge>
                    )}
                    {timeAnalytics.markedReview > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        🔖 {timeAnalytics.markedReview} marked for review
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ SUBJECT-WISE ═══ */}
        {results?.subjectWise?.length > 0 && (
          <motion.div {...anim(0.2)}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Subject-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.subjectWise.map((subject: any) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{subject.subject}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {subject.correct}/{subject.total} • {subject.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={subject.accuracy}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ WEAK AREAS ═══ */}
        {weakAreas?.length > 0 && (
          <motion.div {...anim(0.25)}>
            <Card className="border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <Target className="w-4 h-4" />
                  Weak Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weakAreas.map((area: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-destructive/5 rounded-xl p-3"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-xs font-semibold text-foreground truncate">{area.chapter}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {area.subject} • {area.questionsWrong} wrong • {area.accuracy.toFixed(0)}%
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] flex-shrink-0"
                      onClick={() =>
                        navigate(
                          `/start-practice?subject=${encodeURIComponent(area.subject || '')}&topic=${encodeURIComponent(area.chapter || '')}`
                        )
                      }
                    >
                      Fix <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ CHAPTER-WISE ═══ */}
        {results?.chapterWise?.length > 0 && (
          <motion.div {...anim(0.3)}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Chapter-wise Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {results.chapterWise.map((ch: any, idx: number) => {
                    const accColor =
                      ch.accuracy >= 80
                        ? 'text-emerald-600'
                        : ch.accuracy >= 50
                          ? 'text-amber-600'
                          : 'text-destructive';
                    return (
                      <div key={idx} className="bg-muted/50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-foreground truncate">{ch.chapter}</p>
                        <p className="text-[10px] text-muted-foreground mb-1">{ch.subject}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {ch.correct}/{ch.total}
                          </span>
                          <span className={`text-xs font-bold ${accColor}`}>{ch.accuracy.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ ACTIONS ═══ */}
        {reviewQuestions.length > 0 && (
          <motion.div {...anim(0.33)}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flag className="w-4 h-4 text-primary" />
                  Answer Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviewQuestions.map((q: any, idx: number) => {
                  const reviewKey = String(q._id || q.id || idx);
                  const isUnattempted = !q.userAnswer;
                  const isCorrect = q.evaluationStatus === 'correct';
                  const hasExplanation = Boolean(String(q.explanation || '').trim()) || Boolean(q.explanationImageUrl) || Boolean(q.resolvedExplanationDiagrams?.length);
                  const isExplanationOpen = Boolean(openExplanations[reviewKey]);

                  return (
                    <div key={q._id || q.id || idx} className="rounded-xl border border-border p-3 bg-muted/30">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs font-semibold text-foreground">Q{idx + 1}. {q.question}</p>
                        <Badge
                          variant="secondary"
                          className={
                            isUnattempted
                              ? 'bg-muted text-muted-foreground'
                              : isCorrect
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : q.evaluationStatus === 'partial'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                  : q.evaluationStatus === 'ungraded'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-destructive/15 text-destructive'
                          }
                        >
                          {isUnattempted
                            ? 'Skipped'
                            : isCorrect
                              ? 'Correct'
                              : q.evaluationStatus === 'partial'
                                ? 'Partial'
                                : q.evaluationStatus === 'ungraded'
                                  ? 'Ungraded'
                                  : 'Wrong'}
                        </Badge>
                      </div>

                      {q.imageUrl ? (
                        <div className="mb-3 rounded-xl overflow-hidden border border-border bg-card">
                          <img src={q.imageUrl} alt={`Question ${idx + 1}`} className="w-full object-contain max-h-60" loading="lazy" />
                        </div>
                      ) : null}

                      <DiagramGallery diagrams={q.resolvedQuestionDiagrams} className="mb-3" />

                      {renderAnswerReview(q)}

                      <div className="mt-2 flex items-start justify-between gap-2">
                        <div className="text-[11px] text-muted-foreground flex-1">
                          {q.evaluationReason || (isUnattempted ? 'Not attempted.' : isCorrect ? 'Correct.' : 'Incorrect.')}
                        </div>
                        {hasExplanation && (
                          <Button variant="outline" size="sm" className="h-7 text-[11px] shrink-0" onClick={() => toggleExplanation(reviewKey)}>
                            {isExplanationOpen ? 'Close Explanation' : 'View Explanation'}
                          </Button>
                        )}
                      </div>

                      {hasExplanation && isExplanationOpen && (
                        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2">
                          <p className="text-[11px] font-semibold text-primary mb-1">Explanation</p>
                          <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">
                            {String(q.explanation)}
                          </p>
                          {q.explanationImageUrl ? (
                            <div className="mt-2 rounded-xl overflow-hidden border border-border bg-card">
                              <img src={q.explanationImageUrl} alt={`Explanation ${idx + 1}`} className="w-full object-contain max-h-60" loading="lazy" />
                            </div>
                          ) : null}
                          <DiagramGallery diagrams={q.resolvedExplanationDiagrams} className="mt-2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div {...anim(0.35)} className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() =>
              returnTo
                ? navigate(returnTo, returnState ? { state: returnState } : undefined)
                : navigate('/app/tests')
            }
          >
            {returnLabel}
          </Button>
          {retryTo && (
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={() => navigate(retryTo, retryState ? { state: retryState } : undefined)}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retake
            </Button>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
