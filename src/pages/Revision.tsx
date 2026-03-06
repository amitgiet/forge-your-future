import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
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
  if (['A', 'B', 'C', 'D'].includes(letter)) {
    return letter.charCodeAt(0) - 65;
  }

  const answerText = String(question?.correct_answer || '').trim().toLowerCase();
  if (!answerText) return null;
  const matched = options.findIndex((opt) => String(opt).trim().toLowerCase() === answerText);
  return matched >= 0 ? matched : null;
};

const normalizeLevelQuestions = (rawQuestions: any[] = []): LevelQuestion[] => {
  return rawQuestions
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
};

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
      payload.push({
        questionId: question.questionId,
        wasCorrect,
      });
    });

    if (payload.length > 0) {
      await dispatch(reviewBatch(payload)).unwrap();
      await dispatch(loadDueQuestions());
      await dispatch(getMasteryProgress());
    }

    setSummary({
      attempted,
      correct,
      total: normalizedQuestions.length,
    });
  };

  if (!isLevelMode) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="nf-safe-area p-4 max-w-5xl mx-auto">
          <NeuronzDashboard />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (summary) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <div className="nf-card text-center space-y-4 mt-10">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Level {level} Review Complete</h1>
            <p className="text-muted-foreground">
              Correct: {summary.correct}/{summary.attempted} attempted ({summary.total} total)
            </p>
            <button
              onClick={() => navigate('/revision')}
              className="nf-btn-primary w-full"
            >
              Back to NeuronZ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLevelLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <button onClick={() => navigate('/revision')} className="inline-flex items-center gap-2 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="nf-card text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <button onClick={() => navigate('/revision')} className="inline-flex items-center gap-2 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="nf-card">
            <h1 className="text-xl font-bold text-foreground mb-2">No due questions in L{level}</h1>
            <p className="text-muted-foreground">Come back when questions at this level reach their revision time.</p>
          </div>
        </div>
      </div>
    );
  }

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
