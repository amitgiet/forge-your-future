import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, BookOpen, Loader2, AlertCircle, Trophy, Clock, ChevronRight, RotateCcw } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(3);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [quizType, setQuizType] = useState('mcq');
  const [error, setError] = useState('');
  
  const [quiz, setQuiz] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  const [myQuizzes, setMyQuizzes] = useState<any[]>([]);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    if (numberOfQuestions < 1 || numberOfQuestions > 50) { setError('Number of questions must be between 1 and 50'); return; }

    setStep('generating');
    try {
      const response = await apiService.quizGenerator.generateQuiz({ topic, level, numberOfQuestions, quizType });
      const quizData = response.data.data || response.data;
      if (!quizData.questions || quizData.questions.length === 0) throw new Error('No questions received from AI');
      setQuiz(quizData);
      setStep('quiz');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate quiz');
      setStep('form');
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    try {
      const quizId = quiz._id || quiz.quizId;
      if (!quizId) throw new Error('Quiz ID not found.');
      const response = await apiService.quizGenerator.submitQuizAttempt(quizId, data);
      const resultsData = response.data.data || response.data;
      setResults(resultsData);
      setStep('results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setTopic(''); setLevel(3); setNumberOfQuestions(10); setQuizType('mcq');
    setError(''); setQuiz(null); setResults(null);
  };

  const fetchMyQuizzes = async (page = 1) => {
    setLoadingQuizzes(true);
    try {
      const res = await apiService.quizGenerator.getUserQuizzes(page, 10);
      const quizzesData = res.data.data || res.data;
      setMyQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setQuizTotalPages(res.data.pagination?.pages || 1);
      setQuizPage(page);
    } catch {
      setError('Failed to load quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (showMyQuizzes) fetchMyQuizzes(quizPage);
  }, [showMyQuizzes, quizPage]);

  // ── My Quizzes View ──────────────────────────────────────────────────
  if (showMyQuizzes) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setShowMyQuizzes(false)}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">My AI Quizzes</h1>
              <p className="text-xs text-muted-foreground">{myQuizzes.length} quizzes</p>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 pt-4">
          {loadingQuizzes ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Loading quizzes…</span>
            </div>
          ) : myQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No quizzes yet. Generate your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myQuizzes.map((q, idx) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{q.topic}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">L{q.level}</span>
                        <span className="text-xs text-muted-foreground">{q.totalQuestions} Qs</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      className="ml-3 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
                      onClick={async () => {
                        try {
                          const res = await apiService.quizGenerator.getQuiz(q._id);
                          const quizData = res.data.data || res.data;
                          setQuiz(quizData);
                          setStep('quiz');
                          setShowMyQuizzes(false);
                        } catch {
                          setError('Failed to load quiz');
                        }
                      }}
                    >
                      Play <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {/* Pagination */}
              <div className="flex justify-between items-center pt-2 pb-4">
                <button
                  disabled={quizPage <= 1}
                  onClick={() => setQuizPage(quizPage - 1)}
                  className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium disabled:opacity-40"
                >Prev</button>
                <span className="text-xs text-muted-foreground">Page {quizPage}/{quizTotalPages}</span>
                <button
                  disabled={quizPage >= quizTotalPages}
                  onClick={() => setQuizPage(quizPage + 1)}
                  className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium disabled:opacity-40"
                >Next</button>
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Form View ──────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Quiz Generator
              </h1>
              <p className="text-xs text-muted-foreground">Create custom quizzes on any topic</p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          {/* My Quizzes */}
          <button
            onClick={() => setShowMyQuizzes(true)}
            className="mb-4 w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:shadow-sm transition-shadow"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            My Quizzes
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              {/* Topic */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-2">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Be specific for better results</p>
              </div>

              {/* Level */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-3">
                  Difficulty: <span className="text-primary">L{level}</span>
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                        level === l
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-background border border-border text-foreground hover:border-primary/30'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">L1 = Basic · L7 = Competitive</p>
              </div>

              {/* Question Count */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-2">
                  Questions: <span className="text-primary">{numberOfQuestions}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>

              {/* Quiz Type */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="block text-sm font-bold text-foreground mb-3">Quiz Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'mcq', label: 'MCQ', desc: 'Single answer' },
                    { value: 'multiple_select', label: 'Multi Select', desc: 'Multiple answers' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setQuizType(type.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        quizType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-primary/30'
                      }`}
                    >
                      <div className="font-semibold text-foreground text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-destructive">{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </motion.button>
            </form>

            {/* Info */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                How it works
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span>✨</span> AI generates unique questions based on your topic</li>
                <li className="flex items-start gap-2"><span>🎯</span> Questions tailored to your difficulty level</li>
                <li className="flex items-start gap-2"><span>💾</span> Quiz saved for future reference</li>
                <li className="flex items-start gap-2"><span>📊</span> Track performance across attempts</li>
              </ul>
            </div>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Generating View ────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Generating your quiz…</h2>
          <p className="text-sm text-muted-foreground">
            Creating {numberOfQuestions} questions on "{topic}"
          </p>
          <p className="text-xs text-muted-foreground mt-4 bg-card border border-border rounded-xl px-4 py-2 inline-block">
            ⏱️ Usually takes 10-30 seconds
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Quiz View ──────────────────────────────────────────────────────────
  if (step === 'quiz' && quiz && quiz.questions && quiz.questions.length > 0) {
    return (
      <>
        <div className="nf-safe-area p-4 max-w-2xl mx-auto">
          <motion.button
            onClick={() => setStep('form')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
        </div>
        <QuizPlayer
          questions={quiz.questions as QuizQuestion[]}
          title={`AI Quiz: ${quiz.topic}`}
          onSubmit={handleQuizSubmit}
          showPalette={true}
          showTimer={false}
          allowReviewMarking={true}
          config={{ showExplanations: false, showDifficulty: true, showMarks: false }}
        />
        <BottomNav />
      </>
    );
  }

  // ── Results View ───────────────────────────────────────────────────────
  if (step === 'results' && results) {
    const percentage = results.percentage;
    const isGoodScore = percentage >= 70;

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleBackToForm}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Quiz Results</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pt-6">
          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 text-center mb-4 shadow-sm"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${
              isGoodScore ? 'border-primary bg-primary/10' : 'border-destructive/50 bg-destructive/10'
            }`}>
              <div>
                <span className="text-3xl font-bold text-foreground">{percentage}</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-1">{results.message}</h2>
            <p className="text-sm text-muted-foreground">
              {isGoodScore ? '🎉 Great performance!' : '💪 Keep practicing!'}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">{results.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">{results.totalMarks}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">{Math.floor(results.timeTaken / 60)}m</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>
          </motion.div>

          {/* Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4 mb-4"
          >
            <h3 className="font-bold text-foreground mb-3 text-sm">Question Review</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {results.evaluatedAnswers && Array.isArray(results.evaluatedAnswers) && results.evaluatedAnswers.map((evaluation: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border-l-4 ${
                    evaluation.isCorrect
                      ? 'border-primary bg-primary/5'
                      : 'border-destructive bg-destructive/5'
                  }`}
                >
                  <div className="font-semibold text-foreground text-sm">
                    Q{evaluation.questionNumber}: {evaluation.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Your answer: {evaluation.userAnswer !== null ? String(evaluation.userAnswer) : 'Not answered'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <motion.button
              onClick={handleBackToForm}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-5 h-5" />
              Generate New Quiz
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard')}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-card border-2 border-border rounded-2xl text-foreground font-semibold"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default QuizGenerator;
