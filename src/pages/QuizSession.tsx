import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Lightbulb, ChevronRight, Check, X, Flag } from 'lucide-react';
import { apiService } from '@/lib/apiService';

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
  const prompt = raw?.question || raw?.prompt || raw?.text;
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

  const derivedCorrectFromOptions = Array.isArray(rawOptions)
    ? rawOptions.findIndex((opt: any) => Boolean(opt?.isCorrect))
    : -1;

  const correct = explicitCorrect >= 0 ? explicitCorrect : derivedCorrectFromOptions;

  return {
    id: String(raw?._id || raw?.id || `q_${index + 1}`),
    question: String(prompt),
    options,
    correct,
    explanation: raw?.explanation || '',
    chapter: raw?.chapter || raw?.topic || 'General',
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
  }>;

  const mode: QuizMode = state.mode === 'test' ? 'test' : 'practice';
  const topic = state.topic || 'General';
  const subject = state.subject || 'General';
  const requestedQuestionCount =
    typeof state.questionCount === 'number' && state.questionCount > 0 ? state.questionCount : 25;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(SessionAnswer | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(mode === 'test' ? requestedQuestionCount * 90 : null);
  const [startTime, setStartTime] = useState(Date.now());
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await apiService.questions.getRandomQuestions({
          subject,
          topic,
          limit: requestedQuestionCount,
        });
        const rawQuestions = response?.data?.data || [];
        const normalized = Array.isArray(rawQuestions)
          ? rawQuestions
              .map((item: any, idx: number) => normalizeQuestion(item, idx))
              .filter((q: SessionQuestion | null): q is SessionQuestion => q !== null && q.options.length > 0)
          : [];

        const finalQuestions =
          normalized.length > 0 ? normalized.slice(0, requestedQuestionCount) : mockQuestions;
        setQuestions(finalQuestions);
        setAnswers(new Array(finalQuestions.length).fill(null));
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setStartTime(Date.now());
        if (mode === 'test') {
          setTimeLeft(finalQuestions.length * 90);
        }
      } catch (error) {
        console.error('Failed to load quiz questions:', error);
        setQuestions(mockQuestions);
        setAnswers(new Array(mockQuestions.length).fill(null));
        if (mode === 'test') {
          setTimeLeft(mockQuestions.length * 90);
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [mode, requestedQuestionCount, subject, topic]);

  // Timer for test mode
  useEffect(() => {
    if (!loading && mode === 'test' && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (!loading && timeLeft === 0) {
      submitQuiz();
    }
  }, [timeLeft, mode, loading]);

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

    if (mode === 'practice') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitQuiz();
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1]?.selected ?? null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  };

  const submitQuiz = () => {
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

    navigate('/quiz-results', {
      state: {
        mode,
        answers: finalizedAnswers,
        totalQuestions,
        subject,
        topic,
      },
    });
  };

  const getOptionStyle = (index: number) => {
    if (mode === 'test' && selectedAnswer === null) {
      return 'bg-card border-border hover:border-primary/50';
    }

    if (mode === 'practice') {
      if (selectedAnswer === null) {
        return 'bg-card border-border hover:border-primary/50';
      }
      if (index === currentQuestion.correct) {
        return 'bg-success/20 border-success';
      }
      if (index === selectedAnswer && index !== currentQuestion.correct) {
        return 'bg-destructive/20 border-destructive animate-shake';
      }
      return 'bg-card border-border opacity-50';
    }

    // Test mode - just show selected
    if (index === selectedAnswer) {
      return 'bg-primary/20 border-primary';
    }
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
          <p className="text-sm text-muted-foreground mb-4">
            Please start a new quiz from the quiz setup page.
          </p>
          <button onClick={() => navigate('/quiz-start')} className="nf-btn-primary w-full">
            Go to Quiz Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Q{currentIndex + 1}/{totalQuestions}
              </h1>
              <p className="text-xs text-muted-foreground">{currentQuestion.chapter}</p>
            </div>
          </div>

          {mode === 'test' && timeLeft !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/20 border border-warning/30">
              <Clock className="w-4 h-4 text-warning-foreground" />
              <span className="font-bold text-sm text-warning-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="nf-progress-bar mb-6">
          <motion.div
            className="nf-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Card */}
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

            <h2 className="text-lg font-semibold text-foreground mb-5">
              {currentQuestion.question}
            </h2>

            {/* Options */}
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

        {/* Explanation (Practice Mode Only) */}
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
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Button */}
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
    </div>
  );
};

export default QuizSession;
