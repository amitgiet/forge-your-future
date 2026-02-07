import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];
const CHAPTERS: Record<string, string[]> = {
  Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Physiology'],
};

export default function CustomTestCreate() {
  const [formData, setFormData] = useState({
    title: '',
    subjects: [] as string[],
    chapters: [] as string[],
    questionCount: 30,
    duration: 45,
    difficulty: 'mixed',
    ncertOnly: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter((s) => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects, chapters: [] });
  };

  const handleChapterToggle = (chapter: string) => {
    const newChapters = formData.chapters.includes(chapter)
      ? formData.chapters.filter((c) => c !== chapter)
      : [...formData.chapters, chapter];
    setFormData({ ...formData, chapters: newChapters });
  };

  const availableChapters = formData.subjects.flatMap(
    (subject) => CHAPTERS[subject]?.map((ch) => ({ subject, chapter: ch })) || []
  );

  const handleSubmit = async () => {
    if (formData.subjects.length === 0) {
      Alert.alert('Required', 'Please select at least one subject');
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.tests.createCustomTest(formData);
      const testId = res.data?.data?._id || res.data?._id;
      if (!testId) throw new Error('No test ID returned');
      const startRes = await apiService.tests.startTest(testId);
      const attemptId = startRes.data?.data?.attemptId || startRes.data?.attemptId;
      if (attemptId) navigate('TestSession', { attemptId });
      else navigate('TestSeries');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create custom test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backBtn} onPress={() => navigate('TestSeries')}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Custom Test</Text>
        <Text style={styles.subtitle}>Configure your personalized test</Text>

        <Text style={styles.label}>Test Title (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(t) => setFormData({ ...formData, title: t })}
          placeholder="My Custom Test"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={styles.label}>Select Subjects *</Text>
        <View style={styles.subjectRow}>
          {SUBJECTS.map((subject) => (
            <Pressable
              key={subject}
              style={[styles.subjectBtn, formData.subjects.includes(subject) && styles.subjectBtnActive]}
              onPress={() => handleSubjectToggle(subject)}
            >
              <Text style={[styles.subjectText, formData.subjects.includes(subject) && styles.subjectTextActive]}>{subject}</Text>
            </Pressable>
          ))}
        </View>

        {availableChapters.length > 0 && (
          <>
            <Text style={styles.label}>Select Chapters (Optional)</Text>
            <View style={styles.chapterRow}>
              {availableChapters.map(({ subject, chapter }) => (
                <Pressable
                  key={`${subject}-${chapter}`}
                  style={[styles.chapterChip, formData.chapters.includes(chapter) && styles.chapterChipActive]}
                  onPress={() => handleChapterToggle(chapter)}
                >
                  <Text style={[styles.chapterChipText, formData.chapters.includes(chapter) && styles.chapterChipTextActive]}>{chapter}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Test Configuration</Text>
        <View style={styles.configRow}>
          <View style={styles.configField}>
            <Text style={styles.configLabel}>Questions</Text>
            <TextInput
              style={styles.configInput}
              value={String(formData.questionCount)}
              onChangeText={(v) => setFormData({ ...formData, questionCount: parseInt(v, 10) || 30 })}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.configField}>
            <Text style={styles.configLabel}>Duration (min)</Text>
            <TextInput
              style={styles.configInput}
              value={String(formData.duration)}
              onChangeText={(v) => setFormData({ ...formData, duration: parseInt(v, 10) || 45 })}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.configLabel}>Difficulty</Text>
        <View style={styles.difficultyRow}>
          {['mixed', 'easy', 'medium', 'hard'].map((d) => (
            <Pressable
              key={d}
              style={[styles.diffBtn, formData.difficulty === d && styles.diffBtnActive]}
              onPress={() => setFormData({ ...formData, difficulty: d })}
            >
              <Text style={[styles.diffText, formData.difficulty === d && styles.diffTextActive]}>{d}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.checkRow, formData.ncertOnly && styles.checkRowActive]}
          onPress={() => setFormData({ ...formData, ncertOnly: !formData.ncertOnly })}
        >
          <View style={[styles.checkbox, formData.ncertOnly && styles.checkboxChecked]} />
          <Text style={styles.checkLabel}>NCERT Questions Only</Text>
        </Pressable>

        <Pressable
          style={[styles.submitBtn, (loading || formData.subjects.length === 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || formData.subjects.length === 0}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create & Start Test</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtnText: { fontSize: 16, color: colors.primary, fontWeight: '600', marginLeft: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, color: colors.foreground, marginBottom: 20 },
  subjectRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  subjectBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  subjectBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  subjectText: { fontWeight: '700', color: colors.foreground },
  subjectTextActive: { color: colors.primary },
  chapterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chapterChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chapterChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  chapterChipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  chapterChipTextActive: { color: colors.primary },
  configRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  configField: { flex: 1 },
  configLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  configInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: colors.foreground },
  difficultyRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  diffBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  diffBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  diffText: { fontWeight: '600', color: colors.foreground },
  diffTextActive: { color: colors.primary },
  checkRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  checkRowActive: { borderColor: colors.primary },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, marginRight: 12 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontWeight: '600', color: colors.foreground },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
