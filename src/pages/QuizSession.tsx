import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Lightbulb, ChevronRight, Check, X, Flag } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import { API_BASE_URL } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AxiosError } from 'axios';

type QuizMode = 'practice' | 'test';

interface SessionQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  chapter?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface SessionAnswer {
  questionId: string;
  selected: number | null;
  correct: boolean;
  timeTaken: number;
  chapter: string;
}

type CurriculumContext = {
  subject: 'biology' | 'chemistry' | 'physics';
  chapterId: string;
  topic: string;
  subTopic: string;
  uids: number[];
  mode: QuizMode;
};

type CurriculumRestoreState = {
  panel: 'subjects' | 'chapters' | 'topics' | 'roadmap';
  subject: 'biology' | 'chemistry' | 'physics' | null;
  chapters: unknown[];
  selectedChapter: Record<string, unknown> | null;
  topicsLite: unknown[];
  selectedTopic: string | null;
  topicFlows: unknown[];
};

type CurriculumRun = {
  runId: string;
  mode: QuizMode;
  currentIndex: number;
  answers: Array<number | null>;
  questionTimes: number[];
  elapsedSeconds: number;
  remainingSeconds: number | null;
  attemptedQuestions: number;
  resumeCount: number;
  maxResumes: number;
  resumeRemaining: number;
};

type RunProgressPayload = {
  currentIndex: number;
  answers: Array<number | null>;
  questionTimes: number[];
  elapsedSeconds: number;
  remainingSeconds: number | null;
};

const mockQuestions: SessionQuestion[] = [
  {
    id: 'bio_gen_q1',
    question: 'What is the primary CO2 acceptor in the Calvin cycle?',
    options: ['PEP', 'RuBP', 'OAA', 'PGA'],
    correct: 1,
    explanation: 'RuBP (Ribulose-1,5-bisphosphate) is the primary CO2 acceptor in the Calvin cycle during photosynthesis.',
    chapter: 'Photosynthesis',
    difficulty: 'medium'
  },
  {
    id: 'bio_gen_q2',
    question: 'Which enzyme catalyzes the first step of glycolysis?',
    options: ['Hexokinase', 'Phosphofructokinase', 'Pyruvate kinase', 'Aldolase'],
    correct: 0,
    explanation: 'Hexokinase catalyzes the phosphorylation of glucose to glucose-6-phosphate, the first step of glycolysis.',
    chapter: 'Respiration',
    difficulty: 'easy'
  },
  {
    id: 'bio_gen_q3',
    question: 'What is the site of protein synthesis in a cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosomes', 'Golgi apparatus'],
    correct: 2,
    explanation: 'Ribosomes are the cellular organelles responsible for protein synthesis through translation.',
    chapter: 'Cell Biology',
    difficulty: 'easy'
  }
];

const toOptionText = (option: unknown): string => {
  if (typeof option === 'string') return option;
  if (option && typeof option === 'object') {
    const maybeText = (option as { text?: unknown; label?: unknown }).text;
    if (typeof maybeText === 'string') return maybeText;
    if (maybeText && typeof maybeText === 'object') {
      const en = (maybeText as { en?: unknown }).en;
      if (typeof en === 'string') return en;
    }
    const label = (option as { label?: unknown }).label;
    if (typeof label === 'string') return label;
  }
  return String(option ?? '');
};

