import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, Clock, Target, AlertCircle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, Eye, BarChart3, Timer, Zap, BookOpen, Flag, RotateCcw
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../lib/apiService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNav from '@/components/BottomNav';
import type { QuestionMeta } from '@/components/NTATestPlayer';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

const optionLabels = ['A', 'B', 'C', 'D'];

const getOptionsArray = (options: any): string[] => {
  if (Array.isArray(options)) return options.map((o) => String(o ?? ''));
  if (options && typeof options === 'object') {
    return optionLabels.map((label) => String(options[label] ?? ''));
  }
  return [];
};

const getAnswerIndex = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const v = value.trim().toUpperCase();
    if (/^[A-D]$/.test(v)) return v.charCodeAt(0) - 65;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

export default function TestReport() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openExplanations, setOpenExplanations] = useState<Record<string, boolean>>({});
  const returnTo: string | null = (location.state as any)?.returnTo ?? null;
  const returnLabel: string = (location.state as any)?.returnLabel ?? 'Back';
  const retryTo: string | null = (location.state as any)?.retryTo ?? null;
  const reviewQuestions: any[] = Array.isArray((location.state as any)?.questions)
    ? (location.state as any).questions
    : [];

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
            onClick={() => (returnTo ? navigate(returnTo) : navigate('/app/tests'))}
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
                  const options = getOptionsArray(q.options);
                  const selectedIdx = getAnswerIndex(q.userAnswer);
                  const correctIdx = getAnswerIndex(q.correctAnswer);
                  const isCorrect = selectedIdx !== null && correctIdx !== null && selectedIdx === correctIdx;
                  const hasExplanation = Boolean(String(q.explanation || '').trim());
                  const isExplanationOpen = Boolean(openExplanations[reviewKey]);

                  return (
                    <div key={q._id || q.id || idx} className="rounded-xl border border-border p-3 bg-muted/30">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs font-semibold text-foreground">Q{idx + 1}. {q.question}</p>
                        <Badge
                          variant="secondary"
                          className={isCorrect ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/15 text-destructive'}
                        >
                          {isCorrect ? 'Correct' : 'Wrong'}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 mb-2">
                        {options.map((opt, optIdx) => {
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

                      <div className="mt-1 flex items-start justify-between gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] flex-1">
                          <p className="text-muted-foreground">
                            Your Answer:{' '}
                            <span className={selectedIdx === null ? 'text-muted-foreground' : isCorrect ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>
                              {selectedIdx === null ? 'Not Attempted' : optionLabels[selectedIdx] || 'Invalid'}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Correct Answer:{' '}
                            <span className="text-emerald-600 font-semibold">
                              {correctIdx === null ? 'N/A' : optionLabels[correctIdx] || 'N/A'}
                            </span>
                          </p>
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

                      {hasExplanation && isExplanationOpen && (
                        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2">
                          <p className="text-[11px] font-semibold text-primary mb-1">Explanation</p>
                          <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">
                            {String(q.explanation)}
                          </p>
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
            onClick={() => (returnTo ? navigate(returnTo) : navigate('/app/tests'))}
          >
            {returnLabel}
          </Button>
          {retryTo && (
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={() => navigate(retryTo)}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Retake
            </Button>
          )}
          {(attemptId !== 'curriculum' && attemptId !== 'custom') && (
            <Button
              className="flex-1 h-11"
              onClick={() => navigate(`/test/${testId?._id}/solutions/${attemptId}`)}
            >
              <Eye className="w-4 h-4 mr-1.5" />
              View Solutions
            </Button>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
