import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function LearningPathFlow() {
  const route = useRoute<any>();
  const pathId = route.params?.pathId || '';
  const [path, setPath] = useState<any>(null);

  useEffect(() => {
    if (!pathId) return;
    (async () => {
      try {
        const res = await apiService.learningPaths.getPathById(pathId);
        setPath(res.data?.data);
      } catch (_) {}
    })();
  }, [pathId]);

  if (!pathId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Invalid path.</Text>
        <Pressable style={styles.btn} onPress={() => navigate('MyLearningPaths')}>
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backBtn} onPress={() => navigate('MyLearningPaths')}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{path?.title || 'Learning Path'}</Text>
        <Text style={styles.desc}>{path?.description || 'Continue your learning.'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  empty: { color: colors.mutedForeground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  backBtn: { marginBottom: 24 },
  backBtnText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  desc: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
});
