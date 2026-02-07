import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadDueLines, getMasteryProgress } from '../store/slices/neuronzSlice';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const LEVEL_ICONS = ['📚', '🧠', '📝', '🔄', '✅', '📖', '🚀'];

export default function RevisionWidget() {
  const dispatch = useAppDispatch();
  const { dueLines, masteryProgress, isLoading } = useAppSelector((state) => state.neuronz);

  useEffect(() => {
    dispatch(loadDueLines());
    dispatch(getMasteryProgress());
  }, [dispatch]);

  if (isLoading) return null;
  if (!dueLines || dueLines.total === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={20} color="#a78bfa" />
          <Text style={styles.title}>7-Level Revision</Text>
        </View>
        <Pressable onPress={() => navigate('RevisionDashboard')} style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#a78bfa" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{dueLines.total}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#f87171' }]}>0</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#4ade80' }]}>{masteryProgress?.masteryPercentage || 0}%</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </View>
      </View>

      {dueLines.lines?.slice(0, 3).map((line: any) => (
        <Pressable
          key={line._id}
          style={styles.lineRow}
          onPress={() => navigate('Revision')}
        >
          <Text style={styles.lineEmoji}>{LEVEL_ICONS[(line.level || 1) - 1]}</Text>
          <View style={styles.lineContent}>
            <Text style={styles.lineText} numberOfLines={2}>{line.lineId?.ncertText || 'NCERT Line'}</Text>
            <Text style={styles.lineMeta}>{line.lineId?.subject} • Level {line.level}</Text>
          </View>
          <Text style={styles.lineAcc}>{Math.round(line.overallAccuracy || 0)}%</Text>
        </Pressable>
      ))}

      <Pressable style={styles.ctaBtn} onPress={() => navigate('Revision')}>
        <Text style={styles.ctaText}>Start Revising ({dueLines.total} topics)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontWeight: '700', color: colors.foreground, fontSize: 16 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 14, color: '#a78bfa', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lineEmoji: { fontSize: 18, marginRight: 12 },
  lineContent: { flex: 1 },
  lineText: { fontWeight: '600', fontSize: 14, color: colors.foreground },
  lineMeta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  lineAcc: { fontSize: 12, color: colors.mutedForeground },
  ctaBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: '#a78bfa', alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
