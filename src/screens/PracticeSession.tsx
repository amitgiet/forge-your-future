import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import QuizPlayer, { QuizQuestion } from '../components/QuizPlayer';

export default function PracticeSession() {
  const route = useRoute<any>();
  const challengeId = route.params?.challengeId || '';
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentLineId, setCurrentLineId] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);

  const loadTodaySchedule = async () => {
    if (!challengeId) return;
    try {
      const res = await apiService.challenges.getTodaySchedule(challengeId);
      const data = res.data?.data || res.data;
      setChallenge(data?.challenge);
      setTodaySchedule(data?.todaySchedule);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadTodaySchedule();
  }, [challengeId]);

  const loadCurrentQuiz = async () => {
    if (!todaySchedule?.quizzes?.length) return;
    const current = todaySchedule.quizzes.find((q: any) => !q.isCompleted);
    if (!current) return;
    const lineId = current.lineId?._id || current.lineId;
    if (!lineId) return;
    setCurrentLineId(lineId);
    setQuizIndex(todaySchedule.quizzes.findIndex((q: any) => !q.isCompleted));
    try {
      const response = await apiService.neuronz.generateMicroQuizzes(lineId);
      const raw = response.data?.data || response.data || [];
      const mapped: QuizQuestion[] = raw.map((q: any) => ({
        id: q._id || Math.random().toString(),
        question: q.question,
        type: 'mcq',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
      setQuizzes(mapped);
    } catch (_) {
      setQuizzes([]);
    }
  };

  useEffect(() => {
    if (todaySchedule && !todaySchedule.isCompleted && todaySchedule.quizzes?.length && quizzes.length === 0) {
      loadCurrentQuiz();
    }
  }, [todaySchedule]);

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    const correctCount = data.answers.filter((ans, idx) => ans !== null && ans === quizzes[idx].correctAnswer).length;
    const score = quizzes.length ? Math.round((correctCount / quizzes.length) * 100) : 0;
    try {
      await apiService.challenges.completeQuiz(challengeId, todaySchedule.day, quizIndex, { score, timeSpent: data.timeTaken });
      setQuizzes([]);
      setCurrentLineId(null);
      await loadTodaySchedule();
    } catch (_) {}
  };

  if (!challengeId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Invalid challenge.</Text>
        <Pressable style={styles.btn} onPress={() => navigate('MyChallenges')}>
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!todaySchedule) {
    return (
      <View style={styles.centered}>
        <Ionicons name="calendar-outline" size={64} color={colors.mutedForeground} />
        <Text style={styles.title}>No Practice Today</Text>
        <Text style={styles.sub}>Check back tomorrow for your next session!</Text>
        <Pressable style={styles.btn} onPress={() => navigate('Dashboard')}>
          <Text style={styles.btnText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  if (todaySchedule.isCompleted) {
    return (
      <View style={styles.centered}>
        <View style={styles.trophyBox}>
          <Ionicons name="trophy" size={48} color={colors.success} />
        </View>
        <Text style={styles.title}>Day {todaySchedule.day} Complete!</Text>
        <Text style={styles.sub}>Great work! Come back tomorrow for Day {(todaySchedule.day || 0) + 1}</Text>
        {challenge?.progress?.streak != null && (
          <View style={styles.streakBox}>
            <Text style={styles.streakNum}>{challenge.progress.streak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        )}
        <Pressable style={styles.btn} onPress={() => navigate('Dashboard')}>
          <Text style={styles.btnText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  if (quizzes.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{challenge?.title || 'Practice'}</Text>
          <Text style={styles.quizMeta}>
            Day {todaySchedule.day} of {challenge?.duration ?? '?'} • {todaySchedule.completedQuizzes}/{todaySchedule.targetQuizzes} done
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((todaySchedule.completedQuizzes || 0) / (todaySchedule.targetQuizzes || 1)) * 100}%` }]} />
          </View>
        </View>
        <QuizPlayer
          questions={quizzes}
          title={`Day ${todaySchedule.day} Quiz`}
          onSubmit={handleQuizSubmit}
          showPalette={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backBtn} onPress={() => navigate('MyChallenges')}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{challenge?.title || "Today's practice"}</Text>
        <Text style={styles.sub}>Day {todaySchedule.day} of {challenge?.duration ?? '?'}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((todaySchedule.completedQuizzes || 0) / (todaySchedule.targetQuizzes || 1)) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{todaySchedule.completedQuizzes}/{todaySchedule.targetQuizzes} quizzes completed</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  scroll: { padding: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtnText: { fontSize: 16, color: colors.primary, fontWeight: '600', marginLeft: 8 },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground },
  sub: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
  empty: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  trophyBox: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(34,197,94,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  streakBox: { marginVertical: 16, paddingVertical: 16, paddingHorizontal: 32, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  streakNum: { fontSize: 28, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  streakLabel: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 },
  quizHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  quizTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  quizMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressText: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
  loadingText: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
});