const normalizeQuestion = (raw: any, index: number): SessionQuestion | null => {
  const prompt =
    raw?.question?.en ??
    raw?.question ??
    raw?.prompt?.en ??
    raw?.prompt ??
    raw?.text?.en ??
    raw?.text;
  if (!prompt) return null;

  const rawOptions = raw?.options;
  let options: string[] = [];

  if (Array.isArray(rawOptions)) {
    options = rawOptions.map(toOptionText);
  } else if (rawOptions && typeof rawOptions === 'object') {
    options = Object.entries(rawOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => toOptionText(value));
  }

  const explicitCorrect =
    typeof raw?.correct === 'number'
      ? raw.correct
      : typeof raw?.correctAnswer === 'number'
        ? raw.correctAnswer
        : typeof raw?.correctAnswer === 'string'
          ? raw.correctAnswer.toUpperCase().charCodeAt(0) - 65
          : -1;

  const importedCorrectOption =
    typeof raw?.correct_option === 'string'
      ? raw.correct_option.trim().toUpperCase().charCodeAt(0) - 65
      : -1;

  const derivedCorrectFromOptions = Array.isArray(rawOptions)
    ? rawOptions.findIndex((opt: any) => Boolean(opt?.isCorrect))
    : -1;

  const correctAnswerText = typeof raw?.correct_answer === 'string' ? raw.correct_answer.trim().toLowerCase() : '';
  const derivedCorrectFromAnswerText = correctAnswerText
    ? options.findIndex((opt) => String(opt).trim().toLowerCase() === correctAnswerText)
    : -1;

  const correct =
    explicitCorrect >= 0
      ? explicitCorrect
      : importedCorrectOption >= 0
        ? importedCorrectOption
        : derivedCorrectFromOptions >= 0
          ? derivedCorrectFromOptions
          : derivedCorrectFromAnswerText;

  return {
    id: String(raw?.questionId || raw?._id || raw?.id || `q_${index + 1}`),
    question: String(prompt),
    options,
    correct,
    explanation: String(raw?.explanation?.en ?? raw?.explanation ?? ''),
    chapter: String(raw?.chapter || raw?.topic || raw?.chapterId || 'General'),
    difficulty: raw?.difficulty || 'medium',
  };
};

const QuizSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as Partial<{
    mode: QuizMode;
    questionCount: number;
    topic: string;
    subject: string;
    questions: any[];
    curriculumContext: CurriculumContext;
    curriculumRestore: CurriculumRestoreState;
    curriculumRun: CurriculumRun;
  }>;

  const mode: QuizMode = state.mode === 'test' ? 'test' : 'practice';
  const topic = state.topic || 'General';
  const subject = state.subject || 'General';
  const requestedQuestionCount =
    typeof state.questionCount === 'number' && state.questionCount > 0 ? state.questionCount : 25;
  const curriculumContext = state.curriculumContext;
  const curriculumRestore = state.curriculumRestore;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(SessionAnswer | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(mode === 'test' ? requestedQuestionCount * 90 : null);
  const [startTime, setStartTime] = useState(Date.now());
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [runMeta, setRunMeta] = useState<CurriculumRun | null>(state.curriculumRun || null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const saveInFlight = useRef(false);
  const inFlightSavePromiseRef = useRef<Promise<void> | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingProgressRef = useRef<RunProgressPayload | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  const attemptedCount = useMemo(
    () => answers.filter((a) => a?.selected !== null && a?.selected !== undefined).length,
    [answers]
  );

  const hasProgress = attemptedCount > 0 || currentIndex > 0;
  const shouldForceDiscardForTest =
    mode === 'test' && Number(runMeta?.resumeCount || 0) >= Number(runMeta?.maxResumes || 0) && hasProgress;

  const buildProgressPayload = () => {
    const answerIndexes = questions.map((_, idx) => answers[idx]?.selected ?? null);
    const questionTimes = questions.map((_, idx) => Number(answers[idx]?.timeTaken || 0));
    const elapsedSeconds = answers.reduce((sum, a) => sum + Number(a?.timeTaken || 0), 0);
    return {
      currentIndex,
      answers: answerIndexes,
      questionTimes,
      elapsedSeconds,
      remainingSeconds: mode === 'test' ? timeLeft : null,
    };
  };

  const navigateBackToOrigin = () => {
    if (curriculumRestore) {
      navigate('/app/curriculum-browser', { state: { curriculumRestore, refreshRoadmap: true } });
      return;
    }
    navigate(-1);
  };

  const handleRunNotActive = () => {
    setSessionError('This quiz run is no longer active (expired, submitted, or abandoned). Please start again.');
  };

  const saveProgress = async (options?: { keepalive?: boolean; force?: boolean }) => {
    if (!runMeta?.runId) return;

    if (saveInFlight.current) {
      if (!options?.force) return;
      await inFlightSavePromiseRef.current;
    }

    const payload = pendingProgressRef.current || buildProgressPayload();
    if (options?.keepalive) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/v1/curriculum/runs/${runMeta.runId}/progress`, {
          method: 'PUT',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } catch {
        // ignore keepalive failures
      }
      return;
    }

    pendingProgressRef.current = payload;
    const savePromise = (async () => {
      saveInFlight.current = true;
      try {
        const res = await apiService.curriculum.saveRunProgress(runMeta.runId, payload);
        const nextRun = res.data?.data?.run;
        if (nextRun) setRunMeta(nextRun);
        pendingProgressRef.current = null;
      } catch (error) {
        const err = error as AxiosError<{ error?: string }>;
        if (err.response?.status === 404 || err.response?.status === 410) {
          handleRunNotActive();
        }
      } finally {
        saveInFlight.current = false;
        inFlightSavePromiseRef.current = null;
      }
    })();
    inFlightSavePromiseRef.current = savePromise;
    await savePromise;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const rawQuestions = Array.isArray(state.questions) && state.questions.length > 0
          ? state.questions
          : (await apiService.questions.getRandomQuestions({ subject, topic, limit: requestedQuestionCount })).data?.data || [];

        const normalized = Array.isArray(rawQuestions)
          ? rawQuestions
              .map((item: any, idx: number) => normalizeQuestion(item, idx))
              .filter((q: SessionQuestion | null): q is SessionQuestion => q !== null && q.options.length > 0)
          : [];

        const finalQuestions = normalized.length > 0 ? normalized.slice(0, requestedQuestionCount) : mockQuestions;

        if (runMeta?.runId) {
          const restoredAnswers = finalQuestions.map((q, idx) => {
            const selected = runMeta.answers?.[idx] ?? null;
            if (selected === null || selected === undefined) return null;
            return {
              questionId: q.id,
              selected,
              correct: selected === q.correct,
              timeTaken: Number(runMeta.questionTimes?.[idx] || 0),
              chapter: q.chapter || 'General',
            } as SessionAnswer;
          });

          setQuestions(finalQuestions);
          setAnswers(restoredAnswers);
          const restoredIndex = Math.max(0, Math.min(finalQuestions.length - 1, Number(runMeta.currentIndex || 0)));
          setCurrentIndex(restoredIndex);
          const restoredSelected = restoredAnswers[restoredIndex]?.selected ?? null;
          setSelectedAnswer(restoredSelected);
          setShowExplanation(mode === 'practice' && restoredSelected !== null);
          setStartTime(Date.now() - Number(restoredAnswers[restoredIndex]?.timeTaken || 0) * 1000);
          if (mode === 'test') {
            const fallback = finalQuestions.length * 90;
            setTimeLeft(runMeta.remainingSeconds === null || runMeta.remainingSeconds === undefined ? fallback : Number(runMeta.remainingSeconds));
          }
          setLoading(false);
          return;
        }

        setQuestions(finalQuestions);
        setAnswers(new Array(finalQuestions.length).fill(null));
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setStartTime(Date.now());
        if (mode === 'test') setTimeLeft(finalQuestions.length * 90);
      } catch (error) {
        console.error('Failed to load quiz questions:', error);
        setQuestions(mockQuestions);
        setAnswers(new Array(mockQuestions.length).fill(null));
        if (mode === 'test') setTimeLeft(mockQuestions.length * 90);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [mode, requestedQuestionCount, subject, topic]);

  useEffect(() => {
    if (!loading && mode === 'test' && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
    if (!loading && timeLeft === 0) {
      submitQuiz();
    }
  }, [timeLeft, mode, loading]);

  useEffect(() => {
    if (!runMeta?.runId || loading) return;
    if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    autosaveTimerRef.current = setInterval(() => {
      saveProgress();
    }, 10000);

    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [runMeta?.runId, loading, currentIndex, answers]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!runMeta?.runId || !hasProgress) return;
      e.preventDefault();
      e.returnValue = '';
      saveProgress({ keepalive: true });
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [runMeta?.runId, hasProgress, currentIndex, answers, timeLeft]);

  const handleSelect = (index: number) => {
    if (!currentQuestion) return;
    if (selectedAnswer !== null && mode === 'practice') return;

    setSelectedAnswer(index);

    const isCorrect = index === currentQuestion.correct;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const answer: SessionAnswer = {
      questionId: currentQuestion.id,
      selected: index,
      correct: isCorrect,
      timeTaken,
      chapter: currentQuestion.chapter || 'General',
    };

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });

    if (mode === 'practice') setShowExplanation(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      submitQuiz();
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(answers[currentIndex + 1]?.selected ?? null);
    setShowExplanation(false);
    setStartTime(Date.now());
    await saveProgress({ force: true });
  };

  const submitQuiz = async () => {
    const finalizedAnswers: SessionAnswer[] = questions.map((question, idx) => {
      const answer = answers[idx];
      if (answer) return answer;
      return {
        questionId: question.id,
        selected: null,
        correct: false,
        timeTaken: 0,
        chapter: question.chapter || 'General',
      };
    });

    await saveProgress({ force: true });

    navigate('/app/quiz-results', {
      state: {
        mode,
        answers: finalizedAnswers,
        totalQuestions,
        subject,
        topic,
        curriculumContext,
        curriculumRunId: runMeta?.runId,
        remainingSeconds: mode === 'test' ? timeLeft : null,
      },
    });
  };

  const onBackPressed = () => {
    if (!hasProgress) {
      navigateBackToOrigin();
      return;
    }
    setLeaveOpen(true);
  };

  const onSaveAndExit = async () => {
    if (shouldForceDiscardForTest) {
      await onDiscardAttempt();
      return;
    }
    await saveProgress({ force: true });
    setLeaveOpen(false);
    navigateBackToOrigin();
  };

  const onDiscardAttempt = async () => {
    if (runMeta?.runId) {
      try {
        await apiService.curriculum.abandonRun(runMeta.runId);
      } catch {
        // non-blocking
      }
    }
    setLeaveOpen(false);
    navigateBackToOrigin();
  };

  const getOptionStyle = (index: number) => {
    if (mode === 'test' && selectedAnswer === null) return 'bg-card border-border hover:border-primary/50';

    if (mode === 'practice') {
      if (selectedAnswer === null) return 'bg-card border-border hover:border-primary/50';
      if (index === currentQuestion.correct) return 'bg-success/20 border-success';
      if (index === selectedAnswer && index !== currentQuestion.correct) return 'bg-destructive/20 border-destructive animate-shake';
      return 'bg-card border-border opacity-50';
    }

    if (index === selectedAnswer) return 'bg-primary/20 border-primary';
    return 'bg-card border-border';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="nf-card text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">No quiz questions available</h2>
          <p className="text-sm text-muted-foreground mb-4">Please start a new quiz from the quiz setup page.</p>
          <button onClick={() => navigate('/app/quiz-start')} className="nf-btn-primary w-full">Go to Quiz Start</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {sessionError && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {sessionError}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackPressed}
              className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Q{currentIndex + 1}/{totalQuestions}</h1>
              <p className="text-xs text-muted-foreground">{currentQuestion.chapter}</p>
            </div>
          </div>

          {mode === 'test' && timeLeft !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/20 border border-warning/30">
              <Clock className="w-4 h-4 text-warning-foreground" />
              <span className="font-bold text-sm text-warning-foreground">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="nf-progress-bar mb-6">
          <motion.div
            className="nf-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="nf-card mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-lg border ${
                currentQuestion.difficulty === 'easy' ? 'bg-success/10 border-success/30 text-success' :
                currentQuestion.difficulty === 'medium' ? 'bg-warning/10 border-warning/30 text-warning-foreground' :
                'bg-destructive/10 border-destructive/30 text-destructive'
              }`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
              {mode === 'test' && (
                <button className="text-muted-foreground hover:text-foreground">
                  <Flag className="w-5 h-5" />
                </button>
              )}
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-5">{currentQuestion.question}</h2>

            <div className="space-y-3 w-full">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={mode === 'practice' && selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all block ${getOptionStyle(index)}`}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium text-foreground flex-1">{option}</span>
                    {mode === 'practice' && selectedAnswer !== null && index === currentQuestion.correct && (
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                    )}
                    {mode === 'practice' && selectedAnswer === index && index !== currentQuestion.correct && (
                      <X className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {mode === 'practice' && showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="nf-card bg-muted/30 mb-6"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Explanation</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}

        {selectedAnswer !== null && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="nf-btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Save to resume later, or discard this attempt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            {!shouldForceDiscardForTest && (
              <AlertDialogAction onClick={onSaveAndExit} className="w-full sm:w-auto">
                Save & Exit
              </AlertDialogAction>
            )}
            <AlertDialogAction
              onClick={onDiscardAttempt}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Attempt
            </AlertDialogAction>
            <AlertDialogCancel className="w-full sm:w-auto">Continue Quiz</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizSession;
