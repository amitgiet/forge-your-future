import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNav from '../components/BottomNav';
import { colors } from '../constants/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
  email: { fontSize: 14, color: colors.mutedForeground, marginBottom: 4 },
  name: { fontSize: 18, color: colors.foreground, marginBottom: 24 },
  logoutBtn: { backgroundColor: colors.destructive, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600' },
});
