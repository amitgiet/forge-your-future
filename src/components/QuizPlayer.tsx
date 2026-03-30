import React, { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import QuizInstructionScreen from './QuizInstructionScreen';

export interface QuizQuestion {
  _id?: string;
  id?: string;
  question: string;
  type: 'mcq' | 'multiple_select' | 'numerical';
  options?: string[];
  correctAnswer?: number | number[] | null;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  marks?: number;
}

export interface QuizPlayerProps {
  questions: QuizQuestion[];
  title?: string;
  initialAnswers?: (number | number[] | null)[];
  onSubmit: (data: { answers: (number | number[] | null)[]; timeTaken: number }) => void;
  onAnswerChange?: (questionIndex: number, answer: number | number[] | null) => void;
  showPalette?: boolean;
  showTimer?: boolean;
  duration?: number; // in seconds
  allowReviewMarking?: boolean;
  readOnly?: boolean; // for review/results mode
  config?: {
    showExplanations?: boolean;
    showDifficulty?: boolean;
    showMarks?: boolean;
  };
  onNavigate?: (questionIndex: number) => void;
  instructionContent?: ReactNode;
  instructionStartLabel?: string;
}

export interface QuestionStatus {
  answered: boolean;
  markedForReview: boolean;
  correct?: boolean;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  title = 'Quiz',
  initialAnswers = [],
  onSubmit,
  onAnswerChange,
  showPalette = true,
  showTimer = false,
  duration = 0,
  allowReviewMarking = true,
  readOnly = false,
  config = {},
  onNavigate,
  instructionContent,
  instructionStartLabel,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | number[] | null)[]>(
    initialAnswers.length > 0
      ? initialAnswers
      : new Array(questions.length).fill(null)
  );
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [sessionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const { showExplanations = false, showDifficulty = true, showMarks = false } = config;

  // Timer effect
  useEffect(() => {
    if (!showTimer || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Get question status for palette
  const getQuestionStatus = (index: number): QuestionStatus => ({
    answered: answers[index] !== null,
    markedForReview: markedForReview.has(index),
    correct: readOnly ? checkAnswer(index) : undefined,
  });

  // Check if answer is correct (for read-only/results mode)
  const checkAnswer = (index: number): boolean => {
    const q = questions[index];
    const answer = answers[index];

    if (q.type === 'multiple_select') {
      if (!Array.isArray(answer) || !Array.isArray(q.correctAnswer)) return false;
      return (
        answer.length === q.correctAnswer.length &&
        answer.every((a) => (q.correctAnswer as number[]).includes(a))
      );
    } else if (q.type === 'numerical') {
      return Math.abs((answer as number) - (q.correctAnswer as number)) < 0.01;
    } else {
      return answer === q.correctAnswer;
    }
  };

  const handleAnswerSelect = (answerValue: number | number[]) => {
    if (readOnly) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerValue;
    setAnswers(newAnswers);

    if (onAnswerChange) {
      onAnswerChange(currentQuestionIndex, answerValue);
    }
  };

  const handleMarkForReview = () => {
    if (readOnly) return;

    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestionIndex)) {
      newMarked.delete(currentQuestionIndex);
    } else {
      newMarked.add(currentQuestionIndex);
    }
    setMarkedForReview(newMarked);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      if (onNavigate) onNavigate(newIndex);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      if (onNavigate) onNavigate(newIndex);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    if (onNavigate) onNavigate(index);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const timeTaken = Math.floor((Date.now() - sessionStartTime) / 1000);
    setIsSubmitting(true);

    // Preprocess answers for submission
    const processedAnswers = answers.map((ans, idx) => {
      const q = questions[idx];
      if (q.type === 'multiple_select') {
        return Array.isArray(ans) ? ans.map(Number) : [];
      } else if (q.type === 'numerical') {
        return ans === null ? null : Number(ans);
      } else {
        return typeof ans === 'number' ? ans : null;
      }
    });

    try {
      await Promise.resolve(
        onSubmit({
          answers: processedAnswers,
          timeTaken,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'hard':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-warning/20 text-warning';
    }
  };

  const getPaletteStatusColor = (status: QuestionStatus, index: number) => {
    if (index === currentQuestionIndex) return 'ring-2 ring-primary';
    if (readOnly) {
      return status.correct
        ? 'bg-success/20 border-success/50'
        : status.answered
          ? 'bg-destructive/20 border-destructive/50'
          : 'bg-muted/50 border-muted';
    }
    if (status.markedForReview) return 'bg-warning/20 border-warning/50';
    if (status.answered) return 'bg-primary/20 border-primary/50';
    return 'bg-muted/50 border-muted';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-2xl mx-auto">
        {/* Quiz Instruction Screen */}
        <AnimatePresence mode="wait">
          {!quizStarted && (
            <QuizInstructionScreen
              title={title}
              totalQuestions={questions.length}
              totalMarks={questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
              questionTypes={Array.from(new Set(questions.map(q => 
                q.type === 'mcq' ? 'MCQ' : q.type === 'multiple_select' ? 'Multi-Select' : 'Numerical'
              )))}
              showTimer={showTimer}
              duration={duration}
              onStart={() => setQuizStarted(true)}
              startLabel={instructionStartLabel}
            >
              {instructionContent}
            </QuizInstructionScreen>
          )}

          {/* Quiz Content */}
          {quizStarted && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>

                  {showTimer && (
                    <div
                      className={`text-sm font-bold flex items-center gap-1 ${
                        timeRemaining < 60 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>

              {/* Question Card */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="nf-card mb-6"
              >
                {/* Question Text */}
                <h2 className="text-lg font-semibold text-foreground mb-6 whitespace-pre-wrap">
                  {currentQuestion?.question}
                </h2>

                {/* Difficulty & Marks */}
              <div className="flex items-center gap-2 mb-6">
                {showDifficulty && currentQuestion?.difficulty && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(
                      currentQuestion.difficulty
                    )}`}
                  >
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                )}
                {showMarks && currentQuestion?.marks && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-card border border-border text-foreground">
                    {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Answer Input */}
          {currentQuestion?.type === 'numerical' ? (
            <div className="mb-6">
              <label
                htmlFor="numerical-answer"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                Enter your answer:
              </label>
              <input
                id="numerical-answer"
                type="number"
                step="any"
                disabled={readOnly}
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                value={
                  Array.isArray(answers[currentQuestionIndex])
                    ? ''
                    : answers[currentQuestionIndex] !== null &&
                        answers[currentQuestionIndex] !== undefined
                      ? answers[currentQuestionIndex]
                      : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  handleAnswerSelect(val === '' ? null : Number(val));
                }}
                placeholder="Type your answer"
              />
            </div>
          ) : currentQuestion?.type === 'multiple_select' ? (
            <div className="space-y-3 mb-6">
              {currentQuestion?.options?.map((option: string, index: number) => {
                const isSelected = Array.isArray(answers[currentQuestionIndex])
                   ? (answers[currentQuestionIndex] as number[]).includes(index)
                  : false;
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      const current = (answers[currentQuestionIndex] as number[]) || [];
                      const newAnswer = isSelected
                        ? current.filter((i) => i !== index)
                        : [...current, index];
                      handleAnswerSelect(newAnswer.length > 0 ? newAnswer : null);
                    }}
                    disabled={readOnly}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 border-current flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-primary' : ''
                        }`}
                      >
                        {isSelected && <span className="text-xs text-primary-foreground">✓</span>}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {currentQuestion?.options?.map((option: string, index: number) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={readOnly}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                    answers[currentQuestionIndex] === index
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Explanation (in read-only mode) */}
          {readOnly && showExplanations && currentQuestion?.explanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-card border border-border/50 flex gap-3"
            >
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentQuestion.explanation}</p>
              </div>
            </motion.div>
          )}

          {/* Result indicator (in read-only mode) */}
          {readOnly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                checkAnswer(currentQuestionIndex)
                  ? 'bg-success/10 border-success/30'
                  : 'bg-destructive/10 border-destructive/30'
              }`}
            >
              {checkAnswer(currentQuestionIndex) ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-semibold text-success">Correct</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    Incorrect {currentQuestion?.correctAnswer !== null && `(Answer: ${currentQuestion?.correctAnswer})`}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Review Marking Button */}
        {allowReviewMarking && !readOnly && (
          <motion.button
            onClick={handleMarkForReview}
            className="w-full mb-6 py-2 px-4 rounded-lg border border-warning/50 bg-warning/10 text-warning font-semibold flex items-center justify-center gap-2 hover:bg-warning/20 transition"
          >
            <Flag className={`w-4 h-4 ${markedForReview.has(currentQuestionIndex) ? 'fill-current' : ''}`} />
            {markedForReview.has(currentQuestionIndex) ? 'Marked for Review' : 'Mark for Review'}
          </motion.button>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <motion.button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-card border-2 border-border rounded-lg text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </motion.button>

          {currentQuestionIndex === questions.length - 1 ? (
            <motion.button
              onClick={handleSubmit}
              disabled={readOnly || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-bold"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Palette */}
        {showPalette && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Grid3x3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Question Palette</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleQuestionSelect(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full aspect-square rounded-lg border-2 font-semibold text-sm transition-all ${getPaletteStatusColor(
                      status,
                      index
                    )}`}
                  >
                    {index + 1}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              {readOnly ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success/20 border border-success/50" />
                    <span className="text-muted-foreground">Answered Correctly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/50" />
                    <span className="text-muted-foreground">Answered Incorrectly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted/50 border border-muted" />
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/20 border border-primary/50" />
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-warning/20 border border-warning/50" />
                    <span className="text-muted-foreground">Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted/50 border border-muted" />
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPlayer;
