import { useState } from 'react';
import { View, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function ThemeToggle() {
  const systemDark = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemDark);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <Pressable style={styles.btn} onPress={toggle} accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.secondary : colors.warning} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
