import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function Leaderboard() {
  const [list, setList] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [res, rankRes] = await Promise.all([
          apiService.leaderboard.getLeaderboard(20),
          apiService.leaderboard.getUserRank(),
        ]);
        setList(res.data?.data || []);
        if (rankRes.data?.success) setUserRank(rankRes.data.data);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => navigate('Dashboard')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>Leaderboard</Text>
        </View>

        {userRank && (
          <View style={styles.myRank}>
            <Text style={styles.myRankLabel}>Your rank</Text>
            <View style={styles.myRankRow}>
              <Text style={styles.myRankValue}>#{userRank.rank ?? '—'}</Text>
              <Text style={styles.myRankXP}>{userRank.totalXP ?? 0} XP</Text>
              <Text style={styles.myRankStreak}>🔥 {userRank.streak ?? 0}</Text>
            </View>
          </View>
        )}

        {list.map((item, index) => (
          <View key={item.userId || index} style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.name || item.userName || 'User'}</Text>
            <Text style={styles.xp}>{item.totalXP ?? item.score ?? 0} XP</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  myRank: { backgroundColor: colors.primary, borderRadius: 16, padding: 20, marginBottom: 24 },
  myRankLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  myRankRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  myRankValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
  myRankXP: { fontSize: 16, color: '#fff', fontWeight: '600' },
  myRankStreak: { fontSize: 16, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  rank: { width: 40, fontWeight: '800', color: colors.mutedForeground },
  name: { flex: 1, fontWeight: '600', color: colors.foreground },
  xp: { fontWeight: '700', color: colors.primary },
});
