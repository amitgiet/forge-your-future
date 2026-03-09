import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/apiService';
import NTATestPlayer, { NTAQuestion, NTASubmitData } from '@/components/NTATestPlayer';
import { trackQuizAttempt } from '@/lib/quizTracking';

interface LocationState {
  questions?: any[];
  title?: string;
  duration?: number; // minutes
  subject?: string;
  topic?: string;
  curriculumRun?: { runId: string };
}

export default function CustomTestSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};

  const questions: NTAQuestion[] = useMemo(() => {
    if (!state.questions) return [];
    return state.questions.map((q: any) => {
      let correctAns = q.correctAnswer ?? q.correct ?? q.correct_option ?? null;

      // Map 'A', 'B', 'C', 'D' directly to 0, 1, 2, 3
      if (typeof correctAns === 'string' && /^[A-D]$/.test(correctAns)) {
        correctAns = correctAns.charCodeAt(0) - 65;
      }
      if (correctAns === null && Array.isArray(q.options)) {
        const foundIdx = q.options.findIndex((opt: any) => opt.isCorrect === true);
        if (foundIdx !== -1) {
          correctAns = foundIdx;
        }
      }

      return {
        _id: q._id || q.id,
        id: q._id || q.id,
        question: q.question || q.text || '',
        options: q.options || {},
        correctAnswer: correctAns,
        explanation: q.explanation || q.solution || '',
        subject: q.subject || state.subject || '',
        chapter: q.chapter || '',
        topic: q.topic || '',
        difficulty: q.difficulty || '',
        imageUrl: q.imageUrl || q.image || '',
      };
    });
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
      if (state.curriculumRun?.runId) {
        // If this is an imported curriculum run, submit it to the API
        const submitDataParams = {
          answers: questions.map((_, i) => data.answers[i] ?? null),
          questionTimes: data.meta.map(m => m.timeSpent),
          elapsedSeconds: data.timeTaken,
          remainingSeconds: Math.max(0, (state.duration || 60) * 60 - data.timeTaken)
        };
        await apiService.curriculum.submitRun(state.curriculumRun.runId, submitDataParams);
      } else {
        await trackQuizAttempt({
          quizType: 'normal_test',
          totalQuestions: total,
          correctAnswers: correct,
          timeTaken: data.timeTaken,
          subject: state.subject,
          topic: state.topic,
        });
      }
    } catch (err) {
      console.error('Failed to submit run or track attempt:', err);
    }

    // Build synthetic results for TestReport.tsx
    const results = {
      percentage: total > 0 ? (correct / total) * 100 : 0,
      marksObtained: correct * 4 - incorrect,
      totalMarks: total * 4,
      correct,
      incorrect,
      skipped: total - correct - incorrect,
      timeAnalysis: {
        avgTimePerQuestion: total > 0 ? data.timeTaken / total : 0,
      },
      subjectWise: [
        {
          subject: state.subject || 'General',
          correct,
          total,
          accuracy: total > 0 ? (correct / total) * 100 : 0,
        }
      ],
      chapterWise: [
        {
          chapter: state.topic || 'General',
          subject: state.subject || 'General',
          correct,
          total,
          accuracy: total > 0 ? (correct / total) * 100 : 0,
        }
      ],
    };

    // Navigate to results
    navigate('/test/report/curriculum', {
      state: {
        attemptData: {
          testId: { title: state.title || 'Custom Test' },
          results,
          weakAreas: [],
        },
        timeTaken: data.timeTaken,
        meta: data.meta,
        questions: questions.map((q, i) => ({
          ...q,
          userAnswer: data.answers[i],
        })),
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
