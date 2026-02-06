import { Brain, ArrowLeft, CheckCircle2, XCircle, Lightbulb, Trophy, Target, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRevision, RevisionQuestion } from '@/contexts/RevisionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNav from '@/components/BottomNav';

const LEVEL_COLORS = [
  '',
  'bg-destructive/10 text-destructive border-destructive/30',
  'bg-primary/10 text-primary border-primary/30',
  'bg-warning/10 text-warning-foreground border-warning/30',
  'bg-secondary/10 text-secondary border-secondary/30',
  'bg-accent/10 text-accent border-accent/30',
  'bg-success/10 text-success border-success/30',
  'bg-success/20 text-success border-success/50',
];

const LEVEL_LABELS = ['', 'New', 'Learning', 'Reviewing', 'Familiar', 'Strong', 'Expert', 'Mastered'];

const Revision = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    getDueQuestions, 
    answerQuestion, 
    getStats, 
    dailyLimit, 
    answeredToday, 
    isPro 
  } = useRevision();

  const [currentQuestion, setCurrentQuestion] = useState<RevisionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dueQuestions, setDueQuestions] = useState<RevisionQuestion[]>([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const stats = getStats();
  const canAnswer = isPro || answeredToday < dailyLimit;
  const remainingToday = Math.max(0, dailyLimit - answeredToday);

  useEffect(() => {
    const due = getDueQuestions();
    setDueQuestions(due);
    if (due.length > 0 && !currentQuestion) {
      setCurrentQuestion(due[0]);
    }
  }, []);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null || !canAnswer) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion?.correct;
    if (isCorrect) {
      setSessionCorrect((prev) => prev + 1);
    }

    if (currentQuestion) {
      answerQuestion(currentQuestion.id, isCorrect);
    }
  };

  const handleNext = () => {
    const remaining = dueQuestions.filter((q) => q.id !== currentQuestion?.id);
    setDueQuestions(remaining);

    if (remaining.length > 0) {
      setCurrentQuestion(remaining[0]);
    } else {
      setCurrentQuestion(null);
    }

    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="nf-btn-icon !w-10 !h-10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="nf-heading text-xl text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-secondary" />
                NEURONZ
              </h1>
              <p className="text-xs text-muted-foreground">Spaced Revision System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="nf-badge nf-badge-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sessionCorrect}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card text-center py-4"
          >
            <div className="nf-stat-icon nf-stat-icon-primary mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-foreground">{stats.dueToday}</p>
            <p className="text-xs text-muted-foreground font-medium">Due Today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nf-card text-center py-4"
          >
            <div className="nf-stat-icon nf-stat-icon-success mx-auto mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-foreground">{stats.masteredCount}</p>
            <p className="text-xs text-muted-foreground font-medium">Mastered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nf-card text-center py-4"
          >
            <div className="nf-stat-icon nf-stat-icon-secondary mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-foreground">L{Math.round(stats.averageLevel)}</p>
            <p className="text-xs text-muted-foreground font-medium">Avg Level</p>
          </motion.div>
        </div>

        {/* Daily Limit Banner */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="nf-card mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`nf-stat-icon ${canAnswer ? 'nf-stat-icon-success' : 'nf-stat-icon-primary'}`}>
                  {canAnswer ? (
                    <Target className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {canAnswer ? `${remainingToday} revisions left` : 'Daily limit reached'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {answeredToday}/{dailyLimit} completed today
                  </p>
                </div>
              </div>
              {!canAnswer && (
                <button className="nf-btn-secondary !w-auto !min-h-[36px] px-4 text-sm">
                  Go Pro
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Question Card */}
        {currentQuestion ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="nf-card"
            >
              {/* Level Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`nf-badge text-xs ${LEVEL_COLORS[currentQuestion.level]}`}>
                  L{currentQuestion.level} • {LEVEL_LABELS[currentQuestion.level]}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{currentQuestion.topic}</span>
              </div>

              {/* Question */}
              <h2 className="nf-heading text-lg text-foreground mb-5">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let optionClass = 'nf-option';
                  if (showResult) {
                    if (index === currentQuestion.correct) {
                      optionClass = 'nf-option nf-option-correct';
                    } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                      optionClass = 'nf-option nf-option-incorrect';
                    }
                  } else if (selectedAnswer === index) {
                    optionClass = 'nf-option nf-option-selected';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSelect(index)}
                      disabled={selectedAnswer !== null || !canAnswer}
                      className={optionClass}
                      whileTap={selectedAnswer === null && canAnswer ? { scale: 0.98 } : {}}
                    >
                      <div className={`nf-level-badge ${
                        showResult && index === currentQuestion.correct
                          ? 'bg-success/10 border-success text-success'
                          : showResult && index === selectedAnswer
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-semibold text-foreground">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 nf-card ${
                    selectedAnswer === currentQuestion.correct
                      ? 'border-success bg-success/5'
                      : 'border-destructive bg-destructive/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedAnswer === currentQuestion.correct ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                    <div>
                      <p className={`font-bold ${
                        selectedAnswer === currentQuestion.correct ? 'text-success' : 'text-destructive'
                      }`}>
                        {selectedAnswer === currentQuestion.correct ? 'Correct! +25 XP' : 'Incorrect'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAnswer === currentQuestion.correct
                          ? `Level ${currentQuestion.level} → ${Math.min(currentQuestion.level + 1, 7)}`
                          : `Level stays at ${Math.max(currentQuestion.level - 1, 1)}`
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 nf-card bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex gap-3"
                >
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="nf-btn-outline flex-1"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Explain
                  </button>
                  <button
                    onClick={handleNext}
                    className="nf-btn-primary flex-1"
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="nf-card-achievement text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-success/10 border-2 border-success/30 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h3 className="nf-heading text-xl text-foreground mb-2">All caught up! 🎉</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              No questions due for revision right now. Check back later or take a quiz to add more.
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="nf-btn-primary !w-auto px-8 mx-auto"
            >
              Take a Quiz
            </button>
          </motion.div>
        )}

        {/* Level Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 nf-card"
        >
          <h3 className="nf-heading text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-secondary" />
            Level Intervals
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((level) => (
              <div key={level} className="text-center">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold border-2 ${LEVEL_COLORS[level]}`}>
                  L{level}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1 font-medium">
                  {level === 1 && '24h'}
                  {level === 2 && '3d'}
                  {level === 3 && '5d'}
                  {level === 4 && '7d'}
                  {level === 5 && '14d'}
                  {level === 6 && '30d'}
                  {level === 7 && '60d'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Revision;
