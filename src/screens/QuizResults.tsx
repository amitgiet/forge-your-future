import { View, Text, Pressable, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function QuizResults() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Results</Text>
      <Pressable style={styles.btn} onPress={() => navigate('QuizStart')}>
        <Text style={styles.btnText}>Try again</Text>
      </Pressable>
      <Pressable style={styles.outlineBtn} onPress={() => navigate('Dashboard')}>
        <Text style={styles.outlineBtnText}>Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 24 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  outlineBtn: { paddingVertical: 14, alignItems: 'center' },
  outlineBtnText: { color: colors.primary, fontWeight: '600' },
});
