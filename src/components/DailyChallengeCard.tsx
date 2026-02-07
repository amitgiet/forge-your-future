import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<any>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaysChallenge();
  }, []);

  const fetchTodaysChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.dailyChallenge.getTodaysChallenge();
      if (response.data?.success) {
        const d = response.data.data;
        setChallenge(d);
        if (d.completed) {
          setHasCompleted(true);
          setUserScore(d.userScore);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load');
      setChallenge({
        id: 'fallback',
        topic: 'Cell Division - Mitosis',
        subject: 'Biology',
        difficulty: 'Medium',
        xpReward: 150,
        timeLimit: 10,
        icon: '🧬',
        completed: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    if (difficulty === 'Easy') return { backgroundColor: 'rgba(34,197,94,0.2)', color: colors.success };
    if (difficulty === 'Hard') return { backgroundColor: 'rgba(239,68,68,0.2)', color: colors.destructive };
    return { backgroundColor: 'rgba(245,158,11,0.2)', color: colors.warning };
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!challenge) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="flag" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Daily Challenge</Text>
            <Text style={styles.cardSub}>Same for everyone!</Text>
          </View>
        </View>
        <Pressable onPress={() => navigate('Leaderboard')} style={styles.leaderboardBtn}>
          <Ionicons name="trophy" size={14} color={colors.secondary} />
          <Text style={styles.leaderboardText}>Leaderboard</Text>
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.emoji}>{challenge.icon || '📚'}</Text>
        <View style={styles.infoText}>
          <View style={styles.badgeRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyStyle(challenge.difficulty).backgroundColor }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyStyle(challenge.difficulty).color }]}>{challenge.difficulty}</Text>
            </View>
            <Text style={styles.subjectText}>{challenge.subject}</Text>
          </View>
          <Text style={styles.topicText}>{challenge.topic}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
          <Text style={styles.statText}>{challenge.timeLimit} min</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flash-outline" size={14} color={colors.warning} />
          <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>

      <Pressable style={styles.primaryBtn} onPress={() => navigate('DailyChallenge')}>
        <Ionicons name="flag" size={20} color="#fff" />
        <Text style={styles.primaryBtnText}>{hasCompleted ? 'View Details' : 'Start Challenge'}</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </Pressable>

      {hasCompleted && userScore != null && (
        <View style={styles.completedBox}>
          <View style={styles.completedLeft}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.completedLabel}>Completed!</Text>
          </View>
          <Text style={styles.scoreText}>{userScore}/100</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.2)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '700', color: colors.foreground, fontSize: 14 },
  cardSub: { fontSize: 12, color: colors.mutedForeground },
  leaderboardBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderboardText: { fontSize: 12, color: colors.secondary, fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  emoji: { fontSize: 28, marginRight: 12 },
  infoText: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  difficultyText: { fontSize: 12, fontWeight: '700' },
  subjectText: { fontSize: 12, color: colors.mutedForeground },
  topicText: { fontWeight: '700', color: colors.foreground, fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.mutedForeground },
  xpText: { fontSize: 12, fontWeight: '700', color: colors.warning },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  completedBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 2, borderColor: 'rgba(34,197,94,0.3)' },
  completedLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  completedLabel: { fontSize: 14, fontWeight: '700', color: colors.success },
  scoreText: { fontSize: 14, fontWeight: '900', color: colors.success },
});
