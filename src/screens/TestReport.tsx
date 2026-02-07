import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function TestReport() {
  const route = useRoute<any>();
  const attemptId = route.params?.attemptId || '';
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiService.tests.getAttempt(attemptId);
        setAttempt(res.data?.data || res.data);
      } catch (_) {}
      setLoading(false);
    })();
  }, [attemptId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!attempt?.results) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errText}>Could not load report.</Text>
        <Pressable style={styles.btn} onPress={() => navigate('TestSeries')}>
          <Text style={styles.btnText}>Back to Tests</Text>
        </Pressable>
      </View>
    );
  }

  const { results, weakAreas = [], testId } = attempt;
  const test = testId && typeof testId === 'object' ? testId : { title: 'Test', _id: '' };
  const testTitle = test?.title || test?.name || 'Test';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Test Report</Text>
        <Text style={styles.subtitle}>{testTitle}</Text>

        <View style={styles.scoreCard}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreBig}>{results.percentage?.toFixed(1) ?? 0}%</Text>
            <Text style={styles.scoreLabel}>Your Score</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreBig}>{results.marksObtained ?? 0}</Text>
            <Text style={styles.scoreLabel}>Marks</Text>
            <Text style={styles.scoreSub}>of {results.totalMarks ?? 0}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreBig}>#{results.rank ?? '—'}</Text>
            <Text style={styles.scoreLabel}>Rank</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreBig}>{results.percentile?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.scoreLabel}>Percentile</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            <Text style={styles.statNum}>{results.correct ?? 0}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="close-circle" size={28} color={colors.destructive} />
            <Text style={styles.statNum}>{results.incorrect ?? 0}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="help-circle" size={28} color={colors.warning} />
            <Text style={styles.statNum}>{results.skipped ?? 0}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time" size={28} color={colors.primary} />
            <Text style={styles.statNum}>{Math.floor(results.timeAnalysis?.avgTimePerQuestion ?? 0)}s</Text>
            <Text style={styles.statLabel}>Avg/Q</Text>
          </View>
        </View>

        {results.subjectWise?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
            {results.subjectWise.map((subject: any) => (
              <View key={subject.subject} style={styles.subjectRow}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <Text style={styles.subjectMeta}>{subject.correct}/{subject.total} • {subject.accuracy?.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, subject.accuracy ?? 0)}%` }, (subject.accuracy ?? 0) >= 80 ? styles.progressGood : (subject.accuracy ?? 0) >= 60 ? styles.progressMid : styles.progressLow]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {results.chapterWise?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chapter-wise Analysis</Text>
            <View style={styles.chapterGrid}>
              {results.chapterWise.map((chapter: any, idx: number) => (
                <View key={idx} style={styles.chapterCard}>
                  <Text style={styles.chapterName}>{chapter.chapter}</Text>
                  <Text style={styles.chapterMeta}>{chapter.subject}</Text>
                  <Text style={[styles.chapterPct, (chapter.accuracy ?? 0) >= 80 ? styles.pctGood : (chapter.accuracy ?? 0) >= 60 ? styles.pctMid : styles.pctLow]}>
                    {chapter.accuracy?.toFixed(1)}% ({chapter.correct}/{chapter.total})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {weakAreas.length > 0 && (
          <View style={[styles.section, styles.weakSection]}>
            <View style={styles.weakHeader}>
              <Ionicons name="warning" size={24} color={colors.destructive} />
              <Text style={styles.sectionTitle}>Weak Areas</Text>
            </View>
            {weakAreas.map((area: any, idx: number) => (
              <View key={idx} style={styles.weakCard}>
                <Text style={styles.weakChapter}>{area.chapter}</Text>
                <Text style={styles.weakMeta}>{area.subject} • {area.questionsWrong} wrong • {area.accuracy?.toFixed(1)}%</Text>
                <Pressable style={styles.fixBtn} onPress={() => navigate('TrackTopic')}>
                  <Text style={styles.fixBtnText}>Fix This</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.secondaryBtn} onPress={() => navigate('TestSeries')}>
            <Text style={styles.secondaryBtnText}>Back to Tests</Text>
          </Pressable>
          {test?._id && (
            <Pressable style={styles.primaryBtn} onPress={() => navigate('TestSeries')}>
              <Text style={styles.primaryBtnText}>View Solutions</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4, marginBottom: 24 },
  errText: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  scoreCard: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
  scoreItem: { flex: 1, minWidth: '45%', alignItems: 'center', marginBottom: 12 },
  scoreBig: { fontSize: 22, fontWeight: '800', color: colors.foreground },
  scoreLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  scoreSub: { fontSize: 11, color: colors.mutedForeground },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.foreground, marginTop: 8 },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  subjectRow: { marginBottom: 12 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  subjectName: { fontWeight: '600', color: colors.foreground },
  subjectMeta: { fontSize: 12, color: colors.mutedForeground },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressGood: { backgroundColor: colors.success },
  progressMid: { backgroundColor: colors.warning },
  progressLow: { backgroundColor: colors.destructive },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chapterCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  chapterName: { fontWeight: '600', color: colors.foreground },
  chapterMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  chapterPct: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  pctGood: { color: colors.success },
  pctMid: { color: colors.warning },
  pctLow: { color: colors.destructive },
  weakSection: { backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 16 },
  weakHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  weakCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  weakChapter: { fontWeight: '700', color: colors.foreground },
  weakMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  fixBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  fixBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: colors.border },
  secondaryBtnText: { fontWeight: '600', color: colors.foreground },
});
