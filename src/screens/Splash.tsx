import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { storage } from '../lib/storage';
import { ensureTokenCache } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function Splash() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureTokenCache();
      await new Promise((r) => setTimeout(r, 2000));
      if (cancelled) return;
      const token = storage.getItemSync('token');
      if (token) navigate('Dashboard');
      else navigate('Login');
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.iconBox}>
          <Ionicons name="flash" size={56} color="#fff" />
        </View>
      </View>
      <Text style={styles.title}>NEETFORGE</Text>
      <View style={styles.subtitle}>
        <Ionicons name="star" size={16} color={colors.warning} />
        <Text style={styles.subtitleText}>Forge your future</Text>
        <Ionicons name="star" size={16} color={colors.warning} />
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotP, i === 1 && styles.dotS, i === 2 && styles.dotW]} />
        ))}
      </View>
    </View>
  );
}

const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  warning: '#f59e0b',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  iconBox: {
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 32,
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
  },
  subtitle: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  subtitleText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  dots: { flexDirection: 'row', gap: 12, marginTop: 48 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotP: { backgroundColor: colors.primary },
  dotS: { backgroundColor: colors.secondary },
  dotW: { backgroundColor: colors.warning },
});
