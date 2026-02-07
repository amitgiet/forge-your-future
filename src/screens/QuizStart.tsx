import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function QuizStart() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { topic = 'Biology', subject = 'Biology', weakness } = route.params || {};
  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [questionCount, setQuestionCount] = useState(25);

  const handleStart = () => {
    navigation.navigate('QuizSession', { mode, questionCount, topic, subject, weakness });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <View>
            <Text style={styles.title}>Start Quiz</Text>
            <Text style={styles.subtitle}>{subject} • {topic}</Text>
          </View>
        </View>

        {weakness != null && (
          <View style={styles.weaknessBox}>
            <Ionicons name="flag" size={20} color={colors.destructive} />
            <View>
              <Text style={styles.weaknessTitle}>Weakness Detected</Text>
              <Text style={styles.weaknessSub}>Accuracy: {weakness}%</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Mode</Text>
          <View style={styles.modeRow}>
            <Pressable style={[styles.modeBtn, mode === 'practice' && styles.modeBtnActive]} onPress={() => setMode('practice')}>
              <Ionicons name="book-outline" size={28} color={mode === 'practice' ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeLabel, mode === 'practice' && styles.modeLabelActive]}>Practice</Text>
              <Text style={styles.modeHint}>Instant feedback</Text>
            </Pressable>
            <Pressable style={[styles.modeBtn, mode === 'test' && styles.modeBtnActiveTest]} onPress={() => setMode('test')}>
              <Ionicons name="trophy-outline" size={28} color={mode === 'test' ? colors.secondary : colors.mutedForeground} />
              <Text style={[styles.modeLabel, mode === 'test' && { color: colors.secondary }]}>Test</Text>
              <Text style={styles.modeHint}>Exam simulation</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Number of questions</Text>
          <View style={styles.countRow}>
            {[10, 25, 50].map((n) => (
              <Pressable key={n} style={[styles.countBtn, questionCount === n && styles.countBtnActive]} onPress={() => setQuestionCount(n)}>
                <Text style={[styles.countText, questionCount === n && styles.countTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.foreground },
  subtitle: { fontSize: 12, color: colors.mutedForeground },
  weaknessBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginBottom: 24 },
  weaknessTitle: { fontWeight: '600', color: colors.destructive },
  weaknessSub: { fontSize: 12, color: colors.mutedForeground },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 12 },
  modeBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  modeBtnActive: { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: colors.primary },
  modeBtnActiveTest: { backgroundColor: 'rgba(139,92,246,0.1)', borderColor: colors.secondary },
  modeLabel: { fontWeight: '700', color: colors.foreground, marginTop: 8 },
  modeLabelActive: { color: colors.primary },
  modeHint: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  countRow: { flexDirection: 'row', gap: 8 },
  countBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  countBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  countText: { fontWeight: '700', color: colors.foreground },
  countTextActive: { color: colors.primary },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
