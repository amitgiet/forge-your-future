import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Brain } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import NeuronzDashboard from '@/components/NeuronzDashboard';
import BottomNav from '@/components/BottomNav';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';
import {
  getMasteryProgress,
  loadDueQuestions,
  loadLevelQuestions,
  reviewBatch,
} from '@/store/slices/neuronzSlice';

type LevelQuestion = {
  questionId: string;
  question: string;
  options: string[];
  explanation?: string;
  correctIndex: number | null;
};

type AttemptSummary = {
  attempted: number;
  correct: number;
  total: number;
};

const getCorrectIndex = (question: any, options: string[]): number | null => {
  const letter = String(question?.correct_option || '').trim().toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(letter)) return letter.charCodeAt(0) - 65;
  const answerText = String(question?.correct_answer || '').trim().toLowerCase();
  if (!answerText) return null;
  const matched = options.findIndex((opt) => String(opt).trim().toLowerCase() === answerText);
  return matched >= 0 ? matched : null;
};

const normalizeLevelQuestions = (rawQuestions: any[] = []): LevelQuestion[] =>
  rawQuestions
    .map((question) => {
      const options = [
        String(question?.options?.A || ''),
        String(question?.options?.B || ''),
        String(question?.options?.C || ''),
        String(question?.options?.D || ''),
      ];
      return {
        questionId: String(question?.questionId || ''),
        question: String(question?.question || ''),
        options,
        explanation: question?.explanation ? String(question.explanation) : undefined,
        correctIndex: getCorrectIndex(question, options),
      };
    })
    .filter((q) => q.questionId && q.question && q.options.some((opt) => opt.trim().length > 0));

const Revision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLevelLoading, levelQuestions, error } = useAppSelector((state) => state.neuronz);

  const level = Number(searchParams.get('level'));
  const isLevelMode = Number.isInteger(level) && level >= 1 && level <= 7;
  const [summary, setSummary] = useState<AttemptSummary | null>(null);

  useEffect(() => {
    if (!isLevelMode) return;
    void dispatch(loadLevelQuestions(level));
  }, [dispatch, isLevelMode, level]);

  const normalizedQuestions = useMemo(() => {
    if (!isLevelMode) return [];
    const raw = levelQuestions[level]?.questions || [];
    return normalizeLevelQuestions(raw);
  }, [isLevelMode, levelQuestions, level]);

  const quizQuestions: QuizQuestion[] = useMemo(
    () =>
      normalizedQuestions.map((q) => ({
        id: q.questionId,
        question: q.question,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctIndex ?? undefined,
        explanation: q.explanation,
      })),
    [normalizedQuestions]
  );

  const handleSubmitLevelQuiz = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    if (!isLevelMode || normalizedQuestions.length === 0) return;
    const payload: { questionId: string; wasCorrect: boolean; timeSpent?: number }[] = [];
    let attempted = 0;
    let correct = 0;

    normalizedQuestions.forEach((question, index) => {
      const answer = data.answers[index];
      if (typeof answer !== 'number') return;
      attempted += 1;
      const wasCorrect = question.correctIndex !== null && answer === question.correctIndex;
      if (wasCorrect) correct += 1;
      payload.push({ questionId: question.questionId, wasCorrect });
    });

    if (payload.length > 0) {
      await dispatch(reviewBatch(payload)).unwrap();
      await dispatch(loadDueQuestions());
      await dispatch(getMasteryProgress());
    }

    setSummary({ attempted, correct, total: normalizedQuestions.length });
  };

  /* ── Dashboard view ── */
  if (!isLevelMode) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <NeuronzDashboard />
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ── Summary view ── */
  if (summary) {
    const pct = summary.attempted > 0 ? Math.round((summary.correct / summary.attempted) * 100) : 0;
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border p-6 text-center space-y-4 mt-8 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Level {level} Complete!</h1>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-2xl font-bold text-foreground">{summary.correct}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Correct</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-2xl font-bold text-foreground">{summary.attempted}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Attempted</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-2xl font-bold text-primary">{pct}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Accuracy</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/revision')}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm"
            >
              Back to NeuronZ
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (isLevelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/revision')} className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm">{error}</div>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/revision')} className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground mb-2">No Due Questions in L{level}</h1>
            <p className="text-sm text-muted-foreground">Come back when questions at this level reach their revision time.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Quiz ── */
  return (
    <QuizPlayer
      title={`NeuronZ Level ${level}`}
      questions={quizQuestions}
      showPalette={false}
      showTimer={false}
      allowReviewMarking={false}
      onSubmit={handleSubmitLevelQuiz}
      config={{ showDifficulty: false, showMarks: false, showExplanations: true }}
    />
  );
};

export default Revision;
