import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';
import NTATestPlayer, { NTAQuestion, NTASubmitData, QuestionMeta } from '@/components/NTATestPlayer';
import {
  AnswerPayload,
  answerPayloadFromAttempt,
  normalizeQuestions,
} from '@/lib/questionNormalization';
import { resolveDiagramMediaForQuestions } from '@/lib/questionMedia';
import { buildLocalReportAttempt } from '@/lib/testReportAnalytics';

interface LocationState {
  questions?: any[];
  attemptId?: string;
  testId?: string;
  title?: string;
  duration?: number; // minutes
  subject?: string;
  topic?: string;
  curriculumRun?: { runId: string };
  curriculumRestore?: any;
  curriculumContext?: {
    subject: string;
    chapterId: string;
    topic: string;
    subTopic: string;
    mode: 'practice' | 'test';
    uids?: number[];
  };
}

export default function CustomTestSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};

  const [loading, setLoading] = useState(!!state.attemptId);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<NTAQuestion[]>([]);
  const [initialMeta, setInitialMeta] = useState<QuestionMeta[] | undefined>();
  const [testInfo, setTestInfo] = useState({
    title: state.title || 'Custom Test',
    duration: state.duration || 60,
  });

  useEffect(() => {
    if (!state.attemptId) {
      if (state.questions) {
        resolveDiagramMediaForQuestions(normalizeQuestions(state.questions)).then(setQuestions);
      }
      return;
    }

    const loadAttempt = async () => {
      try {
        setLoading(true);
        const res = await apiService.tests.getAttempt(state.attemptId!);
        const attemptData = res.data?.data;
        const testData = attemptData?.testId || attemptData?.test || {};
        
        const rawQuestions = Array.isArray(testData?.questions) 
          ? testData.questions 
          : Array.isArray(attemptData?.questions) 
            ? attemptData.questions 
            : [];
            
        const normalized = await resolveDiagramMediaForQuestions(normalizeQuestions(rawQuestions));
        setQuestions(normalized);
        setTestInfo({
          title: testData.title || testInfo.title,
          duration: testData.config?.duration || testInfo.duration,
        });

        // Restore progress if available
        const metaArray: QuestionMeta[] = normalized.map(() => ({
          state: 'not-visited',
          answerPayload: null,
          bookmarked: false,
          note: '',
          timeSpent: 0,
        }));

        const savedAnswers = Array.isArray(attemptData?.answers) ? attemptData.answers : [];
        savedAnswers.forEach((ans: any) => {
          const qId = ans?.questionId?._id || ans?.questionId;
          const idx = normalized.findIndex(q => String(q._id || q.id) === String(qId));
          if (idx !== -1) {
            const payload = answerPayloadFromAttempt(normalized[idx], ans);
            metaArray[idx] = {
              ...metaArray[idx],
              answerPayload: payload,
              state: ans.isMarkedForReview ? 'answered-marked' : (payload ? 'answered' : 'not-visited'),
              timeSpent: ans.timeSpent || 0,
            };
          }
        });
        setInitialMeta(metaArray);

      } catch (err) {
        console.error('Failed to load attempt:', err);
        setError('Failed to load test attempt. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [state.attemptId, state.questions]);

  const handleAnswerChange = async (questionIndex: number, answer: AnswerPayload | null, meta: QuestionMeta) => {
    if (!state.attemptId) return;
    try {
      const question = questions[questionIndex];
      const selectedOption = answer?.kind === 'mcq' && Number.isInteger(answer.selectedOption)
        ? String.fromCharCode(65 + Number(answer.selectedOption))
        : null;
      await apiService.tests.saveAnswer(state.attemptId, {
        questionId: String(question._id || question.id),
        answerType: answer?.kind || question.type,
        answerPayload: answer,
        selectedOption,
        timeSpent: meta.timeSpent,
        isMarkedForReview: meta.state.includes('marked'),
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleSubmit = async (data: NTASubmitData) => {
    try {
      if (state.attemptId) {
        await apiService.tests.submitTest(state.attemptId);
        navigate(`/app/test/report/${state.attemptId}`);
      } else {
        if (state.curriculumRun?.runId) {
          await apiService.curriculum.submitRun(state.curriculumRun.runId, {
            answers: data.answers,
            questionTimes: data.meta.map((item) => Number(item.timeSpent || 0)),
            elapsedSeconds: Number(data.timeTaken || 0),
            remainingSeconds: null,
          });
        }

        const attemptData = buildLocalReportAttempt(
          questions,
          data,
          testInfo.title || state.title || 'Curriculum Quiz'
        );

        navigate('/app/test/report/curriculum', {
          state: {
            attemptData,
            meta: data.meta,
            timeTaken: data.timeTaken,
            returnTo: '/app/curriculum-browser',
            returnLabel: 'Back to Curriculum',
            returnState: state.curriculumRestore
              ? { curriculumRestore: state.curriculumRestore, refreshRoadmap: true }
              : undefined,
            retryTo: '/app/test/custom-session',
            retryState: state,
          },
        });
      }
    } catch (err) {
      console.error('Failed to submit test:', err);
      alert('Failed to submit test. Please check your connection.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading test questions...</p>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Session</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">{error || 'No questions were found for this session.'}</p>
        <button
          onClick={() => navigate('/app/test/custom/create')}
          className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold text-primary-foreground transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <NTATestPlayer
      questions={questions}
      title={testInfo.title}
      duration={testInfo.duration * 60}
      onSubmit={handleSubmit}
      onAnswerChange={handleAnswerChange}
      initialMeta={initialMeta}
    />
  );
}
