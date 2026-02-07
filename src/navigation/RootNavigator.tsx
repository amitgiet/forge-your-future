import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './rootRef';

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import Onboarding from '../screens/Onboarding';
import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import Placeholder from '../screens/Placeholder';
import Quiz from '../screens/Quiz';
import QuizStart from '../screens/QuizStart';
import QuizResults from '../screens/QuizResults';
import QuizGenerator from '../screens/QuizGenerator';
import Revision from '../screens/Revision';
import RevisionDashboard from '../screens/RevisionDashboard';
import TrackTopic from '../screens/TrackTopic';
import TestSeries from '../screens/TestSeries';
import TestStart from '../screens/TestStart';
import TestSession from '../screens/TestSession';
import TestReport from '../screens/TestReport';
import CustomTestCreate from '../screens/CustomTestCreate';
import CreateLearningPath from '../screens/CreateLearningPath';
import MyLearningPaths from '../screens/MyLearningPaths';
import LearningPathFlow from '../screens/LearningPathFlow';
import StartPractice from '../screens/StartPractice';
import PracticeSession from '../screens/PracticeSession';
import MyChallenges from '../screens/MyChallenges';
import DailyChallenge from '../screens/DailyChallenge';
import Leaderboard from '../screens/Leaderboard';
import MockAnalyzer from '../screens/MockAnalyzer';
import NCERTSearch from '../screens/NCERTSearch';
import Social from '../screens/Social';
import AddFriend from '../screens/AddFriend';
import ChatPage from '../screens/ChatPage';
import NotFound from '../screens/NotFound';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="QuizStart" component={QuizStart} />
        <Stack.Screen name="QuizSession" component={Quiz} />
        <Stack.Screen name="QuizResults" component={QuizResults} />
        <Stack.Screen name="QuizGenerator" component={QuizGenerator} />
        <Stack.Screen name="Revision" component={Revision} />
        <Stack.Screen name="RevisionDashboard" component={RevisionDashboard} />
        <Stack.Screen name="TrackTopic" component={TrackTopic} />
        <Stack.Screen name="TestSeries" component={TestSeries} />
        <Stack.Screen name="TestStart" component={TestStart} />
        <Stack.Screen name="TestSession" component={TestSession} initialParams={{ attemptId: '' }} />
        <Stack.Screen name="TestReport" component={TestReport} initialParams={{ attemptId: '' }} />
        <Stack.Screen name="CustomTestCreate" component={CustomTestCreate} />
        <Stack.Screen name="CreateLearningPath" component={CreateLearningPath} />
        <Stack.Screen name="MyLearningPaths" component={MyLearningPaths} />
        <Stack.Screen name="LearningPath" component={LearningPathFlow} initialParams={{ pathId: '' }} />
        <Stack.Screen name="StartPractice" component={StartPractice} />
        <Stack.Screen name="PracticeSession" component={PracticeSession} initialParams={{ challengeId: '' }} />
        <Stack.Screen name="MyChallenges" component={MyChallenges} />
        <Stack.Screen name="DailyChallenge" component={DailyChallenge} />
        <Stack.Screen name="Leaderboard" component={Leaderboard} />
        <Stack.Screen name="MockAnalyzer" component={MockAnalyzer} />
        <Stack.Screen name="NCERTSearch" component={NCERTSearch} />
        <Stack.Screen name="Social" component={Social} />
        <Stack.Screen name="AddFriend" component={AddFriend} />
        <Stack.Screen name="Chat" component={ChatPage} initialParams={{ chatId: '' }} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
