import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, BookOpen, Clock, Zap, Trophy } from 'lucide-react';

const QuizStart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { topic = 'General Quiz', subject = 'General', weakness } = location.state || {};

  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [questionCount, setQuestionCount] = useState(25);

  const handleStart = () => {
    navigate('/app/quiz-session', {
      state: {
        mode,
        questionCount,
        topic,
        subject,
        weakness
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Start Quiz</h1>
            <p className="text-xs text-muted-foreground">{subject} • {topic}</p>
          </div>
        </div>

        {/* Weakness Alert */}
        {weakness && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="nf-card bg-destructive/10 border-destructive/30 mb-6"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Weakness Detected</p>
                <p className="text-xs text-muted-foreground">{topic} accuracy: {weakness}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode Selection */}
        <div className="nf-card mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Select Mode
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('practice')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'practice'
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <BookOpen className={`w-6 h-6 mx-auto mb-2 ${mode === 'practice' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`font-bold text-sm ${mode === 'practice' ? 'text-primary' : 'text-foreground'}`}>
                Practice
              </p>
              <p className="text-xs text-muted-foreground mt-1">Instant feedback</p>
            </button>

            <button
              onClick={() => setMode('test')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'test'
                  ? 'bg-secondary/10 border-secondary'
                  : 'bg-card border-border'
              }`}
            >
              <Trophy className={`w-6 h-6 mx-auto mb-2 ${mode === 'test' ? 'text-secondary' : 'text-muted-foreground'}`} />
              <p className={`font-bold text-sm ${mode === 'test' ? 'text-secondary' : 'text-foreground'}`}>
                Test
              </p>
              <p className="text-xs text-muted-foreground mt-1">Exam simulation</p>
            </button>
          </div>
        </div>

        {/* Quiz Configuration */}
        <div className="nf-card mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Configuration</h2>

          {/* Question Count */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                    questionCount === count
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card border-border text-foreground'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Time Limit</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {mode === 'practice' ? 'No limit' : `${questionCount * 1.5} min`}
            </span>
          </div>
        </div>

        {/* Mode Info */}
        <div className="nf-card bg-muted/30 mb-6">
          <h3 className="text-sm font-bold text-foreground mb-2">
            {mode === 'practice' ? '📚 Practice Mode' : '🏆 Test Mode'}
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            {mode === 'practice' ? (
              <>
                <li>✓ Instant feedback after each question</li>
                <li>✓ Detailed explanations provided</li>
                <li>✓ No time pressure</li>
                <li>✓ Unlimited questions</li>
              </>
            ) : (
              <>
                <li>✓ Exam-like environment</li>
                <li>✓ Results shown at the end</li>
                <li>✓ Timed challenge</li>
                <li>✓ Rank & analytics</li>
              </>
            )}
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="nf-btn-primary w-full"
        >
          Start {mode === 'practice' ? 'Practice' : 'Test'} 🚀
        </button>
      </div>
    </div>
  );
};

export default QuizStart;
