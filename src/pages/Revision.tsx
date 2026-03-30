import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Brain } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import NeuronzDashboard from '@/components/NeuronzDashboard';
import BottomNav from '@/components/BottomNav';
import NTATestPlayer, { type NTAQuestion, type NTASubmitData } from '@/components/NTATestPlayer';
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

const REVISION_DURATION_SECONDS = 12 * 60 * 60;

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

const toNTAQuestion = (question: LevelQuestion, level: number): NTAQuestion => {
  const optionMap = ['A', 'B', 'C', 'D'].reduce((acc, key, index) => {
    acc[key] = question.options[index] || '';
    return acc;
  }, {} as Record<string, string>);

  return {
    _id: question.questionId,
    id: question.questionId,
    questionId: question.questionId,
    type: 'mcq',
    question: question.question,
    explanation: question.explanation || '',
    questionDiagramRefs: [],
    explanationDiagramRefs: [],
    resolvedQuestionDiagrams: [],
    resolvedExplanationDiagrams: [],
    subject: 'neuronz',
    chapter: `Level ${level}`,
    topic: 'Spaced Revision',
    difficulty: '',
    imageUrl: null,
    explanationImageUrl: null,
    imageId: null,
    videoUrl: null,
    correctAnswer: question.correctIndex,
    typeData: {
      options: question.options,
      optionMap,
      correctOption: question.correctIndex !== null ? String.fromCharCode(65 + question.correctIndex) : null,
    },
    isSupported: true,
    unsupportedReason: null,
  };
};

const Revision = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dueQuestions, isLoading, isLevelLoading, levelQuestions, error } = useAppSelector((state) => state.neuronz);

  const level = Number(searchParams.get('level'));
  const isLevelMode = Number.isInteger(level) && level >= 1 && level <= 7;
  const [summary, setSummary] = useState<AttemptSummary | null>(null);
  const [sessionMode, setSessionMode] = useState<'all' | '50' | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (!isLevelMode) {
      setSessionMode(null);
      setQuizStarted(false);
      return;
    }

    setSummary(null);
    setSessionMode(null);
    setQuizStarted(false);
    void dispatch(loadDueQuestions());
  }, [dispatch, isLevelMode, level]);

  const dueCount = useMemo(() => {
    if (!isLevelMode || !dueQuestions) return 0;
    const levelKey = `L${level}` as keyof typeof dueQuestions.byLevel;
    return dueQuestions.byLevel[levelKey]?.length || 0;
  }, [isLevelMode, dueQuestions, level]);

  useEffect(() => {
    if (!isLevelMode || sessionMode !== null) return;
    setSessionMode(dueCount > 50 ? '50' : 'all');
  }, [isLevelMode, dueCount, sessionMode]);

  useEffect(() => {
    if (!isLevelMode || sessionMode === null) return;
    void dispatch(
      loadLevelQuestions({
        level,
        limit: sessionMode === '50' ? 50 : null,
      })
    );
  }, [dispatch, isLevelMode, level, sessionMode]);

  const normalizedQuestions = useMemo(() => {
    if (!isLevelMode) return [];
    const raw = levelQuestions[level]?.questions || [];
    return normalizeLevelQuestions(raw);
  }, [isLevelMode, levelQuestions, level]);

  const quizQuestions = useMemo<NTAQuestion[]>(
    () => normalizedQuestions.map((question) => toNTAQuestion(question, level)),
    [normalizedQuestions, level]
  );

  const batchLimit = sessionMode === '50' ? 50 : null;
  const sessionQuestionCount = quizQuestions.length;
  const remainingAfterSession = Math.max(dueCount - sessionQuestionCount, 0);

  const handleSubmitLevelQuiz = async (data: NTASubmitData) => {
    if (!isLevelMode || normalizedQuestions.length === 0) return;
    const payload: { questionId: string; wasCorrect: boolean; timeSpent?: number }[] = [];
    let attempted = 0;
    let correct = 0;

    normalizedQuestions.forEach((question, index) => {
      const answerPayload = data.answers[index];
      if (answerPayload?.kind !== 'mcq' || !Number.isInteger(answerPayload.selectedOption)) return;
      attempted += 1;
      const selectedOption = Number(answerPayload.selectedOption);
      const wasCorrect = question.correctIndex !== null && selectedOption === question.correctIndex;
      if (wasCorrect) correct += 1;
      payload.push({
        questionId: question.questionId,
        wasCorrect,
        timeSpent: Number(data.meta[index]?.timeSpent || 0),
      });
    });

    if (payload.length > 0) {
      await dispatch(reviewBatch(payload)).unwrap();
      await dispatch(loadDueQuestions());
      await dispatch(getMasteryProgress());
    }

    setSummary({ attempted, correct, total: normalizedQuestions.length });
  };

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

  if (isLoading || sessionMode === null || (isLevelLoading && dueCount > 0 && normalizedQuestions.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
              onClick={() => navigate('/app/revision')}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm"
            >
              Back to NeuronZ
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/app/revision')} className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-lg mx-auto">
          <button onClick={() => navigate('/app/revision')} className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
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

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <button onClick={() => navigate('/app/revision')} className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-foreground">NeuronZ Level {level}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Use the richer test player while keeping the NeuronZ level progression intact.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Session Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-2xl font-bold text-primary">{dueCount}</p>
                  <p className="text-sm text-muted-foreground">Due Questions</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-2xl font-bold text-primary">{sessionQuestionCount}</p>
                  <p className="text-sm text-muted-foreground">This Session</p>
                </div>
              </div>
              {remainingAfterSession > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">{remainingAfterSession} questions will remain due for the next batch.</p>
              ) : null}
            </div>

            {dueCount > 50 ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionMode('50')}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    sessionMode === '50'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">First 50</p>
                  <p className="mt-1 text-xs text-muted-foreground">Finish a smaller batch first, then continue later.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionMode('all')}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    sessionMode === 'all'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">All Due</p>
                  <p className="mt-1 text-xs text-muted-foreground">Load every due question in this level.</p>
                </button>
              </div>
            ) : null}

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-3">Level Logic</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Correct answers move up to the next NeuronZ level and get their next revision time from the spaced-repetition logic. Wrong answers stay in the same level and are rescheduled from there.
              </p>
            </div>

            <button
              onClick={() => setQuizStarted(true)}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-bold text-lg shadow-sm"
            >
              {batchLimit ? `Start First ${Math.min(batchLimit, sessionQuestionCount || dueCount)}` : `Start All ${sessionQuestionCount || dueCount}`}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <NTATestPlayer
      questions={quizQuestions}
      title={`NeuronZ Level ${level}`}
      duration={REVISION_DURATION_SECONDS}
      onSubmit={handleSubmitLevelQuiz}
    />
  );
};

export default Revision;
