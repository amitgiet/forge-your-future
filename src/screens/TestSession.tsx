import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';
import QuizPlayer, { QuizQuestion } from '../components/QuizPlayer';
import { Ionicons } from '@expo/vector-icons';

function mapAttemptToQuiz(attemptData: any): { questions: QuizQuestion[]; initialAnswers: (number | number[] | null)[]; test: any } {
  const test = attemptData.testId || attemptData.test;
  const questionsRaw = test?.questions || [];
  const answerArray = new Array(questionsRaw.length).fill(null);
  (attemptData.answers || []).forEach((a: any) => {
    const qId = a.questionId?._id || a.questionId;
    const qIndex = questionsRaw.findIndex((q: any) => (q._id || q.id) === qId);
    if (qIndex !== -1 && a.selectedOption != null) {
      const opt = a.selectedOption;
      answerArray[qIndex] = typeof opt === 'number' ? opt : (opt.charCodeAt ? opt.charCodeAt(0) - 65 : 0);
    }
  });
  const questions: QuizQuestion[] = questionsRaw.map((q: any) => {
    const opts = q.options;
    const optionsArray = Array.isArray(opts)
      ? opts
      : opts && typeof opts === 'object'
        ? (['A', 'B', 'C', 'D'].map((letter) => (opts as Record<string, string>)[letter]).filter(Boolean) as string[])
        : [];
    const correctIdx = q.correctAnswer != null
      ? (typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correctAnswer as string).charCodeAt(0) - 65)
      : undefined;
    return {
      id: q._id || q.id,
      question: q.question || q.text,
      type: 'mcq',
      options: optionsArray.length ? optionsArray : ['A', 'B', 'C', 'D'],
      correctAnswer: correctIdx,
    };
  });
  return { questions, initialAnswers: answerArray, test };
}

export default function TestSession() {
  const route = useRoute<any>();
  const attemptId = route.params?.attemptId || '';
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [initialAnswers, setInitialAnswers] = useState<(number | number[] | null)[]>([]);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiService.tests.getAttempt(attemptId);
        const data = res.data?.data || res.data;
        const { questions: qs, initialAnswers: ans, test: t } = mapAttemptToQuiz(data);
        setQuestions(qs);
        setInitialAnswers(ans);
        setTest(t);
      } catch (_) {
        setError('Failed to load test');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const handleSubmit = async (_data: { answers: (number | number[] | null)[]; timeTaken: number }) => {
    try {
      await apiService.tests.submitTest(attemptId);
      navigate('TestReport', { attemptId });
    } catch (_) {
      Alert.alert('Error', 'Failed to submit test');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !questions.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errText}>{error || 'No questions for this test.'}</Text>
        <Pressable style={styles.btn} onPress={() => navigate('TestSeries')}>
          <Text style={styles.btnText}>Back to Test Series</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigate('TestSeries')}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>{test?.title || 'Test'}</Text>
      </View>
      <QuizPlayer
        questions={questions}
        title={test?.title || 'Test'}
        initialAnswers={initialAnswers}
        onSubmit={handleSubmit}
        showPalette={true}
        showTimer={!!test?.config?.duration}
        duration={test?.config?.duration ? test.config.duration * 60 : 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.foreground, flex: 1 },
  errText: { color: colors.mutedForeground, marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
});
