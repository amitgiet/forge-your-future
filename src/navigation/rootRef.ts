import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Main: undefined;
  Quiz: undefined;
  QuizStart: undefined;
  QuizSession: { mode?: string; questionCount?: number; topic?: string; subject?: string } | undefined;
  QuizResults: undefined;
  QuizGenerator: undefined;
  Revision: undefined;
  RevisionDashboard: undefined;
  TrackTopic: undefined;
  TestSeries: undefined;
  TestStart: { testId: string };
  TestSession: { attemptId: string };
  TestReport: { attemptId: string };
  CustomTestCreate: undefined;
  CreateLearningPath: undefined;
  MyLearningPaths: undefined;
  LearningPath: { pathId: string };
  StartPractice: undefined;
  PracticeSession: { challengeId: string };
  MyChallenges: undefined;
  DailyChallenge: undefined;
  Leaderboard: undefined;
  MockAnalyzer: undefined;
  NCERTSearch: undefined;
  Profile: undefined;
  Social: undefined;
  AddFriend: undefined;
  Chat: { chatId: string };
  NotFound: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<K extends keyof RootStackParamList>(
  name: K,
  params?: RootStackParamList[K] extends undefined ? undefined : RootStackParamList[K]
) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as (n: string, p?: object) => void)(name as string, params as object);
  }
}

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
}
