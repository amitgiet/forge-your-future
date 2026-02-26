import apiService from './apiService';

export type QuizAttemptType = 'normal_practice' | 'normal_test' | 'neuronz';

interface TrackQuizAttemptPayload {
  quizType: QuizAttemptType;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  subject?: string;
  topic?: string;
  lineId?: string;
  metadata?: Record<string, unknown>;
}

const LOCAL_BUFFER_KEY = 'quiz_attempt_tracking_buffer';

const pushToLocalBuffer = (payload: TrackQuizAttemptPayload) => {
  try {
    const raw = localStorage.getItem(LOCAL_BUFFER_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const buffered = Array.isArray(current) ? current : [];
    buffered.push({
      ...payload,
      trackedAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_BUFFER_KEY, JSON.stringify(buffered.slice(-100)));
  } catch {
    // Ignore localStorage errors to avoid blocking quiz flow.
  }
};

export const trackQuizAttempt = async (payload: TrackQuizAttemptPayload): Promise<void> => {
  try {
    await apiService.sessions.createSession({
      sessionType: 'quiz',
      quizType: payload.quizType,
      totalQuestions: payload.totalQuestions,
      correctAnswers: payload.correctAnswers,
      accuracy:
        payload.totalQuestions > 0
          ? Math.round((payload.correctAnswers / payload.totalQuestions) * 100)
          : 0,
      timeTaken: payload.timeTaken,
      subject: payload.subject,
      topic: payload.topic,
      lineId: payload.lineId,
      metadata: payload.metadata || {},
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Keep a local fallback so attempts are not silently lost.
    pushToLocalBuffer(payload);
    console.error('Quiz tracking failed, buffered locally:', error);
  }
};

