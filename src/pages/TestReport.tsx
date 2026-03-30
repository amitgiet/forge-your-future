import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Target, AlertCircle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, BarChart3, Timer, Zap, BookOpen, Flag, RotateCcw,
  PieChart as PieChartIcon, Gauge, BrainCircuit
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

const optionLabels = ['A', 'B', 'C', 'D'];
const OUTCOME_COLORS = ['#16a34a', '#dc2626', '#f59e0b', '#0ea5e9'];

const scoreTone = (value: number) => {
  if (value >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-destructive';
};

const chapterTone = (accuracy: number) => {
  if (accuracy >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (accuracy >= 60) return 'text-primary';
  if (accuracy >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-destructive';
};

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
  const ntaMeta: QuestionMeta[] | null = (location.state as any)?.meta ?? null;
  const totalTimeTaken: number = (location.state as any)?.timeTaken ?? 0;

  const toggleExplanation = (key: string) => {
    setOpenExplanations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const attemptData = (location.state as any)?.attemptData;
    if (attemptData) {
      setAttempt(attemptData);
      setLoading(false);
      return;
    }

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

    void loadReport();
  }, [attemptId, location.state]);

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
      if (questionId) answerMap.set(questionId, answer);
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
      if (active) setReviewQuestions(resolved);
    };

    void loadReviewQuestions();

    return () => {
      active = false;
    };
  }, [baseReviewQuestions]);

  const analytics = useMemo(() => {
    if (!attempt?.results) return null;

    const results = attempt.results;
    const answerTimeById = new Map<string, number>();
    (attempt.answers || []).forEach((answer: any) => {
      const id = String(answer?.questionId?._id || answer?.questionId || '');
      if (id) answerTimeById.set(id, Number(answer?.timeSpent || 0));
    });

    const questionTimings = reviewQuestions.map((question: any, index: number) => {
      const id = String(question?._id || question?.id || index);
      const timeSpent = Number(ntaMeta?.[index]?.timeSpent ?? answerTimeById.get(id) ?? 0);
      return {
        id,
        label: `Q${index + 1}`,
        question: String(question?.question || ''),
        subject: String(question?.subject || 'General'),
        chapter: String(question?.chapter || question?.topic || 'General'),
        timeSpent,
        isCorrect: question?.evaluationStatus === 'correct',
        isAttempted: Boolean(question?.userAnswer),
      };
    });

    const nonZeroTimes = questionTimings.filter((item) => item.timeSpent > 0);
    const totalTime = Number(totalTimeTaken || results?.timeAnalysis?.totalTime || nonZeroTimes.reduce((sum, item) => sum + item.timeSpent, 0));
    const avgTime = Number(results?.timeAnalysis?.avgTimePerQuestion || (questionTimings.length ? totalTime / questionTimings.length : 0));
    const fastest = nonZeroTimes.length ? [...nonZeroTimes].sort((a, b) => a.timeSpent - b.timeSpent)[0] : null;
    const slowest = nonZeroTimes.length ? [...nonZeroTimes].sort((a, b) => b.timeSpent - a.timeSpent)[0] : null;
    const overTimeQuestions = [...nonZeroTimes]
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .filter((item) => item.timeSpent >= Math.max(avgTime * 1.35, 45))
      .slice(0, 5);

    const subjectTimingMap = new Map<string, { total: number; correct: number; attempted: number; totalTime: number }>();
    questionTimings.forEach((item) => {
      const entry = subjectTimingMap.get(item.subject) || { total: 0, correct: 0, attempted: 0, totalTime: 0 };
      entry.total += 1;
      if (item.isAttempted) entry.attempted += 1;
      if (item.isCorrect) entry.correct += 1;
      entry.totalTime += item.timeSpent;
      subjectTimingMap.set(item.subject, entry);
    });

    const subjectInsights = (results.subjectWise || []).map((subject: any) => {
      const timing = subjectTimingMap.get(String(subject.subject)) || { total: 0, correct: 0, attempted: 0, totalTime: 0 };
      const avgSubjectTime = subject.total > 0 ? timing.totalTime / subject.total : 0;
      const accuracy = Number(subject.accuracy || 0);
      const efficiencyScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(accuracy * Math.min(1.25, avgTime > 0 && avgSubjectTime > 0 ? avgTime / avgSubjectTime : 1))
        )
      );

      return {
        subject: String(subject.subject),
        accuracy,
        correct: Number(subject.correct || 0),
        total: Number(subject.total || 0),
        avgTime: avgSubjectTime,
        efficiencyScore,
      };
    });

    const outcomeChartData = [
      { name: 'Correct', value: Number(results.correct || 0), fill: OUTCOME_COLORS[0] },
      { name: 'Incorrect', value: Number(results.incorrect || 0), fill: OUTCOME_COLORS[1] },
      { name: 'Skipped', value: Number(results.skipped || 0), fill: OUTCOME_COLORS[2] },
      ...(results.partial > 0 ? [{ name: 'Partial', value: Number(results.partial || 0), fill: OUTCOME_COLORS[3] }] : []),
    ].filter((item) => item.value > 0);

    const subjectChartData = subjectInsights.map((item) => ({
      subject: item.subject,
      accuracy: Math.round(item.accuracy),
      avgTime: Math.round(item.avgTime),
      efficiency: item.efficiencyScore,
    }));

    const chapterBreakdown = [...(results.chapterWise || [])]
      .map((chapter: any) => ({
        chapter: String(chapter.chapter || 'General'),
        subject: String(chapter.subject || 'General'),
        accuracy: Number(chapter.accuracy || 0),
        total: Number(chapter.total || 0),
        correct: Number(chapter.correct || 0),
        incorrect: Number(chapter.incorrect || 0),
        partial: Number(chapter.partial || 0),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    const weakTopics = (attempt.weakAreas?.length ? attempt.weakAreas : chapterBreakdown)
      .slice(0, 6)
      .map((item: any) => ({
        chapter: String(item.chapter || 'General'),
        subject: String(item.subject || 'General'),
        accuracy: Number(item.accuracy || 0),
        questionsWrong: Number(item.questionsWrong || item.incorrect || 0),
      }));

    const strongTopics = [...chapterBreakdown]
      .sort((a, b) => b.accuracy - a.accuracy)
      .filter((item) => item.total > 0)
      .slice(0, 6)
      .map((item) => ({
        chapter: item.chapter,
        subject: item.subject,
        accuracy: item.accuracy,
        questionsWrong: item.incorrect,
      }));

    return {
      totalTime,
      avgTime,
      fastest,
      slowest,
      overTimeQuestions,
      subjectInsights,
      outcomeChartData,
      subjectChartData,
      chapterBreakdown,
      weakTopics,
      strongTopics,
      bookmarked: ntaMeta?.filter((item) => item.bookmarked).length || 0,
      markedReview: ntaMeta?.filter((item) => item.state === 'marked-review' || item.state === 'answered-marked').length || 0,
    };
  }, [attempt, ntaMeta, reviewQuestions, totalTimeTaken]);

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

  const { results, testId } = attempt;
  const scorePercent = Number(results?.percentage ?? 0);
  const scoreColor = scoreTone(scorePercent);
  const summaryCards = [
    { icon: Target, label: 'Total Questions', value: results?.totalQuestions ?? 0, tone: 'text-primary' },
    { icon: CheckCircle, label: 'Correct', value: results?.correct ?? 0, tone: 'text-emerald-600' },
    { icon: XCircle, label: 'Incorrect', value: results?.incorrect ?? 0, tone: 'text-destructive' },
    { icon: AlertCircle, label: 'Skipped', value: results?.skipped ?? 0, tone: 'text-amber-500' },
    { icon: Trophy, label: 'Score', value: `${results?.marksObtained ?? 0}/${results?.totalMarks ?? 0}`, tone: scoreColor },
    { icon: Clock, label: 'Time Taken', value: formatDuration(Number(analytics?.totalTime || 0)), tone: 'text-primary' },
  ];

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
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

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        <motion.div {...anim(0)}>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="bg-primary/5 p-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overall Result</p>
                  <div className={`mt-2 text-5xl font-black ${scoreColor}`}>
                    {scorePercent.toFixed(1)}%
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {results?.marksObtained ?? 0} / {results?.totalMarks ?? 0} marks
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {results?.rank && (
                      <Badge variant="secondary" className="bg-card">
                        Rank #{results.rank}
                      </Badge>
                    )}
                    {results?.percentile && (
                      <Badge variant="secondary" className="bg-card">
                        Percentile {results.percentile.toFixed(1)}
                      </Badge>
                    )}
                    {(results?.partial ?? 0) > 0 && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        Partial {results.partial}
                      </Badge>
                    )}
                    {(results?.ungradedQuestions ?? 0) > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Ungraded {results.ungradedQuestions}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {summaryCards.map((stat) => (
                    <div key={stat.label} className="bg-card rounded-xl p-3 text-center border border-border/60">
                      <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.tone}`} />
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {analytics && (
          <motion.div {...anim(0.08)} className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-primary" />
                  Attempt Outcome
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_0.9fr] items-center">
                <ChartContainer
                  config={{
                    Correct: { label: 'Correct', color: OUTCOME_COLORS[0] },
                    Incorrect: { label: 'Incorrect', color: OUTCOME_COLORS[1] },
                    Skipped: { label: 'Skipped', color: OUTCOME_COLORS[2] },
                    Partial: { label: 'Partial', color: OUTCOME_COLORS[3] },
                  }}
                  className="h-[260px] w-full"
                >
                  <PieChart>
                    <Pie data={analytics.outcomeChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                      {analytics.outcomeChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.fill || OUTCOME_COLORS[index % OUTCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>

                <div className="space-y-3">
                  {analytics.outcomeChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                  <div className="rounded-xl border border-border bg-primary/5 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accuracy</p>
                    <p className={`text-2xl font-bold ${scoreColor}`}>{scorePercent.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Subject Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChartContainer
                  config={{
                    accuracy: { label: 'Accuracy %', color: '#2563eb' },
                  }}
                  className="h-[260px] w-full"
                >
                  <BarChart data={analytics.subjectChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} fill="var(--color-accuracy)" />
                  </BarChart>
                </ChartContainer>

                <div className="space-y-2">
                  {analytics.subjectInsights.map((item) => (
                    <div key={item.subject} className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.subject}</p>
                        <Badge variant="secondary">Efficiency {item.efficiencyScore}</Badge>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.correct}/{item.total} correct</span>
                        <span>{Math.round(item.avgTime || 0)}s avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {analytics && (
          <motion.div {...anim(0.14)} className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" />
                  Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[11px] text-muted-foreground">Total Time</p>
                    <p className="text-lg font-bold text-foreground">{formatDuration(analytics.totalTime)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[11px] text-muted-foreground">Avg / Question</p>
                    <p className="text-lg font-bold text-foreground">{Math.round(analytics.avgTime)}s</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[11px] text-muted-foreground">Fastest</p>
                    <p className="text-sm font-bold text-foreground">{analytics.fastest ? `${analytics.fastest.label} • ${formatDuration(analytics.fastest.timeSpent)}` : 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-[11px] text-muted-foreground">Slowest</p>
                    <p className="text-sm font-bold text-foreground">{analytics.slowest ? `${analytics.slowest.label} • ${formatDuration(analytics.slowest.timeSpent)}` : 'N/A'}</p>
                  </div>
                </div>
                {(analytics.bookmarked > 0 || analytics.markedReview > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {analytics.bookmarked > 0 && <Badge variant="secondary">Bookmarked {analytics.bookmarked}</Badge>}
                    {analytics.markedReview > 0 && <Badge variant="secondary">Marked for review {analytics.markedReview}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  Time Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.subjectInsights.map((item) => (
                  <div key={`eff-${item.subject}`} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{item.subject}</p>
                      <span className="text-sm font-bold text-primary">{item.efficiencyScore}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={item.efficiencyScore} className="h-2" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{item.accuracy.toFixed(0)}% accuracy</span>
                      <span>{Math.round(item.avgTime || 0)}s avg</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Over-Time Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.overTimeQuestions.length > 0 ? analytics.overTimeQuestions.map((item) => (
                  <div key={`slow-${item.id}`} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <span className="text-sm font-bold text-destructive">{formatDuration(item.timeSpent)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{item.question}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.subject} • {item.chapter}</p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    No question ran unusually long in this attempt.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {analytics && (
          <motion.div {...anim(0.2)} className="grid gap-4 lg:grid-cols-2">
            <Card className="border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <Target className="w-4 h-4" />
                  Weak Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.weakTopics.length > 0 ? analytics.weakTopics.map((area) => (
                  <div key={`weak-${area.subject}-${area.chapter}`} className="flex items-center justify-between bg-destructive/5 rounded-xl p-3">
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
                )) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    No weak topics were detected in this attempt.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <BrainCircuit className="w-4 h-4" />
                  Strong Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.strongTopics.length > 0 ? analytics.strongTopics.map((area) => (
                  <div key={`strong-${area.subject}-${area.chapter}`} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">{area.chapter}</p>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{area.accuracy.toFixed(0)}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{area.subject}</p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Strong topics will show up after more graded questions.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {analytics?.chapterBreakdown?.length > 0 && (
          <motion.div {...anim(0.24)}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Chapter Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {analytics.chapterBreakdown.map((chapter) => (
                    <div key={`${chapter.subject}-${chapter.chapter}`} className="bg-muted/50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{chapter.chapter}</p>
                          <p className="text-[10px] text-muted-foreground">{chapter.subject}</p>
                        </div>
                        <span className={`text-xs font-bold ${chapterTone(chapter.accuracy)}`}>{chapter.accuracy.toFixed(0)}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={chapter.accuracy} className="h-2" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{chapter.correct}/{chapter.total} correct</span>
                        <span>{chapter.incorrect} wrong</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {reviewQuestions.length > 0 && (
          <motion.div {...anim(0.28)}>
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
                  const timeSpent = Number(
                    ntaMeta?.[idx]?.timeSpent ??
                    attempt?.answers?.find((answer: any) => String(answer?.questionId?._id || answer?.questionId || '') === reviewKey)?.timeSpent ??
                    0
                  );

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

                      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1 border border-border">
                          <Clock className="w-3 h-3" />
                          {formatDuration(timeSpent)}
                        </span>
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

        <motion.div {...anim(0.32)} className="flex gap-3">
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
