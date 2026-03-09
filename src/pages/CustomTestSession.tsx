import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import NTATestPlayer, { NTAQuestion, NTASubmitData } from '@/components/NTATestPlayer';
import { trackQuizAttempt } from '@/lib/quizTracking';

interface LocationState {
  questions?: any[];
  title?: string;
  duration?: number; // minutes
  subject?: string;
  topic?: string;
}

export default function CustomTestSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};

  const questions: NTAQuestion[] = useMemo(() => {
    if (!state.questions) return [];
    return state.questions.map((q: any) => ({
      _id: q._id || q.id,
      id: q._id || q.id,
      question: q.question || q.text || '',
      options: q.options || {},
      correctAnswer: q.correctAnswer ?? q.correct ?? null,
      explanation: q.explanation || q.solution || '',
      subject: q.subject || state.subject || '',
      chapter: q.chapter || '',
      topic: q.topic || '',
      difficulty: q.difficulty || '',
      imageUrl: q.imageUrl || q.image || '',
    }));
  }, [state.questions, state.subject]);

  const handleSubmit = async (data: NTASubmitData) => {
    // Calculate results
    let correct = 0;
    let incorrect = 0;
    const total = questions.length;

    questions.forEach((q, i) => {
      const selected = data.answers[i];
      if (selected === null) return;
      const correctIdx =
        typeof q.correctAnswer === 'string'
          ? q.correctAnswer.charCodeAt(0) - 65
          : typeof q.correctAnswer === 'number'
          ? q.correctAnswer
          : null;
      if (correctIdx !== null && selected === correctIdx) correct++;
      else incorrect++;
    });

    // Track attempt
    try {
      await trackQuizAttempt({
        quizType: 'normal_test',
        totalQuestions: total,
        correctAnswers: correct,
        timeTaken: data.timeTaken,
        subject: state.subject,
        topic: state.topic,
      });
    } catch {}

    // Navigate to results
    navigate('/quiz-results', {
      state: {
        questions: questions.map((q, i) => ({
          ...q,
          userAnswer: data.answers[i],
          timeSpent: data.meta[i].timeSpent,
          bookmarked: data.meta[i].bookmarked,
        })),
        correct,
        incorrect,
        skipped: total - correct - incorrect,
        total,
        timeTaken: data.timeTaken,
        title: state.title || 'Custom Test',
        subject: state.subject,
        topic: state.topic,
        meta: data.meta,
      },
    });
  };

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">No Questions Loaded</h2>
        <p className="text-muted-foreground mb-6">Please create a test first.</p>
        <motion.button
          onClick={() => navigate('/test/custom/create')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold text-primary-foreground"
        >
          Create Test
        </motion.button>
      </div>
    );
  }

  const durationSeconds = (state.duration || 60) * 60;

  return (
    <NTATestPlayer
      questions={questions}
      title={state.title || 'Custom Test'}
      duration={durationSeconds}
      onSubmit={handleSubmit}
    />
  );
}
