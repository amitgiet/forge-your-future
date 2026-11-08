import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Target, AlertCircle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, BarChart3, Timer, Zap, BookOpen, Flag, RotateCcw,
  PieChart as PieChartIcon, Gauge, BrainCircuit, Filter
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
import DiagramLightboxViewer from '@/components/questions/DiagramLightboxViewer';
import MathMarkdown from '@/components/MathMarkdown';
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

const DEFAULT_AR_OPTIONS = [
  'Both (A) and (R) are true and (R) is the correct explanation of (A)',
  'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)',
  '(A) is true but (R) is false',
  'Both (A) and (R) are false',
];

const DEFAULT_STMT_OPTIONS = [
  'Both Statement I and Statement II are correct',
  'Both Statement I and Statement II are incorrect',
  'Statement I is correct but Statement II is incorrect',
  'Statement I is incorrect but Statement II is correct',
];

const getAnswerIndex = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (Number.isFinite(value) && value >= 0) return Math.floor(value);
    return null;
  }
  if (typeof value === 'string') {
    const v = value.trim().toUpperCase();
    if (/^[A-D]$/.test(v)) return v.charCodeAt(0) - 65;
    const num = Number(v);
    if (Number.isFinite(num) && num >= 0) return Math.floor(num);
    return null;
  }
  return null;
};

const getSubjectEmoji = (subject: string): string => {
  const s = subject.toLowerCase();
  if (s.includes('physic')) return '⚙️';
  if (s.includes('chem')) return '🧪';
  if (s.includes('botan')) return '🌿';
  if (s.includes('zool')) return '🐾';
  if (s.includes('bio')) return '🧬';
  if (s.includes('math')) return '📐';
  return '📚';
};

const getOptionsList = (q: any): string[] => {
  const kind = String(q.typeData?.kind || q.type || 'mcq').toLowerCase();
  if (kind === 'assertion_reason' || kind === 'assertion-reason') {
    return optionLabels.map((label, idx) => {
      if (Array.isArray(q.options) && q.options[idx]) return String(q.options[idx]);
      if (Array.isArray(q.typeData?.options) && q.typeData.options[idx]) return String(q.typeData.options[idx]);
      if (q.options && typeof q.options === 'object') {
        const val = q.options[label] ?? q.options[label.toLowerCase()];
        if (val) return String(val);
      }
      return DEFAULT_AR_OPTIONS[idx];
    });
  }
  if (kind === 'statement') {
    return optionLabels.map((label, idx) => {
      if (Array.isArray(q.options) && q.options[idx]) return String(q.options[idx]);
      if (Array.isArray(q.typeData?.options) && q.typeData.options[idx]) return String(q.typeData.options[idx]);
      if (q.options && typeof q.options === 'object') {
        const val = q.options[label] ?? q.options[label.toLowerCase()];
        if (val) return String(val);
      }
      return DEFAULT_STMT_OPTIONS[idx];
    });
  }
  if (Array.isArray(q.typeData?.options)) {
    return q.typeData.options.map((o: any) => String(o?.text || o?.value || o || ''));
  }
  if (Array.isArray(q.options)) {
    return q.options.map((o: any) => String(o?.text || o?.value || o || ''));
  }
  if (q.options && typeof q.options === 'object') {
    return optionLabels.map((l) => String(q.options[l] ?? q.options[l.toLowerCase()] ?? ''));
  }
  return [];
};

