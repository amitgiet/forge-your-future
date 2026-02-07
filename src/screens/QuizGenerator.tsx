import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import QuizPlayer, { QuizQuestion } from '../components/QuizPlayer';

function mapQuizToQuestions(quiz: any): QuizQuestion[] {
  const raw = quiz?.questions || [];
  return raw.map((q: any) => ({
    id: q._id || q.id,
    question: q.question || q.text,
    type: 'mcq',
    options: Array.isArray(q.options) ? q.options : (q.options && typeof q.options === 'object' ? ['A', 'B', 'C', 'D'].map((l) => (q.options as Record<string, string>)[l]).filter(Boolean) as string[] : []),
    correctAnswer: q.correctAnswer != null ? (typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correctAnswer as string).charCodeAt(0) - 65) : undefined,
    explanation: q.explanation,
  }));
}

export default function QuizGenerator() {
  const [step, setStep] = useState<'form' | 'generating' | 'quiz' | 'results'>('form');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState(3);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  const generate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    if (count < 1 || count > 50) {
      setError('Number of questions must be between 1 and 50');
      return;
    }
    setError('');
    setStep('generating');
    try {
      const res = await apiService.quizGenerator.generateQuiz({
        topic: topic.trim(),
        level,
        numberOfQuestions: count,
      });
      const quizData = res.data?.data || res.data;
      if (quizData?.questions?.length) {
        setQuiz(quizData);
        setStep('quiz');
        return;
      }
      const quizId = quizData?.quizId || quizData?._id;
      if (quizId) {
        const getRes = await apiService.quizGenerator.getQuiz(quizId);
        const full = getRes.data?.data || getRes.data;
        if (full?.questions?.length) {
          setQuiz(full);
          setStep('quiz');
          return;
        }
      }
      setError('No questions received. Please try again.');
      setStep('form');
    } catch (_) {
      setError('Failed to generate quiz');
      setStep('form');
    }
  };

  const handleQuizSubmit = async (data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    const quizId = quiz?._id || quiz?.quizId;
    if (!quizId) {
      Alert.alert('Error', 'Quiz ID not found. Please try generating again.');
      return;
    }
    try {
      const res = await apiService.quizGenerator.submitQuizAttempt(quizId, data);
      const resultsData = res.data?.data || res.data;
      setResults(resultsData);
      setStep('results');
    } catch (_) {
      Alert.alert('Error', 'Failed to submit quiz');
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setTopic('');
    setLevel(3);
    setCount(10);
    setError('');
    setQuiz(null);
    setResults(null);
  };

  if (step === 'generating') {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.genTitle}>Generating your quiz...</Text>
        <Text style={styles.genSub}>AI is creating {count} custom questions on "{topic}"</Text>
      </View>
    );
  }

  if (step === 'quiz' && quiz?.questions?.length) {
    const questions = mapQuizToQuestions(quiz);
    if (questions.length === 0) {
      setStep('form');
      return null;
    }
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <Pressable style={styles.backBtn} onPress={handleBackToForm}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.quizTitle}>AI Quiz: {quiz.topic || topic}</Text>
        </View>
        <QuizPlayer
          questions={questions}
          title={`AI Quiz: ${quiz.topic || topic}`}
          onSubmit={handleQuizSubmit}
          showPalette={true}
        />
      </View>
    );
  }

  if (step === 'results' && results) {
    const percentage = results.percentage ?? (results.totalMarks ? Math.round((results.score / results.totalMarks) * 100) : 0);
    const isGood = percentage >= 70;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <View style={[styles.resultCircle, isGood ? styles.resultCircleGood : styles.resultCircleLow]}>
            <Text style={styles.resultPct}>{percentage}%</Text>
          </View>
          <Text style={styles.resultMessage}>{results.message || (isGood ? 'Well done!' : 'Keep practicing!')}</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultBox}>
              <Text style={styles.resultNum}>{results.score ?? 0}</Text>
              <Text style={styles.resultLabel}>Score</Text>
            </View>
            <View style={styles.resultBox}>
              <Text style={styles.resultNum}>{results.totalMarks ?? 0}</Text>
              <Text style={styles.resultLabel}>Total</Text>
            </View>
            <View style={styles.resultBox}>
              <Text style={styles.resultNum}>{Math.floor((results.timeTaken ?? 0) / 60)}m</Text>
              <Text style={styles.resultLabel}>Time</Text>
            </View>
          </View>
          {results.evaluatedAnswers?.length ? (
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Question Review</Text>
              {results.evaluatedAnswers.map((e: any, idx: number) => (
                <View
                  key={idx}
                  style={[styles.reviewItem, e.isCorrect ? styles.reviewCorrect : styles.reviewWrong]}
                >
                  <Text style={styles.reviewItemText}>
                    Q{e.questionNumber ?? idx + 1}: {e.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Pressable style={styles.primaryBtn} onPress={handleBackToForm}>
            <Text style={styles.primaryBtnText}>Generate New Quiz</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigate('Dashboard')}>
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </Pressable>
        </ScrollView>
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
          <Text style={styles.title}>AI Quiz Generator</Text>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g. Cell Division"
          placeholderTextColor={colors.mutedForeground}
        />
        <Text style={styles.label}>Difficulty (1-5)</Text>
        <View style={styles.levelRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              style={[styles.levelBtn, level === n && styles.levelBtnActive]}
              onPress={() => setLevel(n)}
            >
              <Text style={[styles.levelText, level === n && styles.levelTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Number of questions</Text>
        <TextInput
          style={styles.input}
          value={String(count)}
          onChangeText={(v) => setCount(parseInt(v, 10) || 10)}
          keyboardType="number-pad"
          placeholder="10"
          placeholderTextColor={colors.mutedForeground}
        />
        <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={generate} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? 'Generating...' : 'Generate Quiz'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  errorText: { color: colors.destructive, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, color: colors.foreground, marginBottom: 20 },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  levelBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  levelBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  levelText: { fontWeight: '700', color: colors.foreground },
  levelTextActive: { color: colors.primary },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.7 },
  genTitle: { fontSize: 20, fontWeight: '700', color: colors.foreground, marginTop: 16 },
  genSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
  quizHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  quizTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginLeft: 12 },
  resultsScroll: { padding: 16 },
  resultCircle: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultCircleGood: { backgroundColor: 'rgba(34,197,94,0.2)' },
  resultCircleLow: { backgroundColor: 'rgba(234,179,8,0.2)' },
  resultPct: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  resultMessage: { fontSize: 20, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 24 },
  resultRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  resultBox: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  resultNum: { fontSize: 22, fontWeight: '800', color: colors.primary },
  resultLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  reviewSection: { marginBottom: 24 },
  reviewTitle: { fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  reviewItem: { padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4 },
  reviewCorrect: { borderLeftColor: colors.success, backgroundColor: 'rgba(34,197,94,0.1)' },
  reviewWrong: { borderLeftColor: colors.destructive, backgroundColor: 'rgba(239,68,68,0.1)' },
  reviewItemText: { fontWeight: '600', color: colors.foreground },
  secondaryBtn: { marginTop: 12, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: colors.border },
  secondaryBtnText: { fontWeight: '700', color: colors.foreground },
});
