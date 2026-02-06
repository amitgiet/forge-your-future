import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, ChevronRight, Trophy, Target, Lightbulb, X } from 'lucide-react';
import { apiService } from '../lib/apiService';
import BottomNav from '../components/BottomNav';

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-100 text-slate-700 border-slate-300',
  2: 'bg-blue-100 text-blue-700 border-blue-300',
  3: 'bg-green-100 text-green-700 border-green-300',
  4: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  5: 'bg-orange-100 text-orange-700 border-orange-300',
  6: 'bg-red-100 text-red-700 border-red-300',
  7: 'bg-purple-100 text-purple-700 border-purple-300',
};

const LearningPathFlow = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<any>(null);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    loadPath();
  }, [pathId]);

  const loadPath = async () => {
    try {
      const response = await apiService.learningPaths.getPathById(pathId!);
      setPath(response.data.data);
      await loadNextContent();
    } catch (error) {
      console.error('Error loading path:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextContent = async () => {
    try {
      const response = await apiService.learningPaths.getNextContent(pathId!);
      const data = response.data.data;

      if (data.completed) {
        setCurrentContent(null);
        return;
      }

      setCurrentContent(data.content);
      setProgress(data.progress);

      if (data.content.contentType === 'ncert_line' && data.content.lineId) {
        await loadQuizzes(data.content.lineId._id);
      }
    } catch (error) {
      console.error('Error loading next content:', error);
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
      await completeContent();
    }
  };

  const completeContent = async () => {
    try {
      await apiService.learningPaths.markContentComplete(pathId!, progress.current - 1);
      await loadNextContent();
    } catch (error) {
      console.error('Error completing content:', error);
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (!currentContent) {
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Path Completed! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              You've finished all content in this learning path
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

  const currentQuiz = quizzes[currentQuizIndex];

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
            <h1 className="text-xl font-bold text-foreground">{path?.title}</h1>
            <span className="text-sm text-muted-foreground">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        {/* Quiz View */}
        {currentQuiz && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuizIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="nf-card"
            >
              {/* NCERT Line Context */}
              <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">NCERT Line:</p>
                <p className="text-sm font-medium text-foreground">
                  {currentContent.lineId?.ncertText}
                </p>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-3 py-1 rounded-lg border bg-primary/10 text-primary border-primary/30">
                  {currentContent.topic}
                </span>
                <span className="text-xs text-muted-foreground">
                  Quiz {currentQuizIndex + 1}/{quizzes.length}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-lg font-semibold text-foreground mb-5">
                {currentQuiz.question}
              </h2>

              {/* Options */}
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

              {/* Result */}
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

              {/* Explanation */}
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

              {/* Actions */}
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

export default LearningPathFlow;
