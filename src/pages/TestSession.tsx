import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../lib/apiService';
import NTATestPlayer, { NTAQuestion, NTASubmitData, QuestionMeta } from '@/components/NTATestPlayer';

export default function TestSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<NTAQuestion[]>([]);
  const [initialMeta, setInitialMeta] = useState<QuestionMeta[] | undefined>();
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

      const rawQuestions: NTAQuestion[] = attemptData.testId.questions;
      setQuestions(rawQuestions);

      // Restore existing answers into meta
      const metaArray: QuestionMeta[] = rawQuestions.map(() => ({
        state: 'not-visited' as const,
        selectedOption: null,
        bookmarked: false,
        note: '',
        timeSpent: 0,
      }));

      attemptData.answers?.forEach((a: any) => {
        const qIndex = rawQuestions.findIndex(
          (q: any) => q._id === (a.questionId?._id || a.questionId)
        );
        if (qIndex !== -1 && a.selectedOption !== null && a.selectedOption !== undefined) {
          let optIdx: number | null = null;
          if (typeof a.selectedOption === 'string' && a.selectedOption.length > 0) {
            optIdx = a.selectedOption.toUpperCase().charCodeAt(0) - 65;
          } else if (typeof a.selectedOption === 'number') {
            optIdx = a.selectedOption;
          }
          if (optIdx !== null && optIdx >= 0) {
            metaArray[qIndex].selectedOption = optIdx;
            metaArray[qIndex].state = a.isMarkedForReview ? 'answered-marked' : 'answered';
          }
        }
      });

      setInitialMeta(metaArray);
    } catch (err) {
      console.error('Failed to load test:', err);
      setError('Failed to load test');
      navigate('/app/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: NTASubmitData) => {
    try {
      await apiService.tests.submitTest(attemptId!);
      // Pass analytics meta through navigation state
      navigate(`/app/test/report/${attemptId}`, {
        state: { meta: data.meta, timeTaken: data.timeTaken },
      });
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError('Failed to submit test');
    }
  };

  const handleAnswerChange = async (questionIndex: number, answer: number | null, meta: QuestionMeta) => {
    if (!attemptId) return;
    const question = questions[questionIndex] as any;
    if (!question?._id) return;

    try {
      await apiService.tests.saveAnswer(attemptId, {
        questionId: question._id,
        selectedOption: answer !== null ? String.fromCharCode(65 + answer) : '',
        timeSpent: meta.timeSpent,
        isMarkedForReview: meta.state === 'marked-review' || meta.state === 'answered-marked',
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Test</h2>
        <p className="text-muted-foreground mb-6">{error || 'No questions found.'}</p>
        <motion.button
          onClick={() => navigate('/app/tests')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold text-primary-foreground"
        >
          Back to Test Series
        </motion.button>
      </div>
    );
  }

  const duration = test?.config?.duration ? test.config.duration * 60 : 10800; // default 3 hours

  return (
    <NTATestPlayer
      questions={questions}
      title={test?.title || 'Mock Test'}
      duration={duration}
      onSubmit={handleSubmit}
      onAnswerChange={handleAnswerChange}
      initialMeta={initialMeta}
    />
  );
}
