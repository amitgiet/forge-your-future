import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>NEETFORGE</Text>
        <Text style={styles.welcome}>Welcome back! Let's continue learning</Text>

        <Text style={styles.heading}>Login</Text>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { paddingRight: 48 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPassword}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.btnPrimaryText}>Login</Text>
            </>
          )}
        </Pressable>

        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Try demo with sample data</Text>
          <Pressable style={styles.demoBtn} onPress={demoLogin}>
            <Ionicons name="flash-outline" size={20} color={colors.secondary} />
            <Text style={styles.demoBtnText}>Enter Demo Mode</Text>
          </Pressable>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => navigate('Signup')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  logo: { fontSize: 32, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 8 },
  welcome: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 24 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
  errorBox: { marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { fontSize: 14, color: colors.destructive },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: { flex: 1, paddingVertical: 12, paddingLeft: 40, paddingRight: 12, fontSize: 16, color: colors.foreground },
  eyeBtn: { position: 'absolute', right: 12 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  demoSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  demoLabel: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', marginBottom: 12 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: 'rgba(139,92,246,0.5)' },
  demoBtnText: { color: colors.secondary, fontWeight: '600' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  signupText: { fontSize: 14, color: colors.mutedForeground },
  signupLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
