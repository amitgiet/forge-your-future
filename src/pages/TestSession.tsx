import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../lib/apiService';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';
import BottomNav from '@/components/BottomNav';

export default function TestSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [initialAnswers, setInitialAnswers] = useState<(number | number[] | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    try {
      const res = await apiService.tests.getAttempt(attemptId!);
      const attemptData = res.data.data;
      setTest(attemptData.testId);
      setQuestions(attemptData.testId.questions);
      
      // Convert existing answers to array format
      const answerArray = new Array(attemptData.testId.questions.length).fill(null);
      attemptData.answers.forEach((a: any) => {
        const qIndex = attemptData.testId.questions.findIndex((q: any) => q._id === (a.questionId._id || a.questionId));
        if (qIndex !== -1 && a.selectedOption) {
          // Convert option letter to index (A=0, B=1, etc.)
          answerArray[qIndex] = a.selectedOption.charCodeAt(0) - 65;
        }
      });
      setInitialAnswers(answerArray);
    } catch (error) {
      console.error('Failed to load test:', error);
      setError('Failed to load test');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    try {
      const res = await apiService.tests.submitTest(attemptId!);
      navigate(`/test/report/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      setError('Failed to submit test');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Test</h2>
        <p className="text-muted-foreground mb-6">{error || 'Could not find any questions for this test.'}</p>
        <motion.button
          onClick={() => navigate('/tests')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold text-primary-foreground"
        >
          Back to Test Series
        </motion.button>
      </div>
    );
  }

  // Transform questions to QuizQuestion format
  const quizQuestions = questions.map((q: any) => ({
    id: q._id,
    question: q.question,
    type: 'mcq' as const,
    options: ['A', 'B', 'C', 'D'].map((letter) => q.options[letter]),
    correctAnswer: q.correctAnswer ? q.correctAnswer.charCodeAt(0) - 65 : null,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="nf-safe-area p-4 max-w-2xl mx-auto">
        <motion.button
          onClick={() => navigate('/tests')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tests
        </motion.button>
      </div>

      <QuizPlayer
        questions={quizQuestions}
        title={test?.title || 'Test'}
        initialAnswers={initialAnswers}
        onSubmit={handleSubmit}
        showPalette={true}
        showTimer={test?.config?.duration ? true : false}
        duration={test?.config?.duration ? test.config.duration * 60 : 0}
        allowReviewMarking={true}
        config={{
          showExplanations: false,
          showDifficulty: false,
          showMarks: false,
        }}
      />

      <BottomNav />
    </div>
  );
}
