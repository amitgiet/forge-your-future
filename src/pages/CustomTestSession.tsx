import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';
import NTATestPlayer, { NTAQuestion, NTASubmitData, QuestionMeta } from '@/components/NTATestPlayer';

interface LocationState {
  questions?: any[];
  attemptId?: string;
  testId?: string;
  title?: string;
  duration?: number; // minutes
  subject?: string;
  topic?: string;
}

function optionToIndex(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const clean = value.trim().toUpperCase();
    if (/^[A-D]$/.test(clean)) return clean.charCodeAt(0) - 65;
    const num = Number(clean);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function getText(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    // Handle { en: '...', hi: '...' } or similar objects
    const resolved = val.en || val.english || val.hi || val.hindi || Object.values(val).find(v => typeof v === 'string');
    return typeof resolved === 'string' ? resolved : '';
  }
  return String(val);
}

function normalizeQuestion(raw: any, defaultSubject?: string): NTAQuestion {
  const rawOptions = Array.isArray(raw?.options) ? raw.options : [];
  const options = rawOptions.length > 0
    ? rawOptions.map((opt: any) => {
        if (typeof opt === 'string') return opt;
        if (opt && typeof opt === 'object') {
          return getText(opt.text || opt.value || opt);
        }
        return '';
      })
    : ['A', 'B', 'C', 'D'].map((key) => {
        const value = raw?.options?.[key] || raw?.options?.[key.toLowerCase()];
        return getText(value);
      });

  let correctAns = raw.correctAnswer ?? raw.correct ?? raw.correct_option ?? null;
  if (typeof correctAns === 'string' && /^[A-D]$/.test(correctAns)) {
    correctAns = correctAns.charCodeAt(0) - 65;
  }

  return {
    _id: raw?._id || raw?.id,
    id: raw?._id || raw?.id,
    question: getText(raw.question || raw.text),
    options,
    correctAnswer: correctAns,
    explanation: getText(raw.explanation || raw.solution),
    subject: raw.subject || defaultSubject || '',
    chapter: raw.chapter || raw.chapterId || '',
    topic: raw.topic || '',
    difficulty: raw.difficulty || '',
    imageUrl: raw.imageUrl || raw.image || '',
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
        setQuestions(state.questions.map(q => normalizeQuestion(q, state.subject)));
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
            
        const normalized = rawQuestions.map((q: any) => normalizeQuestion(q));
        setQuestions(normalized);
        setTestInfo({
          title: testData.title || testInfo.title,
          duration: testData.config?.duration || testInfo.duration,
        });

        // Restore progress if available
        const metaArray: QuestionMeta[] = normalized.map(() => ({
          state: 'not-visited',
          selectedOption: null,
          bookmarked: false,
          note: '',
          timeSpent: 0,
        }));

        const savedAnswers = Array.isArray(attemptData?.answers) ? attemptData.answers : [];
        savedAnswers.forEach((ans: any) => {
          const qId = ans?.questionId?._id || ans?.questionId;
          const idx = normalized.findIndex(q => String(q._id || q.id) === String(qId));
          if (idx !== -1) {
            const selIdx = optionToIndex(ans.selectedOption);
            metaArray[idx] = {
              ...metaArray[idx],
              selectedOption: selIdx,
              state: ans.isMarkedForReview ? 'answered-marked' : (selIdx !== null ? 'answered' : 'not-visited'),
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

  const handleAnswerChange = async (questionIndex: number, answer: number | null, meta: QuestionMeta) => {
    if (!state.attemptId) return;
    try {
      const question = questions[questionIndex];
      await apiService.tests.saveAnswer(state.attemptId, {
        questionId: String(question._id || question.id),
        selectedOption: answer !== null ? String.fromCharCode(65 + answer) : '',
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
        // Fallback for legacy local questions flow if needed, but we should focus on the new flow
        // navigate to results with local state...
        navigate('/app/dashboard'); 
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
