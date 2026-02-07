import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

interface ShieldCardProps {
  initialMinutes?: number;
}

export default function ShieldCard({ initialMinutes = 25 }: ShieldCardProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);

  const totalSeconds = initialMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5 * 60 * 1000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.circleWrap}>
            <View style={[styles.circleBg]} />
            <View style={[styles.circleFill, { width: `${progress}%` }]} />
            <View style={styles.circleIcon}>
              <Ionicons name="shield-checkmark" size={24} color={isPaused ? colors.mutedForeground : colors.primary} />
            </View>
          </View>
          <View>
            <Text style={styles.title}>{t('dashboard.shield')}</Text>
            <Text style={styles.time}>{formatTime(timeLeft)}</Text>
            {isPaused && <Text style={styles.paused}>Paused for 5 min</Text>}
          </View>
        </View>
        <Pressable
          style={[styles.btnIcon, isPaused && styles.btnIconResume]}
          onPress={isPaused ? () => setIsPaused(false) : handlePause}
        >
          <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color={isPaused ? colors.success : colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  circleWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleBg: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: colors.border },
  circleFill: { position: 'absolute', left: 0, bottom: 0, height: 64, backgroundColor: colors.primary, opacity: 0.3 },
  circleIcon: {},
  title: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  time: { fontSize: 28, fontWeight: '900', color: colors.primary },
  paused: { fontSize: 12, color: colors.mutedForeground },
  btnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconResume: { borderColor: colors.success },
});
