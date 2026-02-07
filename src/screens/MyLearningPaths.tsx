import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import BottomNav from '../components/BottomNav';

export default function MyLearningPaths() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.learningPaths.getUserPaths();
        setPaths(res.data?.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>My Learning Paths</Text>
          <Pressable style={styles.addBtn} onPress={() => navigate('CreateLearningPath')}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 48 }} />
        ) : paths.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No learning paths yet.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigate('CreateLearningPath')}>
              <Text style={styles.primaryBtnText}>Create one</Text>
            </Pressable>
          </View>
        ) : (
          paths.map((path) => (
            <Pressable key={path._id} style={styles.card} onPress={() => navigate('LearningPath', { pathId: path._id })}>
              <Text style={styles.cardTitle}>{path.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{path.description}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} style={{ alignSelf: 'flex-end' }} />
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
});
