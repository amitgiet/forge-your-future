import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Lightbulb, ChevronRight, Flame, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const mockQuestions = [
  {
    id: 1,
    question: 'During which phase of the cell cycle does DNA replication occur?',
    options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'],
    correct: 1,
    explanation: 'DNA replication occurs during the S (Synthesis) phase of interphase, where the cell duplicates its chromosomal DNA.',
  },
  {
    id: 2,
    question: 'Which structure is responsible for separating sister chromatids during anaphase?',
    options: ['Centrioles', 'Spindle fibers', 'Nuclear envelope', 'Cell membrane'],
    correct: 1,
    explanation: 'Spindle fibers (microtubules) attach to kinetochores and pull sister chromatids apart during anaphase.',
  },
  {
    id: 3,
    question: 'What is the ploidy of cells produced by meiosis I?',
    options: ['Diploid', 'Haploid', 'Triploid', 'Tetraploid'],
    correct: 1,
    explanation: 'Meiosis I is the reduction division where homologous chromosomes separate, resulting in haploid cells.',
  },
];

const Quiz = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  const question = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    
    if (index === question.correct) {
      setStreak((prev) => prev + 1);
      setShowStreakPopup(true);
      setTimeout(() => setShowStreakPopup(false), 1500);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      navigate('/dashboard');
    }
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
          <button onClick={() => navigate('/dashboard')} className="nf-btn-icon !w-10 !h-10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="nf-streak">
              <Flame className="w-4 h-4" />
              {streak}
            </div>
            <div className="nf-xp-counter">
              <Sparkles className="w-3.5 h-3.5" />
              +{streak * 25} XP
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </span>
            <span className="nf-badge nf-badge-outline text-xs">
              Cell Division
            </span>
          </div>
          <div className="nf-progress-bar">
            <motion.div
              className="nf-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="nf-card mb-4"
          >
            <h2 className="nf-heading text-lg text-foreground">
              {question.question}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {question.options.map((option, index) => {
            let optionClass = 'nf-option';
            if (selectedAnswer !== null) {
              if (index === question.correct) {
                optionClass = 'nf-option nf-option-correct';
              } else if (index === selectedAnswer && index !== question.correct) {
                optionClass = 'nf-option nf-option-incorrect animate-shake';
              }
            }

            return (
              <motion.button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={selectedAnswer !== null}
                className={optionClass}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <div className={`nf-level-badge ${
                  selectedAnswer !== null && index === question.correct
                    ? 'bg-success/10 border-success text-success'
                    : selectedAnswer === index && index !== question.correct
                    ? 'bg-destructive/10 border-destructive text-destructive'
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-semibold text-foreground">{option}</span>
                {selectedAnswer !== null && index === question.correct && (
                  <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                )}
                {selectedAnswer === index && index !== question.correct && (
                  <XCircle className="w-5 h-5 text-destructive ml-auto" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="nf-card bg-muted/30 mb-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="nf-btn-outline flex-1"
            >
              <Lightbulb className="w-5 h-5" />
              {t('quiz.explain')}
            </button>
            <button
              onClick={handleNext}
              className="nf-btn-primary flex-1"
            >
              {currentQuestion < mockQuestions.length - 1 ? t('quiz.next') : 'Finish'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Streak popup */}
        <AnimatePresence>
          {showStreakPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-gradient-to-r from-primary to-warning text-white px-8 py-4 rounded-2xl font-bold text-xl flex items-center gap-3 shadow-glow-primary">
                <Flame className="w-7 h-7" />
                {t('quiz.streakUp')} 🔥
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default Quiz;
