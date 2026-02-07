import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { trackChapter, loadDueLines, getMasteryProgress } from '../store/slices/neuronzSlice';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];

export default function TrackTopic() {
  const dispatch = useAppDispatch();
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.chapters.getChapters();
        setChapters(res.data?.data || res.data || []);
      } catch (_) {
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    })();
  }, []);

  const filteredChapters = selectedSubject
    ? chapters.filter((ch) => (ch.subject || '').toLowerCase() === selectedSubject.toLowerCase())
    : [];

  const handleTrackChapter = async () => {
    if (!selectedChapter?._id) return;
    setLoading(true);
    try {
      await dispatch(trackChapter(selectedChapter._id)).unwrap();
      dispatch(loadDueLines());
      dispatch(getMasteryProgress());
      setSuccess(true);
      setTimeout(() => navigate('Revision'), 2000);
    } catch (_) {
      Alert.alert('Error', 'Failed to track chapter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.centered}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Chapter Tracked!</Text>
        <Text style={styles.successSub}>Starting your 7-level revision journey...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backBtn} onPress={() => navigate('Revision')}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Track New Chapter</Text>
        <Text style={styles.subtitle}>Start your 7-level revision journey for a new chapter</Text>

        {loadingChapters ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.subjectRow}>
              {SUBJECTS.map((sub) => (
                <Pressable
                  key={sub}
                  style={[styles.subjectBtn, selectedSubject === sub && styles.subjectBtnActive]}
                  onPress={() => {
                    setSelectedSubject(sub);
                    setSelectedChapter(null);
                  }}
                >
                  <Text style={[styles.subjectText, selectedSubject === sub && styles.subjectTextActive]}>{sub}</Text>
                </Pressable>
              ))}
            </View>

            {selectedSubject ? (
              <>
                <Text style={styles.label}>Chapter</Text>
                <ScrollView style={styles.chapterList} nestedScrollEnabled>
                  {filteredChapters.length === 0 ? (
                    <Text style={styles.emptyCh}>No chapters found for this subject</Text>
                  ) : (
                    filteredChapters.map((ch) => (
                      <Pressable
                        key={ch._id}
                        style={[styles.chapterCard, selectedChapter?._id === ch._id && styles.chapterCardActive]}
                        onPress={() => setSelectedChapter(ch)}
                      >
                        <Text style={styles.chapterName}>{ch.name?.en || ch.name || ch.title || 'Chapter'}</Text>
                        <Text style={styles.chapterMeta}>
                          {ch.stats?.totalLines ?? 0} lines • {ch.subject}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </>
            )}

            {selectedChapter ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>What happens next?</Text>
                <Text style={styles.infoText}>
                  We'll track all {selectedChapter.stats?.totalLines ?? 0} NCERT lines from this chapter and create a 7-level spaced repetition schedule.
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.trackBtn, (loading || !selectedChapter) && styles.trackBtnDisabled]}
              onPress={handleTrackChapter}
              disabled={loading || !selectedChapter}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.trackBtnText}>Track Chapter</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 8 },
  successSub: { fontSize: 14, color: colors.mutedForeground },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtnText: { fontSize: 16, color: colors.primary, fontWeight: '600', marginLeft: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  loader: { paddingVertical: 48, alignItems: 'center' },
  subjectRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  subjectBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  subjectBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  subjectText: { fontWeight: '600', color: colors.foreground },
  subjectTextActive: { color: colors.primary },
  chapterList: { maxHeight: 260, marginBottom: 16 },
  chapterCard: { padding: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, marginBottom: 8, backgroundColor: colors.card },
  chapterCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  chapterName: { fontWeight: '700', color: colors.foreground },
  chapterMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  emptyCh: { color: colors.mutedForeground, textAlign: 'center', paddingVertical: 24 },
  infoBox: { backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 },
  infoTitle: { fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  infoText: { fontSize: 14, color: colors.mutedForeground },
  trackBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  trackBtnDisabled: { opacity: 0.6 },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
