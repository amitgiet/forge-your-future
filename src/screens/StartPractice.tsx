import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function StartPractice() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title.trim() || !topic.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.challenges.createChallenge({ title: title.trim(), topic: topic.trim(), subject });
      const id = res.data?.data?._id;
      if (id) navigate('PracticeSession', { challengeId: id });
      else navigate('MyChallenges');
    } catch (_) {}
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Challenge title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. 7-day Cell Biology" placeholderTextColor={colors.mutedForeground} />
        <Text style={styles.label}>Topic</Text>
        <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="e.g. Mitosis" placeholderTextColor={colors.mutedForeground} />
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Biology" placeholderTextColor={colors.mutedForeground} />
        <Pressable style={[styles.btn, loading && styles.disabled]} onPress={create} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Start Challenge'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.foreground, marginBottom: 20 },
  btn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.7 },
});
