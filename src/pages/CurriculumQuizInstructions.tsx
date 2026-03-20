import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ClipboardCheck, Clock3, FileText, PlayCircle } from 'lucide-react';

interface LocationState {
  questions?: any[];
  title?: string;
  duration?: number;
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
  };
}

export default function CurriculumQuizInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};

  const totalQuestions = state.questions?.length || 0;
  const duration = Number(state.duration || 0);
  const mode = state.curriculumContext?.mode || 'practice';

  const marksInfo = useMemo(() => {
    const totalMarks = totalQuestions * 4;
    return { totalMarks };
  }, [totalQuestions]);

  const handleStart = () => {
    if (!totalQuestions) {
      navigate(-1);
      return;
    }
    navigate('/app/test/custom-session', { state });
  };

  if (!totalQuestions) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-warning" />
          <h1 className="text-xl font-semibold text-foreground">Quiz data not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please start the quiz again from the curriculum roadmap.</p>
          <button
            onClick={() => navigate('/app/curriculum-browser')}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h1 className="text-2xl font-bold text-foreground">Curriculum Quiz Instructions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.title || 'Quiz'} for {state.topic || 'selected topic'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Questions</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{totalQuestions}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{duration} min</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="mt-1 text-lg font-semibold capitalize text-foreground">{mode}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Total Marks</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{marksInfo.totalMarks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 className="text-lg font-semibold text-foreground">What you will get in report</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" />
              Your selected option and the correct option for each question.
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              Explanation support with a "View Explanation" toggle on result cards.
            </li>
            <li className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              Accuracy and timing summary for your attempt.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 className="text-lg font-semibold text-foreground">Important notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Submit once you finish. Report and analytics open immediately after submission.</li>
            <li>You can retake from report page or curriculum roadmap.</li>
            <li>Back from report returns to your curriculum chapter/topic roadmap.</li>
          </ul>

          <button
            onClick={handleStart}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <PlayCircle className="h-4 w-4" />
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
