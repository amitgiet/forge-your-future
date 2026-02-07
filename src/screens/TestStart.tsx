import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function TestStart() {
  const route = useRoute<any>();
  const testId = route.params?.testId || '';
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState(false);

  useEffect(() => {
    if (!testId) {
      navigate('TestSeries');
      return;
    }
    (async () => {
      try {
        const res = await apiService.tests.getTestById(testId);
        setTest(res.data?.data || res.data);
      } catch (_) {
        Alert.alert('Error', 'Could not load test details.');
        navigate('TestSeries');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  const handleBeginTest = async () => {
    if (!testId) return;
    setStartingTest(true);
    try {
      const res = await apiService.tests.startTest(testId);
      const attemptId = res.data?.data?.attemptId || res.data?.attemptId;
      if (attemptId) navigate('TestSession', { attemptId });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to start the test session.');
    } finally {
      setStartingTest(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!test) return null;

  const config = test.config || {};
  const duration = config.duration ?? 60;
  const totalQuestions = config.totalQuestions ?? test.questions?.length ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('TestSeries')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Test Instructions</Text>
            <Text style={styles.headerSub}>{test.title || test.name || 'Test'}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={28} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duration} mins</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={28} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Questions</Text>
              <Text style={styles.detailValue}>{totalQuestions}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.instructionsTitle}>Please read the following instructions carefully:</Text>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.instructionText}>The timer will start when you tap "Begin Test".</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.instructionText}>+4 marks for each correct answer.</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.instructionText}>-1 mark for each incorrect answer.</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.instructionText}>No negative marking for unattempted questions.</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={styles.instructionText}>Do not close the app during the test.</Text>
        </View>

        <Pressable
          style={[styles.beginBtn, startingTest && styles.beginBtnDisabled]}
          onPress={handleBeginTest}
          disabled={startingTest}
        >
          <Text style={styles.beginBtnText}>{startingTest ? 'Starting...' : 'Begin Test'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  headerSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
  detailsCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-around' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { fontSize: 12, color: colors.mutedForeground },
  detailValue: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  instructionsTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  instructionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  instructionText: { flex: 1, fontSize: 14, color: colors.mutedForeground },
  beginBtn: { marginTop: 24, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  beginBtnDisabled: { opacity: 0.7 },
  beginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
