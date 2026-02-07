import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadDueLines, generateMicroQuizzes, processLineSession, getMasteryProgress } from '@/store/slices/neuronzSlice';
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Trophy, 
  Clock, 
  Flame,
  BookOpen,
  PlusCircle,
  Settings,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';
import { apiService } from '@/lib/apiService';

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
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [generatingQuizzes, setGeneratingQuizzes] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [showLineOptions, setShowLineOptions] = useState<string | null>(null);
  const [adjustingLevel, setAdjustingLevel] = useState<{ lineId: string; line: any } | null>(null);
  const [customizingLine, setCustomizingLine] = useState<{ lineId: string; line: any } | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  // Auto-start quiz if revisionId is in URL
  useEffect(() => {
    const revisionId = searchParams.get('revisionId');
    if (revisionId && dueLines && dueLines.lines && dueLines.lines.length > 0) {
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
      // Transform result to QuizQuestion format
      const transformedQuizzes = result.map((quiz: any) => ({
        id: quiz._id || Math.random().toString(),
        question: quiz.question,
        type: 'mcq' as const,
        options: quiz.options,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
      }));
      setQuizzes(transformedQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setSelectedLine(null);
    } finally {
      setGeneratingQuizzes(false);
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    const correctCount = data.answers.filter((ans, idx) => {
      if (ans === null) return false;
      return ans === quizzes[idx].correctAnswer;
    }).length;

    try {
      console.log('Submitting quiz session:', {
        lineId: selectedLine.lineId,
        correctAnswers: correctCount,
        totalQuizzes: quizzes.length,
        timeSpent: data.timeTaken
      });

      const result = await dispatch(processLineSession({
        lineId: selectedLine.lineId,
        correctAnswers: correctCount,
        totalQuizzes: quizzes.length,
        timeSpent: data.timeTaken
      })).unwrap();

      console.log('Quiz submission result:', result);
      
      // Reload due lines and mastery progress
      await dispatch(loadDueLines());
      await dispatch(getMasteryProgress());
      
      // Clear quiz view
      setSelectedLine(null);
      setQuizzes([]);
      
      // Stay on revision page (don't navigate away)
      // The page will automatically refresh with new due lines
    } catch (error) {
      console.error('Failed to submit session:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleAdjustLevel = async (newLevel: number) => {
    if (!adjustingLevel) return;
    
    try {
      await apiService.neuronz.adjustLineLevel(adjustingLevel.lineId, {
        newLevel,
        reason: 'user-request'
      });
      
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      setAdjustingLevel(null);
      setShowLineOptions(null);
    } catch (error) {
      console.error('Failed to adjust level:', error);
    }
  };

  const handleCustomize = async (priority: string) => {
    if (!customizingLine) return;
    
    try {
      await apiService.neuronz.customizeLineSchedule(customizingLine.lineId, {
        priority
      });
      
      dispatch(loadDueLines());
      setCustomizingLine(null);
      setShowLineOptions(null);
    } catch (error) {
      console.error('Failed to customize:', error);
    }
  };

  const toggleLineSelection = (lineId: string) => {
    const newSet = new Set(selectedLines);
    if (newSet.has(lineId)) {
      newSet.delete(lineId);
    } else {
      newSet.add(lineId);
    }
    setSelectedLines(newSet);
  };

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

  // Quiz view
  if (selectedLine && quizzes.length > 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <motion.button
            onClick={() => setSelectedLine(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          {/* NCERT Line Context */}
          <div className="mb-4 p-3 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">NCERT Line:</p>
            <p className="text-sm font-medium text-foreground">
              {selectedLine.lineId?.ncertText}
            </p>
          </div>
        </div>

        <QuizPlayer
          questions={quizzes}
          title={`Revision Quiz - Level ${selectedLine.level}`}
          onSubmit={handleQuizSubmit}
          showPalette={true}
          showTimer={false}
          allowReviewMarking={false}
          config={{
            showExplanations: true,
            showDifficulty: false,
            showMarks: false,
          }}
        />

        <BottomNav />
      </div>
    );
  }

  // Loading state while generating quizzes
  if (generatingQuizzes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating micro-quizzes...</p>
          <p className="text-xs text-muted-foreground mt-2">This usually takes a few seconds</p>
        </motion.div>
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
            <span className="font-bold text-foreground">{dueLines?.total || 0}</span>
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
        {dueLines && dueLines.lines && dueLines.lines.length > 0 ? (
          <div className="space-y-3">
            {/* Selection Mode Toggle */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-foreground">
                {selectMode ? `Selected: ${selectedLines.size}` : 'Choose what to revise'}
              </span>
              <button
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedLines(new Set());
                }}
                className="text-xs px-3 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
              >
                {selectMode ? 'Done' : 'Select Multiple'}
              </button>
            </div>

            {dueLines.lines.map((line: any) => (
              <motion.div
                key={line._id}
                className={`nf-card w-full transition-all cursor-pointer ${
                  selectMode ? 'hover:border-primary/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedLines.has(line._id)}
                      onChange={() => toggleLineSelection(line._id)}
                      className="mt-3 w-5 h-5 accent-primary"
                    />
                  )}
                  
                  <motion.button
                    onClick={() => !selectMode && startLineSession(line)}
                    whileHover={!selectMode ? { scale: 1.01 } : {}}
                    whileTap={!selectMode ? { scale: 0.99 } : {}}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-lg border ${LEVEL_COLORS[line.level]}`}>
                        L{line.level} • {LEVEL_LABELS[line.level]}
                      </span>
                      <span className="text-xs text-muted-foreground">{line.lineId?.subject}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {line.lineId?.ncertText}
                    </p>
                  </motion.button>

                  {!selectMode && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowLineOptions(showLineOptions === line._id ? null : line._id);
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {showLineOptions === line._id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[180px]"
                        >
                          <button
                            onClick={() => {
                              setAdjustingLevel({ lineId: line.lineId, line });
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 border-b border-border"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Adjust Level
                          </button>
                          
                          <button
                            onClick={() => {
                              setCustomizingLine({ lineId: line.lineId, line });
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 border-b border-border"
                          >
                            <Settings className="w-4 h-4" />
                            Set Priority
                          </button>

                          <button
                            onClick={() => setShowLineOptions(null)}
                            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                          >
                            Close
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
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
        )}

        {/* Level Adjustment Modal */}
        {adjustingLevel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setAdjustingLevel(null)}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Adjust Level</h3>
              
              <div className="grid grid-cols-7 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleAdjustLevel(level)}
                    className={`py-3 rounded-lg font-bold text-sm transition-all ${
                      level === adjustingLevel.line.level
                        ? 'bg-primary text-white scale-105'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    L{level}
                  </button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                <p>Current: L{adjustingLevel.line.level} • {LEVEL_LABELS[adjustingLevel.line.level]}</p>
                <p className="mt-1">Select a new level or click outside to cancel</p>
              </div>

              <button
                onClick={() => setAdjustingLevel(null)}
                className="w-full py-2 text-sm font-semibold bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Priority Customization Modal */}
        {customizingLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCustomizingLine(null)}
            className="fixed inset-0 bg-black/50 z-40 flex items-end"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Set Priority</h3>
              
              <div className="space-y-2 mb-6">
                {[
                  { value: 'low', label: 'Low', desc: 'Review when you have time' },
                  { value: 'normal', label: 'Normal', desc: 'Standard revision schedule' },
                  { value: 'urgent', label: 'Urgent', desc: 'Review ASAP - struggling' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => handleCustomize(priority.value)}
                    className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
                  >
                    <p className="font-semibold text-foreground">{priority.label}</p>
                    <p className="text-xs text-muted-foreground">{priority.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCustomizingLine(null)}
                className="w-full py-2 text-sm font-semibold bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

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
