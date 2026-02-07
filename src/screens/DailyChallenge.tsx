import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

type Phase = 'intro' | 'quiz' | 'results' | 'already-completed';

export default function DailyChallenge() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.dailyChallenge.getTodaysChallenge();
        if (res.data?.success) {
          const d = res.data.data;
          setChallenge(d);
          if (d.completed) setPhase('already-completed');
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowFeedback(true);

    setTimeout(async () => {
      if (currentQuestion < (challenge?.questions?.length || 1) - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        try {
          await apiService.dailyChallenge.submitChallenge({ answers: newAnswers, challengeId: challenge.id });
        } catch (_) {}
        setPhase('results');
      }
    }, 1500);
  };

  const score = challenge?.questions?.length
    ? Math.round((answers.filter((a, i) => a === challenge.questions[i]?.correct).length / challenge.questions.length) * 100)
    : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!challenge && !loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No challenge today.</Text>
        <Pressable style={styles.btn} onPress={() => navigate('Dashboard')}>
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'already-completed') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.doneCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.doneTitle}>Already completed!</Text>
            <Pressable style={styles.btn} onPress={() => navigate('Leaderboard')}>
              <Text style={styles.btnText}>View Leaderboard</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'results') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.resultsCard}>
            <Text style={styles.scoreTitle}>Your Score</Text>
            <Text style={styles.scoreValue}>{score}/100</Text>
            <Pressable style={styles.btn} onPress={() => navigate('Leaderboard')}>
              <Text style={styles.btnText}>Leaderboard</Text>
            </Pressable>
            <Pressable style={styles.outlineBtn} onPress={() => navigate('Dashboard')}>
              <Text style={styles.outlineBtnText}>Dashboard</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Daily Challenge</Text>
            <Text style={styles.introTopic}>{challenge?.topic}</Text>
            <Text style={styles.introMeta}>+{challenge?.xpReward || 150} XP • {challenge?.timeLimit || 10} min</Text>
            <Pressable style={styles.primaryBtn} onPress={() => setPhase('quiz')}>
              <Text style={styles.primaryBtnText}>Start Challenge</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  const q = challenge?.questions?.[currentQuestion];
  if (!q) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No questions.</Text>
        <Pressable style={styles.btn} onPress={() => setPhase('results')}>
          <Text style={styles.btnText}>See results</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.qLabel}>Question {currentQuestion + 1} of {challenge.questions.length}</Text>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>
        {q.options?.map((opt: string, index: number) => (
          <Pressable
            key={index}
            style={[
              styles.option,
              selectedAnswer === index && styles.optionSelected,
              showFeedback && index === q.correct && styles.optionCorrect,
              showFeedback && selectedAnswer === index && index !== q.correct && styles.optionIncorrect,
            ]}
            onPress={() => handleSelect(index)}
            disabled={showFeedback}
          >
            <View style={styles.optionLetterBox}><Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text></View>
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
        {selectedAnswer !== null && !showFeedback && (
          <Pressable style={styles.primaryBtn} onPress={handleSubmit}>
            <Text style={styles.primaryBtnText}>Submit</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  emptyText: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  doneCard: { alignItems: 'center', paddingVertical: 48 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: colors.foreground, marginTop: 16, marginBottom: 24 },
  resultsCard: { alignItems: 'center', paddingVertical: 48 },
  scoreTitle: { fontSize: 18, color: colors.mutedForeground },
  scoreValue: { fontSize: 48, fontWeight: '900', color: colors.primary, marginVertical: 16 },
  outlineBtn: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 24 },
  outlineBtnText: { color: colors.primary, fontWeight: '600' },
  introCard: { backgroundColor: colors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  introTitle: { fontSize: 22, fontWeight: '800', color: colors.foreground },
  introTopic: { fontSize: 18, color: colors.foreground, marginTop: 8 },
  introMeta: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  qLabel: { fontSize: 14, color: colors.mutedForeground, marginBottom: 12 },
  questionCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  questionText: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card },
  optionSelected: { borderColor: colors.primary },
  optionCorrect: { borderColor: colors.success, backgroundColor: 'rgba(34,197,94,0.1)' },
  optionIncorrect: { borderColor: colors.destructive, backgroundColor: 'rgba(239,68,68,0.1)' },
  optionLetterBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetter: { fontWeight: '700', color: colors.foreground },
  optionText: { flex: 1, fontWeight: '600', color: colors.foreground },
});
