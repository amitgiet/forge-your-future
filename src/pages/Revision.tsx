import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueLines, generateMicroQuizzes, processLineSession, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Lightbulb,
  Flame,
  BookOpen,
  Check,
  X,
  PlusCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const LEVEL_COLORS = [
  '',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
];

const LEVEL_LABELS = ['', 'New', 'Learning', 'Reviewing', 'Familiar', 'Strong', 'Expert', 'Mastered'];

const Revision = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);

  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [generatingQuizzes, setGeneratingQuizzes] = useState(false);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  // Auto-start quiz if revisionId is in URL
  useEffect(() => {
    const revisionId = searchParams.get('revisionId');
    if (revisionId && dueLines && dueLines.lines && dueLines.lines.length > 0) {
      // Find the line that matches the revisionId
      const lineToStart = dueLines.lines.find((line: any) => line._id === revisionId);
      if (lineToStart && !selectedLine) {
        startLineSession(lineToStart);
      }
    }
  }, [dueLines, searchParams, selectedLine]);

  const startLineSession = async (line: any) => {
    console.log('Starting line session for:', line);
    setSelectedLine(line);
    setSessionStartTime(Date.now());
    setGeneratingQuizzes(true);
    
    try {
      console.log('Generating quizzes for lineId:', line.lineId);
      const result = await dispatch(generateMicroQuizzes(line.lineId)).unwrap();
      console.log('Quizzes result:', result);
      setQuizzes(result);
      setCurrentQuizIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setSelectedLine(null);
    } finally {
      setGeneratingQuizzes(false);
    }
  };

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    
    const currentQuiz = quizzes[currentQuizIndex];
    const isCorrect = index === currentQuiz.correctAnswer;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    setAnswers([...answers, {
      quizIndex: currentQuizIndex,
      selected: index,
      correct: isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentQuizIndex < 3) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      submitSession();
    }
  };

  const submitSession = async () => {
    const correctCount = answers.filter(a => a.correct).length;
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    try {
      await dispatch(processLineSession({
        lineId: selectedLine.lineId,
        correctAnswers: correctCount,
        totalQuizzes: 4,
        timeSpent
      })).unwrap();
      
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      
      setSelectedLine(null);
      setQuizzes([]);
      setAnswers([]);
    } catch (error) {
      console.error('Failed to submit session:', error);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!quizzes[currentQuizIndex]) return 'bg-muted/50 border-transparent';
    
    if (selectedAnswer === null) {
      return 'bg-muted/50 border-transparent hover:border-primary/50';
    }
    if (index === quizzes[currentQuizIndex].correctAnswer) {
      return 'bg-success/20 border-success';
    }
    if (index === selectedAnswer && index !== quizzes[currentQuizIndex].correctAnswer) {
      return 'bg-destructive/20 border-destructive animate-shake';
    }
    return 'bg-muted/30 border-transparent opacity-50';
  };

  const currentQuiz = quizzes[currentQuizIndex];
  const correctCount = answers.filter(a => a.correct).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                NEURONZ
              </h1>
              <p className="text-xs text-muted-foreground">Spaced Revision</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="font-bold text-foreground">{selectedLine ? `${currentQuizIndex + 1}/4` : correctCount}</span>
          </div>
        </div>

        {/* Stats Cards & Track Button */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card-glass p-3 text-center col-span-1"
          >
            <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{dueLines?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Due</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nf-card-glass p-3 text-center col-span-1"
          >
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{masteryProgress?.masteredLines || 0}</p>
            <p className="text-[10px] text-muted-foreground">Mastered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nf-card-glass p-3 text-center col-span-1"
          >
            <Zap className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">L{masteryProgress?.averageLevel.toFixed(1) || 1}</p>
            <p className="text-[10px] text-muted-foreground">Avg Lvl</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/revision/track')}
            className="nf-card-glass p-3 text-center bg-primary/10 hover:bg-primary/20 transition-colors col-span-1 flex flex-col justify-center items-center"
          >
            <PlusCircle className="w-5 h-5 text-primary mb-1" />
            <p className="text-sm font-bold text-primary">Track New</p>
          </motion.button>
        </div>

        {/* Line Selection */}
        {!selectedLine && dueLines && dueLines.lines && dueLines.lines.length > 0 ? (
          <div className="space-y-3">
            {dueLines.lines.map((line: any) => (
              <motion.button
                key={line._id}
                onClick={() => startLineSession(line)}
                className="nf-card w-full text-left hover:border-primary/50 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-lg border ${LEVEL_COLORS[line.level]}`}>
                        L{line.level} • {LEVEL_LABELS[line.level]}
                      </span>
                      <span className="text-xs text-muted-foreground">{line.lineId?.subject}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {line.lineId?.ncertText}
                    </p>
                  </div>
                  <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : selectedLine && generatingQuizzes ? (
          /* Loading state while generating quizzes */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating micro-quizzes...</p>
            <p className="text-xs text-muted-foreground mt-2">This usually takes a few seconds</p>
          </motion.div>
        ) : !selectedLine && (!dueLines || dueLines.lines?.length === 0) ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-success/20 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              No NCERT lines due for revision. Start practicing new topics to enter NeuronZ Level 1!
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => navigate('/start-practice')}
                className="nf-btn-primary !w-auto px-8"
              >
                Start NeuronZ Practice
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="nf-btn-outline !w-auto px-8"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        ) : selectedLine && currentQuiz ? (
          /* Quiz View */
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
                  {selectedLine.lineId?.ncertText}
                </p>
              </div>

              {/* Level Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-3 py-1 rounded-lg border ${LEVEL_COLORS[selectedLine.level]}`}>
                  Level {selectedLine.level} • {LEVEL_LABELS[selectedLine.level]}
                </span>
                <span className="text-xs text-muted-foreground">Quiz {currentQuizIndex + 1}/4</span>
              </div>

              {/* Question */}
              <h2 className="text-lg font-semibold text-foreground mb-5">
                {currentQuiz.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 w-full">
                {currentQuiz.options.map((option: string, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all block ${getOptionStyle(index)}`}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium text-foreground flex-1">{option}</span>
                      {selectedAnswer !== null && index === currentQuiz.correctAnswer && (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      )}
                      {selectedAnswer === index && index !== currentQuiz.correctAnswer && (
                        <X className="w-5 h-5 text-destructive flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Result Feedback */}
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
                    {selectedAnswer === currentQuiz.correctAnswer ? (
                      <>✓ Correct! {currentQuizIndex < 3 ? 'Next quiz' : `Session: ${correctCount + 1}/4 correct`}</>
                    ) : (
                      <>✗ Incorrect. {currentQuizIndex < 3 ? 'Keep going' : `Session: ${correctCount}/4 correct`}</>
                    )}
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
                    className="nf-btn-outline flex-1 flex items-center justify-center gap-2 !min-h-[48px]"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Explain
                  </button>
                  <button
                    onClick={handleNext}
                    className="nf-btn-primary flex-1 flex items-center justify-center gap-2 !min-h-[48px]"
                  >
                    {currentQuizIndex < 3 ? 'Next' : 'Submit Session'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}

        {/* Level Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 nf-card"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Level Intervals
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((level) => (
              <div key={level} className="text-center">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${LEVEL_COLORS[level]}`}>
                  L{level}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {level === 1 && '24h'}
                  {level === 2 && '3d'}
                  {level === 3 && '5d'}
                  {level === 4 && '7d'}
                  {level === 5 && '10d'}
                  {level === 6 && '15d'}
                  {level === 7 && '30d'}
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
