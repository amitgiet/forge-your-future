import { View, Text, Pressable, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';

export default function RevisionDashboard() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => navigate('Revision')}>
        <Text style={styles.backBtnText}>← Revision</Text>
      </Pressable>
      <Text style={styles.title}>Revision Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  backBtn: { marginBottom: 24 },
  backBtnText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
});
