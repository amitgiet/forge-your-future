import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Lightbulb, ChevronRight, Check, X, Flag } from 'lucide-react';

const mockQuestions = [
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

const QuizSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, questionCount, topic, subject } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(mode === 'test' ? questionCount * 90 : null);
  const [startTime] = useState(Date.now());

  const currentQuestion = mockQuestions[currentIndex % mockQuestions.length];
  const isLastQuestion = currentIndex >= questionCount - 1;

  // Timer for test mode
  useEffect(() => {
    if (mode === 'test' && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      submitQuiz();
    }
  }, [timeLeft, mode]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null && mode === 'practice') return;
    
    setSelectedAnswer(index);
    
    const isCorrect = index === currentQuestion.correct;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    setAnswers([...answers, {
      questionId: currentQuestion.id,
      selected: index,
      correct: isCorrect,
      timeTaken,
      chapter: currentQuestion.chapter
    }]);

    if (mode === 'practice') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitQuiz();
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const submitQuiz = () => {
    navigate('/quiz-results', {
      state: {
        mode,
        answers,
        totalQuestions: questionCount,
        subject,
        topic
      }
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
                Q{currentIndex + 1}/{questionCount}
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
            animate={{ width: `${((currentIndex + 1) / questionCount) * 100}%` }}
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
        {(mode === 'practice' && selectedAnswer !== null) || (mode === 'test' && selectedAnswer !== null) && (
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
