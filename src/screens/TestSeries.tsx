import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import BottomNav from '../components/BottomNav';

export default function TestSeries() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.tests.getTests({});
        setTests(res.data?.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Series</Text>
          <Pressable style={styles.addBtn} onPress={() => navigate('CustomTestCreate')}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
        ) : tests.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tests yet.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigate('CustomTestCreate')}>
              <Text style={styles.primaryBtnText}>Create Custom Test</Text>
            </Pressable>
          </View>
        ) : (
          tests.map((test) => (
            <Pressable key={test._id} style={styles.card} onPress={() => navigate('TestStart', { testId: test._id })}>
              <Text style={styles.cardTitle}>{test.title || test.name || 'Test'}</Text>
              <Text style={styles.cardSub}>{test.questions?.length || 0} questions</Text>
              <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                <Text style={styles.cardMeta}>{test.duration || 60} min</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: colors.mutedForeground, marginBottom: 16 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  cardSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  cardMeta: { fontSize: 12, color: colors.mutedForeground },
});
