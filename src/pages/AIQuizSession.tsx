import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuizPlayer, { QuizQuestion } from '@/components/QuizPlayer';
import { apiService } from '@/lib/apiService';

type SessionAnswer = {
  questionId: string;
  selected: number | null;
  correct: boolean;
  timeTaken: number;
  chapter: string;
};

type LocationState = {
  // If present, store attempt using quiz-generator submit API
  quizId?: string;
  // If present, store attempt using neuronz session API
  lineId?: string;
  topic?: string;
  subject?: string;
  chapter?: string;
  questions?: QuizQuestion[];
};

export default function AIQuizSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [submitting, setSubmitting] = useState(false);

  const questions: QuizQuestion[] = Array.isArray(state.questions) ? state.questions : [];
  const topic = String(state.topic || '').trim() || 'Practice Quiz';
  const subject = String(state.subject || '').trim() || 'General';
  const chapter = String(state.chapter || '').trim() || 'General';

  const title = useMemo(() => {
    const left = subject && subject !== 'General' ? subject : 'AI';
    return `${left} Quiz: ${topic}`;
  }, [subject, topic]);

  const onSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const correctCount = data.answers.filter((ans, idx) => ans !== null && ans === questions[idx]?.correctAnswer).length;

      // Build answers for existing /quiz-results page
      const sessionAnswers: SessionAnswer[] = questions.map((q, idx) => {
        const raw = data.answers[idx];
        const selected = typeof raw === 'number' ? raw : null;
        const correct = selected !== null && selected === q.correctAnswer;
        return {
          questionId: String(q._id || q.id || idx + 1),
          selected,
          correct,
          timeTaken: Math.floor((data.timeTaken || 0) / Math.max(1, questions.length)),
          chapter,
        };
      });

      // Persist attempts (best-effort). Don't block user if API fails.
      if (state.quizId) {
        try {
          await apiService.quizGenerator.submitQuizAttempt(String(state.quizId), data);
        } catch {
          // ignore
        }
      } else if (state.lineId) {
        const review = questions.map((q, idx) => {
          const rawAnswer = data.answers[idx];
          const selectedAnswer = typeof rawAnswer === 'number' ? rawAnswer : null;
          return {
            question: q.question,
            options: Array.isArray(q.options) ? q.options.map(String) : [],
            selectedAnswer,
            correctAnswer: Number(q.correctAnswer),
            explanation: q.explanation,
          };
        });

        try {
          await apiService.neuronz.processLineSession({
            lineId: String(state.lineId),
            correctAnswers: correctCount,
            totalQuizzes: questions.length,
            timeSpent: data.timeTaken,
            review,
          });
        } catch {
          // ignore
        }
      }

      navigate('/quiz-results', {
        state: {
          mode: 'practice',
          answers: sessionAnswers,
          totalQuestions: questions.length,
          subject,
          topic,
          returnTo: '/app/ai-assistant',
          returnLabel: 'AI Assistant',
          prefillPrompt: `Give me another quiz on ${topic} and focus on my mistakes.`,
          retryTo: '/ai-quiz-session',
          retryState: {
            quizId: state.quizId,
            lineId: state.lineId,
            topic,
            subject,
            chapter,
            questions
          }
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="nf-card max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No quiz loaded</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Please go back to the AI Assistant and start a quiz again.
          </p>
          <button onClick={() => navigate('/app/ai-assistant')} className="nf-btn-primary w-full">
            Back to AI Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="nf-safe-area p-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <QuizPlayer
        questions={questions}
        title={title}
        onSubmit={onSubmit}
        showPalette={true}
        showTimer={false}
        allowReviewMarking={true}
        config={{
          showExplanations: false,
          showDifficulty: true,
          showMarks: false,
        }}
      />
    </>
  );
}
