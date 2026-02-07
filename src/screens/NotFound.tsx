import { View, Text, Pressable, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.sub}>Page not found.</Text>
      <Pressable style={styles.btn} onPress={() => navigate('Dashboard')}>
        <Text style={styles.btnText}>Go to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 48, fontWeight: '900', color: colors.primary },
  sub: { fontSize: 18, color: colors.mutedForeground, marginTop: 8, marginBottom: 24 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
});
