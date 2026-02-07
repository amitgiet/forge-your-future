import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { navigate } from '../navigation/rootRef';

interface QuizCardProps {
  topic?: string;
  duration?: number;
  questionCount?: number;
  difficulty?: string;
}

export default function QuizCard({ topic = 'Quick Quiz', duration = 10, questionCount = 10, difficulty = 'Medium' }: QuizCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => navigate('QuizStart')}>
      <View style={styles.iconWrap}>
        <Ionicons name="help-buffer-outline" size={28} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{topic}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{questionCount} Qs</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{duration} min</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{difficulty}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12, color: colors.mutedForeground },
  metaDot: { fontSize: 12, color: colors.mutedForeground, marginHorizontal: 6 },
});
