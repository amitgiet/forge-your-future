import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function CreateLearningPath() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.learningPaths.createPath({ title: title.trim(), description: description.trim() || undefined, goals: [] });
      const id = res.data?.data?._id;
      if (id) navigate('LearningPath', { pathId: id });
      else navigate('MyLearningPaths');
    } catch (_) {}
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="My path" placeholderTextColor={colors.mutedForeground} />
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput style={[styles.input, { minHeight: 80 }]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={colors.mutedForeground} multiline />
        <Pressable style={[styles.btn, loading && styles.disabled]} onPress={create} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create'}</Text>
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
