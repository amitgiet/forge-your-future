import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function MyChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.challenges.getUserChallenges();
        setChallenges(res.data?.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>My Challenges</Text>
          <Pressable style={styles.addBtn} onPress={() => navigate('StartPractice')}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
        ) : challenges.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No challenges yet.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigate('StartPractice')}>
              <Text style={styles.primaryBtnText}>Start a challenge</Text>
            </Pressable>
          </View>
        ) : (
          challenges.map((c) => (
            <Pressable key={c._id} style={styles.card} onPress={() => navigate('PracticeSession', { challengeId: c._id })}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSub}>{c.subject} • Day {c.progress?.currentDay || 0}/{c.duration}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} style={{ alignSelf: 'flex-end' }} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.foreground },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: colors.mutedForeground, marginBottom: 16 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  cardSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
});
