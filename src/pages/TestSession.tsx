import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../lib/apiService';
import NTATestPlayer, { NTAQuestion, NTASubmitData, QuestionMeta } from '@/components/NTATestPlayer';
import { AnswerPayload, answerPayloadFromAttempt, normalizeQuestions } from '@/lib/questionNormalization';
import { resolveDiagramMediaForQuestions } from '@/lib/questionMedia';

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
  }, [attemptId]);

  const loadTest = async () => {
    try {
      const res = await apiService.tests.getAttempt(attemptId!);
      const attemptData = res.data?.data || res.data;
      const testData = attemptData?.testId || attemptData?.test || {};
      setTest(testData);

      const rawQuestions: any[] = Array.isArray(testData?.questions)
        ? testData.questions
        : Array.isArray(attemptData?.questions)
          ? attemptData.questions
          : [];
      
      const normalizedQuestions: NTAQuestion[] = await resolveDiagramMediaForQuestions(normalizeQuestions(rawQuestions));

      setQuestions(normalizedQuestions);

      // Restore existing answers into meta
      const metaArray: QuestionMeta[] = normalizedQuestions.map(() => ({
        state: 'not-visited' as const,
        answerPayload: null,
        bookmarked: false,
        note: '',
        timeSpent: 0,
      }));

      attemptData.answers?.forEach((a: any) => {
        const qIndex = normalizedQuestions.findIndex(
          (q: any) => String(q._id || q.id) === String(a.questionId?._id || a.questionId)
        );
        if (qIndex !== -1) {
          const payload = answerPayloadFromAttempt(normalizedQuestions[qIndex], a);
          if (payload) {
            metaArray[qIndex].answerPayload = payload;
            metaArray[qIndex].state = a.isMarkedForReview ? 'answered-marked' : 'answered';
          } else if (a.isMarkedForReview) {
            metaArray[qIndex].state = 'marked-review';
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
        state: { meta: data.meta, timeTaken: data.timeTaken, questions },
      });
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError('Failed to submit test');
    }
  };

  const handleAnswerChange = async (questionIndex: number, answer: AnswerPayload | null, meta: QuestionMeta) => {
    if (!attemptId) return;
    const question = questions[questionIndex] as any;
    if (!question?._id) return;

    try {
      const selectedOption = answer?.kind === 'mcq' && Number.isInteger(answer.selectedOption)
        ? String.fromCharCode(65 + Number(answer.selectedOption))
        : null;
      await apiService.tests.saveAnswer(attemptId, {
        questionId: question._id,
        answerType: answer?.kind || question.type,
        answerPayload: answer,
        selectedOption,
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
