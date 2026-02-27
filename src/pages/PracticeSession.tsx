import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, X, Lightbulb, ChevronRight, Trophy, Lock, CheckCircle } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const PracticeSession = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    loadTodaySchedule();
  }, [challengeId]);

  const loadTodaySchedule = async () => {
    try {
      const response = await apiService.challenges.getTodaySchedule(challengeId!);
      const data = response.data.data;
      
      setChallenge(data.challenge);
      setTodaySchedule(data.todaySchedule);
      
      if (data.todaySchedule && !data.isCompleted) {
        const currentQuiz = data.todaySchedule.quizzes.find((q: any) => !q.isCompleted);
        if (currentQuiz) {
          await loadQuizzes(currentQuiz.lineId._id);
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (lineId: string) => {
    try {
      const response = await apiService.neuronz.generateMicroQuizzes(lineId);
      setQuizzes(response.data.data);
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
      setCorrectCount(0);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === quizzes[currentQuizIndex].correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      await completeQuiz();
    }
  };

  const completeQuiz = async () => {
    try {
      const quizIndex = todaySchedule.quizzes.findIndex((q: any) => !q.isCompleted);
      const score = Math.round((correctCount / quizzes.length) * 100);
      
      await apiService.challenges.completeQuiz(
        challengeId!,
        todaySchedule.day,
        quizIndex,
        {
          score,
          timeSpent: 0
        }
      );
      
      await loadTodaySchedule();
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) {
      return 'border-border hover:border-primary/50 bg-background';
    }
    if (index === quizzes[currentQuizIndex].correctAnswer) {
      return 'border-success bg-success/10';
    }
    if (index === selectedAnswer) {
      return 'border-destructive bg-destructive/10';
    }
    return 'border-border bg-muted/30 opacity-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!todaySchedule) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Practice Today</h3>
            <p className="text-muted-foreground mb-6">
              Check back tomorrow for your next session!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="nf-btn-primary !w-auto px-8 mx-auto"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (todaySchedule.isCompleted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-2xl mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-success/20 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Day {todaySchedule.day} Complete! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Great work! Come back tomorrow for Day {todaySchedule.day + 1}
            </p>
            <div className="nf-card max-w-sm mx-auto mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary mb-1">{challenge.progress.streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="nf-btn-primary !w-auto px-8 mx-auto"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const currentQuizData = todaySchedule.quizzes.find((q: any) => !q.isCompleted);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground">{challenge.title}</h1>
              <p className="text-sm text-muted-foreground">Day {todaySchedule.day} of {challenge.duration}</p>
            </div>
            <span className="text-sm font-bold text-primary">
              {todaySchedule.completedQuizzes}/{todaySchedule.targetQuizzes}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(todaySchedule.completedQuizzes / todaySchedule.targetQuizzes) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        {/* Quiz */}
        {currentQuiz && currentQuizData && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuizIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="nf-card"
            >
              {/* NCERT Context */}
              <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">NCERT Line:</p>
                <p className="text-sm font-medium text-foreground">
                  {currentQuizData.lineId.ncertText}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-3 py-1 rounded-lg border bg-primary/10 text-primary border-primary/30">
                  Quiz {currentQuizIndex + 1}/4
                </span>
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-5">
                {currentQuiz.question}
              </h2>

              <div className="space-y-3">
                {currentQuiz.options.map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(index)}`}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium text-foreground">{option}</span>
                      {selectedAnswer !== null && index === currentQuiz.correctAnswer && (
                        <Check className="w-5 h-5 text-success ml-auto" />
                      )}
                      {selectedAnswer === index && index !== currentQuiz.correctAnswer && (
                        <X className="w-5 h-5 text-destructive ml-auto" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-xl ${
                    selectedAnswer === currentQuiz.correctAnswer
                      ? 'bg-success/20 border border-success/30'
                      : 'bg-destructive/20 border border-destructive/30'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    selectedAnswer === currentQuiz.correctAnswer ? 'text-success' : 'text-destructive'
                  }`}>
                    {selectedAnswer === currentQuiz.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {currentQuiz.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex gap-3"
                >
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="nf-btn-outline flex-1 flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Explain
                  </button>
                  <button
                    onClick={handleNext}
                    className="nf-btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {currentQuizIndex < quizzes.length - 1 ? 'Next' : 'Complete'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PracticeSession;
