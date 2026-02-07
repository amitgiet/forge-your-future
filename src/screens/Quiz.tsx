import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import BottomNav from '../components/BottomNav';

const mockQuestions = [
  { id: 1, question: 'During which phase of the cell cycle does DNA replication occur?', options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'], correct: 1, explanation: 'DNA replication occurs during the S (Synthesis) phase.', chapter: 'Biology' },
  { id: 2, question: 'Which structure separates sister chromatids during anaphase?', options: ['Centrioles', 'Spindle fibers', 'Nuclear envelope', 'Cell membrane'], correct: 1, explanation: 'Spindle fibers pull sister chromatids apart.', chapter: 'Biology' },
  { id: 3, question: 'What is the ploidy of cells produced by meiosis I?', options: ['Diploid', 'Haploid', 'Triploid', 'Tetraploid'], correct: 1, explanation: 'Meiosis I is the reduction division.', chapter: 'Biology' },
];

export default function Quiz() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState(mockQuestions);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiService.questions.getQuestions({});
        if (response.data?.data?.length > 0) setQuestions(response.data.data);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No questions available.</Text>
        <Pressable style={styles.btn} onPress={() => navigate('Dashboard')}>
          <Text style={styles.btnText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const question = questions[currentQuestion] as typeof mockQuestions[0];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === question.correct) {
      setStreak((prev) => prev + 1);
      setShowStreakPopup(true);
      setTimeout(() => setShowStreakPopup(false), 1500);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.statsRow}>
            <View style={styles.streakBadge}><Ionicons name="flame" size={16} color={colors.warning} /><Text style={styles.streakText}>{streak}</Text></View>
            <View style={styles.xpBadge}><Ionicons name="sparkles" size={14} color={colors.primary} /><Text style={styles.xpText}>+{streak * 25} XP</Text></View>
          </View>
        </View>

        <Text style={styles.progressLabel}>Question {currentQuestion + 1} of {questions.length}</Text>
        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {question.options.map((option, index) => {
          let optionStyle = styles.option;
          if (selectedAnswer !== null) {
            if (index === question.correct) optionStyle = [styles.option, styles.optionCorrect] as any;
            else if (index === selectedAnswer) optionStyle = [styles.option, styles.optionIncorrect] as any;
          }
          return (
            <Pressable key={index} style={optionStyle} onPress={() => handleSelect(index)} disabled={selectedAnswer !== null}>
              <View style={[styles.optionLetter, selectedAnswer !== null && index === question.correct && styles.letterCorrect, selectedAnswer === index && index !== question.correct && styles.letterIncorrect]}>
                <Text style={styles.letterText}>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text style={styles.optionText}>{option}</Text>
              {selectedAnswer !== null && index === question.correct && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
              {selectedAnswer === index && index !== question.correct && <Ionicons name="close-circle" size={20} color={colors.destructive} />}
            </Pressable>
          );
        })}

        {showExplanation && (
          <View style={styles.explanationBox}>
            <Ionicons name="bulb-outline" size={20} color={colors.warning} />
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}

        {selectedAnswer !== null && (
          <View style={styles.actions}>
            <Pressable style={styles.outlineBtn} onPress={() => setShowExplanation(!showExplanation)}>
              <Ionicons name="bulb-outline" size={20} color={colors.foreground} />
              <Text style={styles.outlineBtnText}>{t('quiz.explain')}</Text>
            </Pressable>
            <Pressable style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>{currentQuestion < questions.length - 1 ? t('quiz.next') : 'Finish'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        )}

        {showStreakPopup && (
          <View style={styles.popup}>
            <Ionicons name="flame" size={28} color="#fff" />
            <Text style={styles.popupText}>{t('quiz.streakUp')} 🔥</Text>
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: colors.mutedForeground },
  emptyText: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.2)' },
  streakText: { fontWeight: '700', color: colors.warning },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.2)' },
  xpText: { fontWeight: '700', color: colors.primary, fontSize: 12 },
  progressLabel: { fontSize: 14, color: colors.mutedForeground, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 24 },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  questionCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  questionText: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card },
  optionCorrect: { borderColor: colors.success, backgroundColor: 'rgba(34,197,94,0.1)' },
  optionIncorrect: { borderColor: colors.destructive, backgroundColor: 'rgba(239,68,68,0.1)' },
  optionLetter: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  letterCorrect: { backgroundColor: 'rgba(34,197,94,0.2)' },
  letterIncorrect: { backgroundColor: 'rgba(239,68,68,0.2)' },
  letterText: { fontWeight: '700', color: colors.foreground },
  optionText: { flex: 1, fontWeight: '600', color: colors.foreground },
  explanationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.04)', marginBottom: 16 },
  explanationText: { flex: 1, fontSize: 14, color: colors.foreground },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  outlineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: colors.border },
  outlineBtnText: { fontWeight: '600', color: colors.foreground },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  popup: { position: 'absolute', alignSelf: 'center', top: '40%', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  popupText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
