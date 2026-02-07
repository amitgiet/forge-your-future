import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '@/lib/apiService';
import BottomNav from '@/components/BottomNav';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form', 'generating', 'quiz', 'results'
  
  // Form state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(3);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [quizType, setQuizType] = useState('mcq');
  const [error, setError] = useState('');
  
  // Quiz state
  const [quiz, setQuiz] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  // My Quizzes state
  const [myQuizzes, setMyQuizzes] = useState<any[]>([]);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  const [quizPage, setQuizPage] = useState(1);
  const [quizTotalPages, setQuizTotalPages] = useState(1);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 50) {
      setError('Number of questions must be between 1 and 50');
      return;
    }

    setStep('generating');

    try {
      const response = await apiService.quizGenerator.generateQuiz({
        topic,
        level,
        numberOfQuestions,
        quizType
      });

      // Handle nested data structure: response.data contains { success, data: {...quiz} }
      const quizData = response.data.data || response.data;
      
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('No questions received from AI');
      }

      setQuiz(quizData);
      setStep('quiz');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate quiz');
      setStep('form');
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    try {
      // Get quiz ID from either _id or quizId field
      const quizId = quiz._id || quiz.quizId;
      if (!quizId) {
        throw new Error('Quiz ID not found. Please try generating the quiz again.');
      }
      const response = await apiService.quizGenerator.submitQuizAttempt(quizId, data);
      // Response structure: { success: true, data: {quizId, score, totalMarks, evaluatedAnswers, ...} }
      const resultsData = response.data.data || response.data;
      setResults(resultsData);
      setStep('results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setTopic('');
    setLevel(3);
    setNumberOfQuestions(10);
    setQuizType('mcq');
    setError('');
    setQuiz(null);
    setResults(null);
  };

  const fetchMyQuizzes = async (page = 1) => {
    setLoadingQuizzes(true);
    try {
      const res = await apiService.quizGenerator.getUserQuizzes(page, 10);
      console.log('[fetchMyQuizzes] Full response:', res);
      console.log('[fetchMyQuizzes] res.data:', res.data);
      // Response structure: { success: true, data: [...quizzes], pagination: {...} }
      const quizzesData = res.data.data || res.data;
      console.log('[fetchMyQuizzes] Parsed quizzes:', quizzesData);
      setMyQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      setQuizTotalPages(res.data.pagination?.pages || 1);
      setQuizPage(page);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (showMyQuizzes) fetchMyQuizzes(quizPage);
    // eslint-disable-next-line
  }, [showMyQuizzes, quizPage]);

  if (showMyQuizzes) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" /> My Quizzes
            </h1>
            <button
              onClick={() => setShowMyQuizzes(false)}
              className="text-sm text-primary underline"
            >Back</button>
          </div>
          {loadingQuizzes ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : myQuizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No quizzes found.</div>
          ) : (
            <div className="space-y-4">
              {myQuizzes.map((q) => (
                <div key={q._id} className="nf-card p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{q.topic}</div>
                      <div className="text-xs text-muted-foreground">Quiz ID: {q._id}</div>
                    </div>
                    <button
                      className="text-primary underline text-sm"
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
                    >View</button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Level: L{q.level} | {q.totalQuestions} Qs | {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={quizPage <= 1}
                  onClick={() => setQuizPage(quizPage - 1)}
                  className="px-3 py-1 rounded bg-card border text-sm disabled:opacity-50"
                >Prev</button>
                <span className="text-xs">Page {quizPage} of {quizTotalPages}</span>
                <button
                  disabled={quizPage >= quizTotalPages}
                  onClick={() => setQuizPage(quizPage + 1)}
                  className="px-3 py-1 rounded bg-card border text-sm disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              AI Quiz Generator
            </h1>
            <p className="text-muted-foreground mt-2">Create custom quizzes on any topic</p>
          </motion.div>

          {/* Add My Quizzes button */}
          <button
            onClick={() => setShowMyQuizzes(true)}
            className="mb-4 w-full py-2 rounded-lg bg-primary/10 text-primary font-semibold border border-primary/20 hover:bg-primary/20 transition"
          >
            My Quizzes
          </button>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card mb-6"
          >
            <form onSubmit={handleGenerateQuiz} className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws, Organic Chemistry"
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Be specific for better results</p>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Difficulty Level: <span className="text-primary">L{level}</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`py-2 rounded-lg font-bold transition-all ${
                        level === l
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  L7 = Expert/Competitive exam level
                </p>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Number of Questions: <span className="text-primary">{numberOfQuestions}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 Question</span>
                  <span>50 Questions</span>
                </div>
              </div>

              {/* Quiz Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Quiz Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mcq', label: 'MCQ', desc: 'Single answer' },
                    { value: 'multiple_select', label: 'Multiple Select', desc: 'Multiple answers' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setQuizType(type.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        quizType === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
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
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-destructive">{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </motion.button>
            </form>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nf-card"
          >
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✨ AI generates unique questions based on your topic</li>
              <li>🎯 Questions tailored to your selected difficulty level</li>
              <li>💾 Quiz saved for future reference</li>
              <li>📊 Track your performance across multiple attempts</li>
            </ul>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Generating your quiz...</h2>
          <p className="text-muted-foreground">
            AI is creating {numberOfQuestions} custom questions on "{topic}"
          </p>
          <p className="text-xs text-muted-foreground mt-4">This usually takes 10-30 seconds</p>
        </motion.div>
      </div>
    );
  }

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
          config={{
            showExplanations: false,
            showDifficulty: true,
            showMarks: false,
          }}
        />

        <BottomNav />
      </>
    );
  }

  if (step === 'results' && results) {
    const percentage = results.percentage;
    const isGoodScore = percentage >= 70;

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="nf-safe-area p-4 max-w-md mx-auto">
          {/* Results */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nf-card mb-6 text-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isGoodScore ? 'bg-success/20' : 'bg-warning/20'
            }`}>
              <span className="text-4xl font-bold">{percentage}%</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {results.message}
            </h2>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-card">
                <div className="text-2xl font-bold text-primary">{results.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="p-3 rounded-lg bg-card">
                <div className="text-2xl font-bold text-primary">{results.totalMarks}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="p-3 rounded-lg bg-card">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor(results.timeTaken / 60)}m
                </div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>
          </motion.div>

          {/* Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nf-card mb-6"
          >
            <h3 className="font-bold text-foreground mb-4">Question Review</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {results.evaluatedAnswers && Array.isArray(results.evaluatedAnswers) && results.evaluatedAnswers.map((evaluation: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    evaluation.isCorrect
                      ? 'border-success bg-success/10'
                      : 'border-destructive bg-destructive/10'
                  }`}
                >
                  <div className="font-bold text-foreground text-sm">
                    Q{evaluation.questionNumber}: {evaluation.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Your answer: {evaluation.userAnswer !== null ? String(evaluation.userAnswer) : 'Not answered'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              onClick={handleBackToForm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-bold"
            >
              Generate New Quiz
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-card border-2 border-border rounded-lg text-foreground font-bold"
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
