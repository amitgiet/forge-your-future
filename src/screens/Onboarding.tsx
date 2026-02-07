import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [targetYear, setTargetYear] = useState('2026');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.auth.updateOnboarding({
        step: 3,
        completed: true,
        data: { targetYear, studyHoursPerDay: 4, boardPercentage: '', mockScore: '', weakSubjects: [], studyStyle: [] },
      });
      if (name) await apiService.auth.updateProfile({ name });
      navigate('Dashboard');
    } catch (_) {}
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your goals</Text>
      <Text style={styles.label}>Name (optional)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedForeground} />
      <Text style={styles.label}>Target year</Text>
      <TextInput style={styles.input} value={targetYear} onChangeText={setTargetYear} placeholder="2026" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" />
      <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Continue</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.foreground, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
