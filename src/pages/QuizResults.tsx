import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Home, RotateCcw, BookOpen } from 'lucide-react';

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, answers, totalQuestions, subject, topic } = location.state || {};

  const correctCount = answers?.filter((a: any) => a.correct).length || 0;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  // Mock analytics
  const rank = Math.floor(Math.random() * 500000) + 1;
  const totalUsers = 2000000;
  const improvement = Math.floor(Math.random() * 50) - 10;

  // Calculate chapter-wise performance
  const chapterStats = answers?.reduce((acc: any, answer: any) => {
    if (!acc[answer.chapter]) {
      acc[answer.chapter] = { correct: 0, total: 0 };
    }
    acc[answer.chapter].total++;
    if (answer.correct) acc[answer.chapter].correct++;
    return acc;
  }, {});

  const weakChapters = Object.entries(chapterStats || {})
    .map(([chapter, stats]: [string, any]) => ({
      chapter,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }))
    .filter(c => c.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  const getMedal = () => {
    if (percentage >= 90) return '🥇';
    if (percentage >= 75) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📊';
  };

  useEffect(() => {
    // Send analytics to backend
    // apiService.quiz.submitAttempt({ mode, answers, subject, topic });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">{getMedal()}</div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            {correctCount}/{totalQuestions}
          </h1>
          <p className="text-xl font-bold text-primary mb-1">{percentage}% Score</p>
          <p className="text-sm text-muted-foreground">{subject} • {topic}</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nf-card mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-success">{correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-destructive">{totalQuestions - correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-primary">{percentage}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </motion.div>

        {/* Rank & Improvement (Test Mode Only) */}
        {mode === 'test' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="nf-card mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                <span className="font-bold text-foreground">Your Rank</span>
              </div>
              <span className="text-2xl font-black text-secondary">
                {(rank / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Out of {(totalUsers / 100000).toFixed(1)}L users</span>
              <div className={`flex items-center gap-1 ${improvement >= 0 ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold">{improvement >= 0 ? '+' : ''}{improvement}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chapter-wise Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="nf-card mb-6"
        >
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Chapter Performance
          </h2>
          <div className="space-y-3">
            {Object.entries(chapterStats || {}).map(([chapter, stats]: [string, any]) => {
              const accuracy = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={chapter}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{chapter}</span>
                    <span className={`text-sm font-bold ${
                      accuracy >= 75 ? 'text-success' : accuracy >= 50 ? 'text-warning-foreground' : 'text-destructive'
                    }`}>
                      {accuracy}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${accuracy}%` }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className={`h-full ${
                        accuracy >= 75 ? 'bg-success' : accuracy >= 50 ? 'bg-warning' : 'bg-destructive'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak Areas */}
        {weakChapters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="nf-card bg-destructive/10 border-destructive/30 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-destructive" />
              <h2 className="font-bold text-destructive">Weak Areas Detected</h2>
            </div>
            <div className="space-y-2">
              {weakChapters.map((chapter) => (
                <div key={chapter.chapter} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{chapter.chapter}</span>
                  <span className="font-bold text-destructive">{chapter.accuracy}% ❌</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/start-practice', { state: { weakness: weakChapters[0] } })}
              className="w-full mt-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Fix Weak Areas
            </button>
          </motion.div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/quiz-start', { state: { subject, topic } })}
            className="nf-btn-outline flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retry
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="nf-btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
