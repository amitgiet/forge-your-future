import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface QuizInstructionScreenProps {
  title: string;
  totalQuestions: number;
  totalMarks: number;
  questionTypes: string[];
  showTimer?: boolean;
  duration?: number;
  onStart: () => void;
  children?: ReactNode;
  startLabel?: string;
}

const QuizInstructionScreen: React.FC<QuizInstructionScreenProps> = ({
  title,
  totalQuestions,
  totalMarks,
  questionTypes,
  showTimer = false,
  duration = 0,
  onStart,
  children,
  startLabel = 'Start Quiz',
}) => {
  return (
    <motion.div
      key="instructions"
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
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      </motion.div>

      {/* Quiz Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="nf-card mb-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-6">Quiz Details</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Questions */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-primary mb-1">{totalQuestions}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </div>

          {/* Total Marks */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-primary mb-1">{totalMarks}</div>
            <div className="text-sm text-muted-foreground">Total Marks</div>
          </div>

          {/* Duration */}
          {showTimer && duration > 0 && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.floor(duration / 60)}
              </div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
          )}

          {/* Question Types */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-sm font-bold text-primary mb-1">
              {questionTypes.join(', ')}
            </div>
            <div className="text-sm text-muted-foreground">Question Types</div>
          </div>
        </div>
      </motion.div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="nf-card mb-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Instructions</h2>

        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-primary font-bold">1.</span>
            <span className="text-muted-foreground">Read each question carefully before answering.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">2.</span>
            <span className="text-muted-foreground">For MCQ questions, select one correct answer.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">3.</span>
            <span className="text-muted-foreground">For Multiple Select questions, you can select multiple correct answers.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">4.</span>
            <span className="text-muted-foreground">Use the Question Palette to navigate between questions quickly.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">5.</span>
            <span className="text-muted-foreground">You can mark questions for review and return to them later.</span>
          </li>
          {showTimer && (
            <li className="flex gap-3">
              <span className="text-primary font-bold">6.</span>
              <span className="text-muted-foreground">You have limited time to complete the quiz. Time will be monitored.</span>
            </li>
          )}
          <li className="flex gap-3">
            <span className="text-primary font-bold">{showTimer ? '7' : '6'}.</span>
            <span className="text-muted-foreground">Once submitted, your quiz cannot be edited.</span>
          </li>
        </ul>
      </motion.div>

      {children ? <div className="mb-6">{children}</div> : null}

      {/* Start Button */}
      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-bold text-lg hover:shadow-lg transition-all"
      >
        {startLabel}
      </motion.button>
    </motion.div>
  );
};

export default QuizInstructionScreen;
