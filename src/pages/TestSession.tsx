import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3x3, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';

export default function TestSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadTest = async () => {
    try {
      const res = await apiService.tests.getAttempt(attemptId!);
      const attemptData = res.data.data;
      setTest(attemptData.testId);
      setQuestions(attemptData.testId.questions);
      setTimeRemaining(attemptData.testId.config.duration * 60);
      
      // Load existing answers
      const answerMap: any = {};
      attemptData.answers.forEach((a: any) => {
        if (a.selectedOption) {
          answerMap[a.questionId._id || a.questionId] = a.selectedOption;
        }
        if (a.isMarkedForReview) {
          setMarkedForReview(prev => new Set(prev).add(a.questionId._id || a.questionId));
        }
      });
      setAnswers(answerMap);
    } catch (error) {
      console.error('Failed to load test:', error);
      alert('Failed to load test');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, option: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    try {
      await apiService.tests.saveAnswer(attemptId!, {
        questionId,
        selectedOption: option,
        timeSpent,
        isMarkedForReview: markedForReview.has(questionId)
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleOptionSelect = (option: string) => {
    const questionId = questions[currentIndex]._id;
    setAnswers({ ...answers, [questionId]: option });
    saveAnswer(questionId, option);
  };

  const handleMarkForReview = () => {
    const questionId = questions[currentIndex]._id;
    const newMarked = new Set(markedForReview);
    if (newMarked.has(questionId)) {
      newMarked.delete(questionId);
    } else {
      newMarked.add(questionId);
    }
    setMarkedForReview(newMarked);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit the test?')) return;
    
    try {
      const res = await apiService.tests.submitTest(attemptId!);
      navigate(`/test/report/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId: string) => {
    if (answers[qId]) return 'answered';
    if (markedForReview.has(qId)) return 'marked';
    return 'not-visited';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Test</h2>
        <p className="text-slate-400 mb-6">Could not find any questions for this test.</p>
        <button
          onClick={() => navigate('/tests')}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-bold"
        >
          Back to Test Series
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const questionId = currentQuestion._id;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{test?.title}</h1>
            <p className="text-sm text-gray-400">{test?.type}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-400' : 'text-green-400'}`} />
              <span className={`text-lg font-mono font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Question Palette
            </button>
            
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          
          {/* Question Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">Question {currentIndex + 1} of {questions.length}</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
                {currentQuestion.subject}
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                {currentQuestion.chapter}
              </span>
            </div>
            
            <button
              onClick={handleMarkForReview}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                markedForReview.has(questionId) ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-gray-300'
              }`}
            >
              <Flag className="w-4 h-4" />
              {markedForReview.has(questionId) ? 'Marked' : 'Mark for Review'}
            </button>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800 rounded-xl p-6 mb-6"
            >
              <div className="text-lg mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
              
              {/* Options */}
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map(option => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[questionId] === option
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        answers[questionId] === option ? 'bg-purple-500 text-white' : 'bg-slate-600 text-gray-300'
                      }`}>
                        {option}
                      </div>
                      <span dangerouslySetInnerHTML={{ __html: currentQuestion.options[option] }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        {showPalette && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-80 bg-slate-800 border-l border-slate-700 p-6"
          >
            <h3 className="text-lg font-bold mb-4">Question Palette</h3>
            
            {/* Legend */}
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-600 rounded"></div>
                <span>Not Visited</span>
              </div>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q._id);
                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setQuestionStartTime(Date.now());
                    }}
                    className={`w-10 h-10 rounded font-bold ${
                      idx === currentIndex ? 'ring-2 ring-purple-500' : ''
                    } ${
                      status === 'answered' ? 'bg-green-500' :
                      status === 'marked' ? 'bg-yellow-500' :
                      'bg-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
