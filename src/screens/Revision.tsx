import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadDueLines, getMasteryProgress, generateMicroQuizzes, processLineSession } from '../store/slices/neuronzSlice';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import BottomNav from '../components/BottomNav';
import QuizPlayer, { QuizQuestion } from '../components/QuizPlayer';

const LEVEL_ICONS = ['📚', '🧠', '📝', '🔄', '✅', '📖', '🚀'];

export default function Revision() {
  const dispatch = useAppDispatch();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [generatingQuizzes, setGeneratingQuizzes] = useState(false);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(loadDueLines());
    await dispatch(getMasteryProgress());
    setRefreshing(false);
  };

  const startLineSession = async (line: any) => {
    const lineId = typeof line.lineId === 'string' ? line.lineId : line.lineId?._id;
    if (!lineId) return;
    setSelectedLine(line);
    setGeneratingQuizzes(true);
    setQuizzes([]);
    try {
      const result = await dispatch(generateMicroQuizzes(lineId)).unwrap();
      const transformed: QuizQuestion[] = (result || []).map((q: any) => ({
        id: q._id || Math.random().toString(),
        question: q.question,
        type: 'mcq',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
      setQuizzes(transformed);
    } catch (_) {
      Alert.alert('Error', 'Failed to load quizzes');
      setSelectedLine(null);
    } finally {
      setGeneratingQuizzes(false);
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    if (!selectedLine) return;
    const correctCount = data.answers.filter((ans, idx) => ans !== null && ans === quizzes[idx].correctAnswer).length;
    const lineId = typeof selectedLine.lineId === 'string' ? selectedLine.lineId : selectedLine.lineId?._id;
    if (!lineId) return;
    try {
      await dispatch(processLineSession({
        lineId,
        correctAnswers: correctCount,
        totalQuizzes: quizzes.length,
        timeSpent: data.timeTaken,
      })).unwrap();
      await dispatch(loadDueLines());
      await dispatch(getMasteryProgress());
      setSelectedLine(null);
      setQuizzes([]);
    } catch (_) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    }
  };

  if (generatingQuizzes) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingLabel}>Loading quizzes...</Text>
      </View>
    );
  }

  if (selectedLine && quizzes.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <Pressable style={styles.backBtn} onPress={() => { setSelectedLine(null); setQuizzes([]); }}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.quizTitle}>Revision Quiz</Text>
        </View>
        <QuizPlayer
          questions={quizzes}
          title="Revision Quiz"
          onSubmit={handleQuizSubmit}
          showPalette={true}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>7-Level Revision</Text>
          <Pressable onPress={onRefresh} disabled={refreshing}>
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{dueLines?.total ?? 0}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.success }]}>{masteryProgress?.masteryPercentage ?? 0}%</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
        </View>

        {(!dueLines?.lines || dueLines.lines.length === 0) ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No topics due today. Great job!</Text>
            <Pressable style={styles.btn} onPress={() => navigate('RevisionDashboard')}>
              <Text style={styles.btnText}>View Dashboard</Text>
            </Pressable>
          </View>
        ) : (
          dueLines.lines.map((line: any) => (
            <Pressable key={line._id} style={styles.lineCard} onPress={() => startLineSession(line)}>
              <Text style={styles.lineEmoji}>{LEVEL_ICONS[(line.level || 1) - 1]}</Text>
              <View style={styles.lineContent}>
                <Text style={styles.lineText} numberOfLines={2}>{line.lineId?.ncertText || 'NCERT Line'}</Text>
                <Text style={styles.lineMeta}>Level {line.level} • {line.lineId?.subject}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}

        <Pressable style={styles.ctaBtn} onPress={() => navigate('RevisionDashboard')}>
          <Text style={styles.ctaText}>Revision Dashboard</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLabel: { marginTop: 12, color: colors.mutedForeground },
  quizHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  quizTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginLeft: 12 },
  scroll: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.foreground },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  lineCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  lineEmoji: { fontSize: 24, marginRight: 12 },
  lineContent: { flex: 1 },
  lineText: { fontWeight: '600', color: colors.foreground },
  lineMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  ctaBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
