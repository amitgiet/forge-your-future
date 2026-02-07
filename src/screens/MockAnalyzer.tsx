import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function MockAnalyzer() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>Mock Analyzer</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.cardTitle}>Upload your mock test PDF</Text>
          <Text style={styles.cardSub}>We'll analyze weak areas and suggest a fix plan.</Text>
          <Pressable style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>Select PDF</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
  cardSub: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  uploadBtn: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, backgroundColor: colors.primary },
  uploadBtnText: { color: '#fff', fontWeight: '600' },
});