const getQuestionStatus = (q: any): 'correct' | 'incorrect' | 'skipped' => {
  const payload = q.userAnswer as AnswerPayload | null;
  const kind = String(q.typeData?.kind || q.type || 'mcq').toLowerCase();

  if (kind === 'match' || q.type === 'match' || q.typeData?.matrixData) {
    const pairsObj = payload?.kind === 'match' ? payload.pairs : (payload?.pairs || payload);
    if (!pairsObj || typeof pairsObj !== 'object' || Object.keys(pairsObj).length === 0) {
      return 'skipped';
    }
    const correctPairsObj = q.typeData?.matrixData?.correctPairs || q.correctPairs;
    if (correctPairsObj && typeof correctPairsObj === 'object') {
      return JSON.stringify(pairsObj) === JSON.stringify(correctPairsObj) ? 'correct' : 'incorrect';
    }
    return q.evaluationStatus === 'correct' ? 'correct' : 'incorrect';
  }

  if (kind === 'fillup' || kind === 'cloze' || kind === 'syllable' || q.type === 'fillup' || q.type === 'numeric' || q.type === 'numerical') {
    const val = typeof payload === 'string'
      ? payload
      : payload?.value != null
        ? String(payload.value)
        : '';
    if (!val.trim()) return 'skipped';
    if (q.evaluationStatus === 'correct') return 'correct';
    if (q.evaluationStatus === 'incorrect' || q.evaluationStatus === 'wrong') return 'incorrect';
    const correctVal = String(q.typeData?.primaryAnswer || q.typeData?.answer || q.correctAnswer || '');
    return correctVal.trim() && val.trim().toLowerCase() === correctVal.trim().toLowerCase()
      ? 'correct'
      : 'incorrect';
  }

  const selectedIdx = payload?.kind === 'mcq'
    ? getAnswerIndex(payload.selectedOption)
    : getAnswerIndex(payload);

  if (selectedIdx === null || selectedIdx === -1) {
    return 'skipped';
  }

  const correctIdx = getAnswerIndex(getCorrectOptionIndex(q));
  if (q.evaluationStatus === 'correct') return 'correct';
  if (q.evaluationStatus === 'incorrect' || q.evaluationStatus === 'wrong') return 'incorrect';

  if (correctIdx !== null && selectedIdx === correctIdx) {
    return 'correct';
  }
  return 'incorrect';
};

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'incorrect' | 'skipped' | 'correct'>('all');
  const [filterSubject, setFilterSubject] = useState<'all' | string>('all');
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
      const list = alreadyNormalized ? stateQuestions : normalizeQuestions(stateQuestions);
      return list.map((q: any, idx: number) => ({
        ...q,
        canonicalIndex: q.canonicalIndex || idx + 1,
      }));
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
        canonicalIndex: idx + 1,
        userAnswer: answerPayloadFromAttempt(question, answer),
        evaluationStatus: answer?.evaluationStatus || null,
        evaluationReason: answer?.evaluationReason || null,
        isIgnoredExceedLimit: Boolean(answer?.isIgnoredExceedLimit),
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
      const timing = subjectTimingMap.get(String(subject.subject)) || {
        total: Number(subject.total || 0),
        correct: Number(subject.correct || 0),
        attempted: Number(subject.correct || 0),
        totalTime: 0,
      };
      const totalCount = Number(subject.total || timing.total || 0);
      const correctCount = Number(subject.correct || timing.correct || 0);
      const attemptedCount = timing.attempted || correctCount;
      const incorrectCount = Math.max(0, attemptedCount - correctCount);
      const skippedCount = Math.max(0, totalCount - attemptedCount);
      const marks = correctCount * 4 - incorrectCount * 1;
      const maxMarks = totalCount >= 45 ? 180 : totalCount * 4;
      const progressPercent = Math.max(0, Math.min(100, Math.round((Math.max(0, marks) / (maxMarks || 1)) * 100)));
      const avgSubjectTime = totalCount > 0 ? timing.totalTime / totalCount : 0;
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
        correct: correctCount,
        incorrect: incorrectCount,
        skipped: skippedCount,
        attempted: attemptedCount,
        marks,
        maxMarks,
        progressPercent,
        emoji: getSubjectEmoji(String(subject.subject)),
        total: totalCount,
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

  const filterCounts = useMemo(() => {
    let all = reviewQuestions.length;
    let incorrect = 0;
    let skipped = 0;
    let correct = 0;
    const subjectMap: Record<string, number> = {};

    reviewQuestions.forEach((q) => {
      const st = getQuestionStatus(q);
      if (st === 'incorrect') incorrect++;
      else if (st === 'skipped') skipped++;
      else if (st === 'correct') correct++;

      const subj = String(q.subject || 'General').trim() || 'General';
      subjectMap[subj] = (subjectMap[subj] || 0) + 1;
    });

    return {
      all,
      incorrect,
      skipped,
      correct,
      subjectMap,
    };
  }, [reviewQuestions]);

  const availableSubjects = useMemo(() => {
    const subjectsFromQuestions = Object.keys(filterCounts.subjectMap);
    const neetOrder = ['Physics', 'Chemistry', 'Botany', 'Zoology', 'Biology'];
    return subjectsFromQuestions.sort((a, b) => {
      const idxA = neetOrder.findIndex((s) => s.toLowerCase() === a.toLowerCase());
      const idxB = neetOrder.findIndex((s) => s.toLowerCase() === b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [filterCounts.subjectMap]);

  const filteredQuestions = useMemo(() => {
    return reviewQuestions.filter((q) => {
      if (filterSubject !== 'all') {
        const qSubj = String(q.subject || 'General').toLowerCase().trim();
        if (!qSubj.includes(filterSubject.toLowerCase())) {
          return false;
        }
      }
      if (filterStatus === 'all') return true;
      const st = getQuestionStatus(q);
      return st === filterStatus;
    });
  }, [reviewQuestions, filterStatus, filterSubject]);

  const renderAnswerReview = (q: any) => {
    const payload = q.userAnswer as AnswerPayload | null;
    const kind = String(q.typeData?.kind || q.type || 'mcq').toLowerCase();

    // 1. Assertion-Reason Question
    if (kind === 'assertion_reason' || kind === 'assertion-reason' || q.type === 'assertion_reason') {
      const arData = q.typeData?.assertionReason;
      const assertionText = arData?.assertion || q.assertion || '';
      const reasonText = arData?.reason || q.reason || '';
      const options = getOptionsList(q);
      const selectedIdx = payload?.kind === 'mcq'
        ? getAnswerIndex(payload.selectedOption)
        : getAnswerIndex(payload);
      const correctIdx = getAnswerIndex(getCorrectOptionIndex(q));
      const isUnattempted = selectedIdx === null;
      const isCorrect = !isUnattempted && correctIdx !== null && selectedIdx === correctIdx;

      return (
        <div className="space-y-2 mb-2">
          {assertionText && (
            <div className="rounded-lg border border-border bg-card/60 p-2.5 text-xs">
              <span className="font-bold text-primary mr-1.5">Assertion (A):</span>
              <MathMarkdown content={assertionText} inline />
            </div>
          )}
          {reasonText && (
            <div className="rounded-lg border border-border bg-card/60 p-2.5 text-xs">
              <span className="font-bold text-primary mr-1.5">Reason (R):</span>
              <MathMarkdown content={reasonText} inline />
            </div>
          )}
          <div className="space-y-1.5 pt-1">
            {options.map((opt: string, optIdx: number) => {
              const isSelected = selectedIdx === optIdx;
              const isRight = correctIdx === optIdx;
              const rowClass = isRight
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium'
                : isSelected && !isRight
                  ? 'border-destructive/50 bg-destructive/10 text-destructive'
                  : 'border-border bg-card/80 text-foreground';

              return (
                <div key={optIdx} className={`rounded-lg border px-3 py-2 text-xs flex items-start gap-2 ${rowClass}`}>
                  <span className="font-bold shrink-0">{optionLabels[optIdx] || optIdx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <MathMarkdown content={opt} inline />
                  </div>
                  {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                  {isSelected && !isRight && <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <span>Your Answer:</span>
              <span className={isUnattempted ? 'text-muted-foreground font-medium' : isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-destructive font-bold'}>
                {isUnattempted ? 'Not Attempted' : `Option ${optionLabels[selectedIdx ?? -1] || (selectedIdx !== null ? selectedIdx + 1 : 'Not Attempted')}`}
              </span>
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
              <span>Correct Answer:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {correctIdx === null || correctIdx < 0 ? 'N/A' : `Option ${optionLabels[correctIdx] || correctIdx + 1}`}
              </span>
            </p>
          </div>
        </div>
      );
    }

    // 2. Statement Question
    if (kind === 'statement' || q.type === 'statement') {
      const stmtData = q.typeData?.statementData;
      const stmt1Text = stmtData?.statement1 || q.statement1 || '';
      const stmt2Text = stmtData?.statement2 || q.statement2 || '';
      const options = getOptionsList(q);
      const selectedIdx = payload?.kind === 'mcq'
        ? getAnswerIndex(payload.selectedOption)
        : getAnswerIndex(payload);
      const correctIdx = getAnswerIndex(getCorrectOptionIndex(q));
      const isUnattempted = selectedIdx === null;
      const isCorrect = !isUnattempted && correctIdx !== null && selectedIdx === correctIdx;

      return (
        <div className="space-y-2 mb-2">
          {stmt1Text && (
            <div className="rounded-lg border border-border bg-card/60 p-2.5 text-xs">
              <span className="font-bold text-primary mr-1.5">Statement I:</span>
              <MathMarkdown content={stmt1Text} inline />
            </div>
          )}
          {stmt2Text && (
            <div className="rounded-lg border border-border bg-card/60 p-2.5 text-xs">
              <span className="font-bold text-primary mr-1.5">Statement II:</span>
              <MathMarkdown content={stmt2Text} inline />
            </div>
          )}
          <div className="space-y-1.5 pt-1">
            {options.map((opt: string, optIdx: number) => {
              const isSelected = selectedIdx === optIdx;
              const isRight = correctIdx === optIdx;
              const rowClass = isRight
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium'
                : isSelected && !isRight
                  ? 'border-destructive/50 bg-destructive/10 text-destructive'
                  : 'border-border bg-card/80 text-foreground';

              return (
                <div key={optIdx} className={`rounded-lg border px-3 py-2 text-xs flex items-start gap-2 ${rowClass}`}>
                  <span className="font-bold shrink-0">{optionLabels[optIdx] || optIdx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <MathMarkdown content={opt} inline />
                  </div>
                  {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                  {isSelected && !isRight && <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <span>Your Answer:</span>
              <span className={isUnattempted ? 'text-muted-foreground font-medium' : isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-destructive font-bold'}>
                {isUnattempted ? 'Not Attempted' : `Option ${optionLabels[selectedIdx ?? -1] || (selectedIdx !== null ? selectedIdx + 1 : 'Not Attempted')}`}
              </span>
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
              <span>Correct Answer:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {correctIdx === null || correctIdx < 0 ? 'N/A' : `Option ${optionLabels[correctIdx] || correctIdx + 1}`}
              </span>
            </p>
          </div>
        </div>
      );
    }

    // 3. Matrix Match
    if (kind === 'match' || q.type === 'match' || q.typeData?.matrixData) {
      const pairs = Array.isArray(q.typeData?.pairs) ? q.typeData.pairs : [];
      const userPairs = payload?.kind === 'match' ? payload.pairs : (payload?.pairs || payload || {});
      const hasPairs = userPairs && typeof userPairs === 'object' && Object.keys(userPairs).length > 0;
      const isUnattempted = !hasPairs;

      return (
        <div className="space-y-1.5 mb-2">
          {pairs.length > 0 ? (
            pairs.map((pair: any, pIdx: number) => {
              const userVal = userPairs?.[pair.id] ?? userPairs?.[pIdx] ?? '';
              const correctVal = pair.right;
              const isRight = Boolean(userVal && userVal === correctVal);

              return (
                <div
                  key={pair.id || pIdx}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    isRight
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : userVal
                        ? 'border-destructive/40 bg-destructive/10'
                        : 'border-border bg-card'
                  }`}
                >
                  <div className="font-semibold text-foreground">
                    <MathMarkdown content={pair.left} inline />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className={userVal ? (isRight ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold') : 'text-muted-foreground'}>
                      Your Match: {userVal || 'Not matched'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Correct: {correctVal}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-muted-foreground">
              {isUnattempted ? 'Not Attempted' : 'Matrix match completed.'}
            </div>
          )}
          <div className="text-[11px] text-muted-foreground pt-1">
            <span>Status: </span>
            <span className={isUnattempted ? 'text-muted-foreground' : q.evaluationStatus === 'correct' ? 'text-emerald-600 font-bold' : 'text-destructive font-bold'}>
              {isUnattempted ? 'Not Attempted' : q.evaluationStatus === 'correct' ? 'Correct Matrix Match' : 'Incorrect Matrix Match'}
            </span>
          </div>
        </div>
      );
    }

    // 4. Fillup / Numeric / Syllable / Cloze
    if (kind === 'fillup' || kind === 'cloze' || kind === 'syllable' || q.type === 'fillup' || q.type === 'numeric' || q.type === 'numerical') {
      const val = typeof payload === 'string'
        ? payload
        : payload?.value != null
          ? String(payload.value)
          : '';
      const isUnattempted = !val.trim();
      const correctVal = String(q.typeData?.primaryAnswer || q.typeData?.answer || q.correctAnswer || (q.typeData?.acceptedAnswers || [])[0] || '');
      const isCorrect = !isUnattempted && (
        q.evaluationStatus === 'correct' ||
        (correctVal.trim() !== '' && val.trim().toLowerCase() === correctVal.trim().toLowerCase())
      );

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] mb-2 pt-1">
          <p className="text-muted-foreground">
            Your Answer:{' '}
            <span className={isUnattempted ? 'text-muted-foreground font-medium' : isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-destructive font-bold'}>
              {isUnattempted ? 'Not Attempted' : val}
            </span>
          </p>
          <p className="text-muted-foreground">
            Accepted Answer(s):{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {(q.typeData?.acceptedAnswers || [correctVal]).filter(Boolean).join(', ') || 'N/A'}
            </span>
          </p>
        </div>
      );
    }

    // 5. Order
    if (q.type === 'order') {
      const items = Array.isArray(q.typeData?.items) ? q.typeData.items : [];
      const orderedIds = payload?.kind === 'order' ? payload.orderedIds : [];
      const currentOrder = orderedIds.length ? orderedIds : items.map((item: any) => item.id);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <p className="font-semibold text-foreground mb-2">Your Order</p>
            <div className="space-y-1">
              {currentOrder.map((id: string, index: number) => (
                <div key={`${id}-${index}`}>{index + 1}. {items.find((item: any) => item.id === id)?.text || id}</div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="font-semibold text-foreground mb-2">Correct Order</p>
            <div className="space-y-1">
              {(q.typeData?.correctOrder || []).map((id: string, index: number) => (
                <div key={`${id}-correct-${index}`}>{index + 1}. {items.find((item: any) => item.id === id)?.text || id}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 6. Flashcard
    if (q.type === 'flashcard') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <p className="font-semibold text-foreground mb-2">Front</p>
            <MathMarkdown content={q.typeData?.front || q.question} />
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="font-semibold text-foreground mb-2">Back</p>
            <MathMarkdown content={q.typeData?.back || q.explanation} />
            <p className="mt-2 text-muted-foreground">Status: {payload?.kind === 'flashcard' && payload.completed ? 'Completed' : 'Viewed'}</p>
          </div>
        </div>
      );
    }

    // 7. Video
    if (q.type === 'video') {
      const videoUrl = q.videoUrl || q.typeData?.videoUrl;
      return (
        <div className="rounded-lg border border-border bg-card p-2.5 text-xs mb-2">
          <p className="font-semibold text-foreground mb-1">Video Question</p>
          <p className="text-muted-foreground">Status: {payload?.kind === 'video' && payload.completed ? 'Completed' : 'Not completed'}</p>
          {videoUrl ? <a href={videoUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold">Open video</a> : null}
        </div>
      );
    }

    // 8. Standard MCQ / single choice fallback
    const options = getOptionsList(q);
    const selectedIdx = payload?.kind === 'mcq'
      ? getAnswerIndex(payload.selectedOption)
      : getAnswerIndex(payload);
    const correctIdx = getAnswerIndex(getCorrectOptionIndex(q));
    const isUnattempted = selectedIdx === null;
    const isCorrect = !isUnattempted && correctIdx !== null && selectedIdx === correctIdx;

    return (
      <>
        <div className="space-y-1.5 mb-2">
          {options.map((opt: string, optIdx: number) => {
            const isSelected = selectedIdx === optIdx;
            const isRight = correctIdx === optIdx;
            const rowClass = isRight
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium'
              : isSelected && !isRight
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : 'border-border bg-card/80 text-foreground';

            return (
              <div key={optIdx} className={`rounded-lg border px-3 py-2 text-xs flex items-start gap-2 ${rowClass}`}>
                <span className="font-bold shrink-0">{optionLabels[optIdx] || optIdx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <MathMarkdown content={opt} inline />
                </div>
                {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                {isSelected && !isRight && <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
          <p className="text-muted-foreground flex items-center gap-1">
            <span>Your Answer:</span>
            <span className={isUnattempted ? 'text-muted-foreground font-medium' : isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-destructive font-bold'}>
              {isUnattempted ? 'Not Attempted' : `Option ${optionLabels[selectedIdx ?? -1] || (selectedIdx !== null ? selectedIdx + 1 : 'Not Attempted')}`}
            </span>
          </p>
          <p className="text-muted-foreground flex items-center gap-1">
            <span>Correct Answer:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {correctIdx === null || correctIdx < 0 ? 'N/A' : `Option ${optionLabels[correctIdx] || correctIdx + 1}`}
            </span>
          </p>
        </div>
      </>
    );
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

                <div className="space-y-3">
                  {analytics.subjectInsights.map((item) => (
                    <div key={item.subject} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base select-none">{item.emoji}</span>
                          <p className="text-sm font-bold text-foreground truncate">{item.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-primary">{item.marks} / {item.maxMarks}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">Eff {item.efficiencyScore}</Badge>
                        </div>
                      </div>

                      <Progress value={item.progressPercent} className="h-1.5" />

                      {/* Responsive 2x2 Sub-Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 flex items-center gap-1.5 min-w-0">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                            +{item.correct * 4} ({item.correct} correct)
                          </span>
                        </div>

                        <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1.5 flex items-center gap-1.5 min-w-0">
                          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <span className="text-xs font-semibold text-destructive truncate">
                            -{item.incorrect} ({item.incorrect} wrong)
                          </span>
                        </div>

                        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 flex items-center gap-1.5 min-w-0">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                            {item.skipped} skipped
                          </span>
                        </div>

                        <div className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 flex items-center gap-1.5 min-w-0">
                          <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-xs font-bold text-foreground truncate">
                            {Math.round(item.accuracy)}% • {Math.round(item.avgTime || 0)}s
                          </span>
                        </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    Time & Pace Analysis
                  </CardTitle>
                  {(analytics.bookmarked > 0 || analytics.markedReview > 0) && (
                    <span className="text-[10px] text-muted-foreground">
                      {analytics.bookmarked > 0 ? `${analytics.bookmarked} bookmarked` : ''}
                      {analytics.bookmarked > 0 && analytics.markedReview > 0 ? ' • ' : ''}
                      {analytics.markedReview > 0 ? `${analytics.markedReview} marked` : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase">
                      <Clock className="w-3 h-3 text-sky-500 shrink-0" />
                      <span className="truncate">Total Time</span>
                    </div>
                    <p className="mt-1 text-base sm:text-lg font-bold text-foreground truncate">
                      {formatDuration(analytics.totalTime)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase">
                      <Gauge className="w-3 h-3 text-purple-500 shrink-0" />
                      <span className="truncate">Avg Speed / Q</span>
                    </div>
                    <p className="mt-1 text-base sm:text-lg font-bold text-foreground truncate">
                      {Math.round(analytics.avgTime)}s
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                      <Zap className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">Fastest</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-foreground truncate">
                      {analytics.fastest ? `${analytics.fastest.label} • ${formatDuration(analytics.fastest.timeSpent)}` : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                      <Timer className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">Slowest</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-foreground truncate">
                      {analytics.slowest ? `${analytics.slowest.label} • ${formatDuration(analytics.slowest.timeSpent)}` : 'N/A'}
                    </p>
                  </div>
                </div>
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
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" />
                    <span>Answer Review</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({filteredQuestions.length} of {reviewQuestions.length})
                    </span>
                  </CardTitle>
                  {(filterStatus !== 'all' || filterSubject !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterSubject('all');
                      }}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* ═══ Dual-Tier Interactive Sticky Filter Bar ═══ */}
                <div className="sticky top-[53px] z-10 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2.5">
                  {/* Tier 1: Outcome Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {[
                      { id: 'all' as const, label: 'All', count: filterCounts.all, activeColor: 'bg-primary text-primary-foreground' },
                      { id: 'incorrect' as const, label: '✗ Incorrect', count: filterCounts.incorrect, activeColor: 'bg-destructive text-destructive-foreground' },
                      { id: 'skipped' as const, label: '⊘ Skipped', count: filterCounts.skipped, activeColor: 'bg-amber-500 text-white' },
                      { id: 'correct' as const, label: '✓ Correct', count: filterCounts.correct, activeColor: 'bg-emerald-600 text-white' },
                    ].map((chip) => {
                      const isSelected = filterStatus === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setFilterStatus(chip.id)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? `${chip.activeColor} shadow-sm`
                              : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50'
                          }`}
                        >
                          <span>{chip.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                              isSelected ? 'bg-black/20 text-white' : 'bg-muted-foreground/15 text-muted-foreground'
                            }`}
                          >
                            {chip.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tier 2: Subject Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                    <button
                      type="button"
                      onClick={() => setFilterSubject('all')}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        filterSubject === 'all'
                          ? 'bg-primary/15 text-primary border-primary/40 font-semibold'
                          : 'bg-card text-muted-foreground hover:bg-muted/50 border-border/60'
                      }`}
                    >
                      All Subjects ({filterCounts.all})
                    </button>
                    {availableSubjects.map((subj) => {
                      const isSelected = filterSubject.toLowerCase() === subj.toLowerCase();
                      const count = filterCounts.subjectMap[subj] || 0;
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setFilterSubject(subj)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? 'bg-primary/15 text-primary border-primary/40 font-semibold'
                              : 'bg-card text-muted-foreground hover:bg-muted/50 border-border/60'
                          }`}
                        >
                          {subj} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ═══ Celebratory Empty Filter State ═══ */}
                {filteredQuestions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center flex flex-col items-center justify-center my-4">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                        filterStatus === 'incorrect'
                          ? 'bg-amber-500/15 text-amber-500'
                          : filterStatus === 'skipped'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {filterStatus === 'incorrect' ? (
                        <Trophy className="w-7 h-7" />
                      ) : filterStatus === 'skipped' ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        <Filter className="w-7 h-7" />
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {filterStatus === 'incorrect'
                        ? 'Flawless Execution!'
                        : filterStatus === 'skipped'
                          ? 'Zero Skipped Questions!'
                          : 'No Questions Match Filter'}
                    </h3>

                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4 leading-relaxed">
                      {filterStatus === 'incorrect'
                        ? 'Zero incorrect questions found in this selection. Excellent accuracy!'
                        : filterStatus === 'skipped'
                          ? 'You attempted every single question in this category.'
                          : 'Try clearing your filters to see questions across all subjects and outcomes.'}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterSubject('all');
                      }}
                      className="text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Show All Questions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredQuestions.map((q: any, idx: number) => {
                      const reviewKey = String(q._id || q.id || q.canonicalIndex || idx);
                      const qCanonicalIdx = (q.canonicalIndex || idx + 1) - 1;
                      const timeSpent = Number(
                        ntaMeta?.[qCanonicalIdx]?.timeSpent ??
                        attempt?.answers?.find((answer: any) => String(answer?.questionId?._id || answer?.questionId || '') === reviewKey)?.timeSpent ??
                        0
                      );
                      const isIgnoredExceedLimit = Boolean(q.isIgnoredExceedLimit || q.userAnswer?.isIgnoredExceedLimit);
                      const st = getQuestionStatus(q);
                      const isUnattempted = st === 'skipped';
                      const isCorrect = st === 'correct';
                      const hasExplanation = Boolean(String(q.explanation || q.solution || '').trim()) || Boolean(q.explanationImageUrl) || Boolean(q.resolvedExplanationDiagrams?.length);
                      const isExplanationOpen = Boolean(openExplanations[reviewKey]);

                      return (
                        <div
                          key={q._id || q.id || idx}
                          className={`rounded-xl border border-border p-3.5 bg-card/60 border-l-4 transition-all ${
                            isIgnoredExceedLimit
                              ? 'border-l-amber-500'
                              : isUnattempted
                                ? 'border-l-muted-foreground/40'
                                : isCorrect
                                  ? 'border-l-emerald-500'
                                  : q.evaluationStatus === 'partial'
                                    ? 'border-l-amber-500'
                                    : 'border-l-destructive'
                          }`}
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="text-xs sm:text-sm font-semibold text-foreground flex-1 min-w-0">
                              <span className="font-bold text-primary mr-1">Q{q.canonicalIndex || idx + 1}.</span>
                              <MathMarkdown content={q.question || q.text || ''} inline />
                            </div>
                            <Badge
                              variant="secondary"
                              className={`shrink-0 font-bold text-xs ${
                                isIgnoredExceedLimit
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                  : isUnattempted
                                    ? 'bg-muted text-muted-foreground border-border'
                                    : isCorrect
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : q.evaluationStatus === 'partial'
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                        : 'bg-destructive/15 text-destructive border-destructive/30'
                              }`}
                            >
                              {isIgnoredExceedLimit
                                ? 'Ignored (10/15)'
                                : isUnattempted
                                  ? 'Skipped'
                                  : isCorrect
                                    ? '+4 Correct'
                                    : q.evaluationStatus === 'partial'
                                      ? 'Partial'
                                      : '-1 Incorrect'}
                            </Badge>
                          </div>

                          {/* Metadata Pills */}
                          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 border border-border/60">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {formatDuration(timeSpent)}
                            </span>
                            {q.subject && (
                              <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 border border-border/60">
                                {q.subject}
                              </span>
                            )}
                            {q.chapter && (
                              <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 border border-border/60 truncate max-w-[220px]">
                                {q.chapter}
                              </span>
                            )}
                          </div>

                          {/* Question Diagram with Lightbox Inspector */}
                          {q.imageUrl ? (
                            <div className="mb-3">
                              <DiagramLightboxViewer
                                imageUrl={q.imageUrl}
                                title={`Question ${q.canonicalIndex || idx + 1} Diagram`}
                                thumbnailHeight={240}
                              />
                            </div>
                          ) : null}

                          <DiagramGallery diagrams={q.resolvedQuestionDiagrams} className="mb-3" />

                          {/* Polymorphic Answer Review */}
                          {renderAnswerReview(q)}

                          {/* Evaluation Reason & Explanation Toggle */}
                          <div className="mt-2.5 flex items-start justify-between gap-2 pt-1 border-t border-border/40">
                            <div className="text-[11px] text-muted-foreground flex-1">
                              {q.evaluationReason || (isUnattempted ? 'Not attempted.' : isCorrect ? 'Correct solution.' : 'Incorrect answer.')}
                            </div>
                            {hasExplanation && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] shrink-0"
                                onClick={() => toggleExplanation(reviewKey)}
                              >
                                {isExplanationOpen ? 'Close Explanation' : 'View Explanation'}
                              </Button>
                            )}
                          </div>

                          {/* Explanation with KaTeX Markdown & Lightbox */}
                          {hasExplanation && isExplanationOpen && (
                            <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 sm:p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Explanation & Solution</span>
                              </div>
                              <MathMarkdown content={String(q.explanation || q.solution || '')} />
                              {q.explanationImageUrl ? (
                                <div className="mt-2.5">
                                  <DiagramLightboxViewer
                                    imageUrl={q.explanationImageUrl}
                                    title={`Explanation ${q.canonicalIndex || idx + 1} Diagram`}
                                    thumbnailHeight={240}
                                  />
                                </div>
                              ) : null}
                              <DiagramGallery diagrams={q.resolvedExplanationDiagrams} className="mt-2.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
