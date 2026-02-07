import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Play, CheckCircle, XCircle, Trophy, Zap, Target, Loader2 } from 'lucide-react';
import apiService from '@/lib/apiService';

type Phase = 'intro' | 'reading' | 'quiz' | 'results' | 'already-completed';

const DailyChallenge = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch challenge on mount
  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await apiService.dailyChallenge.getTodaysChallenge();
      if (response.data?.success) {
        const challengeData = response.data.data;
        setChallenge(challengeData);
        
        // Check if user already completed
        if (challengeData.completed) {
          setPhase('already-completed');
          setLoading(false);
          return;
        }

        setTimeLeft(challengeData.timeLimit * 60);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer for quiz
  useEffect(() => {
    if (phase === 'quiz' && quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, quizStarted, timeLeft]);

  const handleStartReading = () => {
    setPhase('reading');
  };

  const handleStartQuiz = () => {
    setPhase('quiz');
    setQuizStarted(true);
  };

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    setTimeout(async () => {
      if (currentQuestion < challenge.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Submit all answers to API
        try {
          const response = await apiService.dailyChallenge.submitChallenge({
            answers: newAnswers,
            challengeId: challenge.id
          });
          if (response.data?.success) {
            console.log('Challenge submitted successfully');
          }
        } catch (error) {
          console.error('Error submitting challenge:', error);
        }
        
        setPhase('results');
      }
    }, 1500);
  };

  const calculateScore = (userAnswers: number[]) => {
    if (!challenge?.questions || challenge.questions.length === 0) return 0;
    let correct = 0;
    challenge.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct) correct++;
    });
    return Math.round((correct / challenge.questions.length) * 100);
  };

  const updateLeaderboard = (score: number) => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const userName = 'Demo User'; // Would come from auth
    const existing = leaderboard.findIndex((e: any) => e.name === userName);
    
    const entry = {
      name: userName,
      score,
      totalXP: (leaderboard[existing]?.totalXP || 0) + (score >= 60 ? challenge.xpReward : Math.round(challenge.xpReward * 0.5)),
      streak: (leaderboard[existing]?.streak || 0) + 1,
      avatar: 'A',
      completedToday: true
    };

    if (existing >= 0) {
      leaderboard[existing] = entry;
    } else {
      leaderboard.push(entry);
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = challenge ? calculateScore(answers) : 0;
  const correctCount = challenge ? answers.filter((a, i) => a === challenge?.questions?.[i]?.correct).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (phase === 'already-completed') {
    return (
      <div className="min-h-screen bg-background">
        <div className="nf-safe-area p-4 max-w-md mx-auto">
          <motion.button
            onClick={() => navigate(-1)}
            className="nf-btn-icon mb-6"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Already Completed!</h2>
            <p className="text-muted-foreground mb-6">
              You've already completed today's challenge. Here are your details:
            </p>

            <div className="nf-card bg-success/10 border-success/30 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <p className="text-4xl font-black text-success">{challenge?.userScore || 0}/100</p>
                <p className="text-sm text-muted-foreground mt-2">
                  +{challenge?.userXpEarned || 0} XP
                </p>
              </div>
            </div>

            {/* Topic Content */}
            <div className="nf-card mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{challenge.icon}</span>
                <h2 className="text-xl font-bold text-foreground">{challenge.topic}</h2>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                {(challenge.content || '').split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-bold mt-3 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-primary mt-3">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim()) {
                    return <p key={i} className="text-muted-foreground my-1">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Answer Review */}
            <div className="nf-card mb-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">Your Answers & Correct Answers</h3>
              {challenge.questions && challenge.userAnswers && challenge.questions.map((q, i) => (
                <div key={i} className="mb-3 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="font-bold text-foreground mb-2">Q{i + 1}: {q.question}</div>
                  <div className="flex flex-col gap-1">
                    {q.options && q.options.map((opt: string, idx: number) => {
                      const isCorrect = idx === q.correctAnswer;
                      const isUserSelected = idx === challenge.userAnswers[i];
                      
                      return (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded text-sm transition-all ${
                            isCorrect 
                              ? 'bg-success/20 text-success font-bold border border-success/50' 
                              : isUserSelected 
                                ? 'bg-primary/10 text-primary border border-primary/50' 
                                : 'text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                            <div className="flex gap-1 text-xs">
                              {isCorrect && <span className="font-bold">✓ Correct</span>}
                              {isUserSelected && !isCorrect && <span className="text-primary">← Your Answer</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-2 p-2 rounded bg-muted/30 border-l-2 border-primary">
                      <p className="text-xs text-muted-foreground"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <motion.button
              onClick={() => navigate('/dashboard')}
              className="nf-btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="nf-safe-area p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="nf-btn-icon"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">Daily Challenge</h1>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          {phase === 'quiz' && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm ${timeLeft < 60 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-foreground'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* INTRO PHASE */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="nf-card text-center">
                <span className="text-6xl mb-4 block">{challenge.icon}</span>
                <h2 className="text-2xl font-black text-foreground mb-2">{challenge.topic}</h2>
                <p className="text-muted-foreground mb-4">{challenge.subject}</p>
                
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary">{challenge.timeLimit}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-secondary">{challenge.questions.length}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-warning-foreground">{challenge.xpReward}</div>
                    <div className="text-xs text-muted-foreground">XP Reward</div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mb-4 border border-border text-left">
                  <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    How it works
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                      Read today's topic carefully
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                      Take the timed quiz
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                      Compete on the leaderboard!
                    </li>
                  </ol>
                </div>

                <motion.button
                  onClick={handleStartReading}
                  className="nf-btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-5 h-5" />
                  Start Reading
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* READING PHASE */}
          {phase === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="nf-card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{challenge.icon}</span>
                  <h2 className="text-xl font-bold text-foreground">{challenge.topic}</h2>
                </div>
                
                <div className="prose prose-sm max-w-none text-foreground">
                  {(challenge.content || '').split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-base font-bold mt-3 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold text-primary mt-3">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="text-muted-foreground my-1">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>

              <motion.button
                onClick={handleStartQuiz}
                className="nf-btn-primary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5" />
                I'm Ready - Start Quiz
              </motion.button>
            </motion.div>
          )}

          {/* QUIZ PHASE */}
          {phase === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Progress */}
              <div className="flex items-center gap-2">
                {challenge.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      i < currentQuestion
                        ? 'bg-primary'
                        : i === currentQuestion
                        ? 'bg-primary/50'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="nf-card">
                <div className="text-xs text-muted-foreground mb-2">
                  Question {currentQuestion + 1} of {challenge.questions.length}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {challenge.questions[currentQuestion].question}
                </h3>

                <div className="space-y-3">
                  {challenge.questions[currentQuestion].options.map((option, index) => {
                    const isCorrect = index === challenge.questions[currentQuestion].correct;
                    const isSelected = selectedAnswer === index;
                    
                    let optionClass = 'nf-option';
                    if (showFeedback) {
                      if (isCorrect) optionClass = 'nf-option nf-option-correct';
                      else if (isSelected && !isCorrect) optionClass = 'nf-option nf-option-incorrect';
                    } else if (isSelected) {
                      optionClass = 'nf-option nf-option-selected';
                    }

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`${optionClass} w-full text-left`}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                        disabled={showFeedback}
                      >
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-foreground">{option}</span>
                        {showFeedback && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <motion.button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || showFeedback}
                className="nf-btn-primary w-full disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentQuestion < challenge.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </motion.button>
            </motion.div>
          )}

          {/* RESULTS PHASE */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="nf-card text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  {score >= 80 ? '🏆' : score >= 60 ? '⭐' : '💪'}
                </motion.div>
                
                <h2 className="text-2xl font-black text-foreground mb-2">
                  {score >= 80 ? 'Excellent!' : score >= 60 ? 'Great Job!' : 'Keep Practicing!'}
                </h2>
                
                <div className="text-5xl font-black nf-gradient-text mb-2">{score}%</div>
                <p className="text-muted-foreground mb-4">
                  {correctCount} of {challenge.questions.length} correct
                </p>

                <div className="flex justify-center gap-4 mb-6">
                  <div className="nf-card-stat">
                    <div className="nf-stat-icon nf-stat-icon-warning">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-black text-foreground">+{score >= 60 ? challenge.xpReward : Math.round(challenge.xpReward * 0.5)}</p>
                      <p className="text-xs text-muted-foreground">XP Earned</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={() => navigate('/leaderboard')}
                    className="nf-btn-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trophy className="w-5 h-5" />
                    View Leaderboard
                  </motion.button>
                  
                  <motion.button
                    onClick={() => navigate('/dashboard')}
                    className="nf-btn-outline w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Dashboard
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyChallenge;
