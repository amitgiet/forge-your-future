import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>NEETFORGE</Text>
        <Text style={styles.heading}>Sign up</Text>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.mutedForeground} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.mutedForeground} secureTextEntry />

        <Pressable style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Sign up</Text>}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  logo: { fontSize: 32, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 24 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
  errorBox: { marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.2)' },
  errorText: { fontSize: 14, color: colors.destructive },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: colors.foreground, marginBottom: 16 },
  btnPrimary: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: colors.mutedForeground },
  loginLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
