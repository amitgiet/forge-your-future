import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function ActiveChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await apiService.challenges.getUserChallenges();
      const data = response.data.data || [];
      setChallenges(data.filter((c: any) => c.status === 'active'));
    } catch (_) {}
    setLoading(false);
  };

  if (loading || challenges.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active Challenges</Text>
      {challenges.map((challenge) => {
        const todaySchedule = challenge.dailySchedule?.find((s: any) => s.isUnlocked && !s.isCompleted);
        const progressPct = challenge.duration ? (challenge.progress?.completedDays / challenge.duration) * 100 : 0;
        return (
          <Pressable
            key={challenge._id}
            style={styles.challengeCard}
            onPress={() => navigate('PracticeSession', { challengeId: challenge._id })}
          >
            <View style={styles.challengeContent}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{challenge.subject}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
                  <Text style={styles.metaText}>Day {challenge.progress?.currentDay || 0}/{challenge.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flame" size={16} color={colors.secondary} />
                  <Text style={styles.streakText}>{challenge.progress?.streak || 0}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              {todaySchedule ? (
                <View style={styles.todayRow}>
                  <Ionicons name="flag" size={16} color={colors.success} />
                  <Text style={styles.todayText}>Today: {todaySchedule.completedQuizzes}/{todaySchedule.targetQuizzes} completed</Text>
                </View>
              ) : (
                <View style={styles.todayRow}>
                  <Ionicons name="lock-closed" size={16} color={colors.mutedForeground} />
                  <Text style={styles.lockedText}>Complete previous day to unlock</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeContent: { flex: 1 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  challengeTitle: { fontWeight: '600', color: colors.foreground, fontSize: 16 },
  subjectBadge: { backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subjectText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14, color: colors.mutedForeground },
  streakText: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayText: { fontSize: 14, color: colors.success, fontWeight: '500' },
  lockedText: { fontSize: 14, color: colors.mutedForeground },
});
