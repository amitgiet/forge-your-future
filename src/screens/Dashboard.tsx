import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useRevision } from '../contexts/RevisionContext';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import ShieldCard from '../components/ShieldCard';
import DailyChallengeCard from '../components/DailyChallengeCard';
import RevisionWidget from '../components/RevisionWidget';
import ActiveChallenges from '../components/ActiveChallenges';
import ThemeToggle from '../components/ThemeToggle';
import QuizCard from '../components/QuizCard';

export default function Dashboard() {
  const { t } = useLanguage();
  const { getStats } = useRevision();
  const revisionStats = getStats();
  const [userRank, setUserRank] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.leaderboard.getUserRank();
        if (res.data?.success) setUserRank(res.data.data);
      } catch (_) {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>NEETFORGE</Text>
            <Text style={styles.subtitle}>Let's crush today's goals! 💪</Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <Pressable style={styles.avatarBtn} onPress={() => navigate('Profile')}>
              <Text style={styles.avatarText}>A</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
              <Ionicons name="flame" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{userRank?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.streak')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139,92,246,0.2)' }]}>
              <Ionicons name="star" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{userRank?.totalXP ?? 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.score')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
              <Ionicons name="trophy" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>#{userRank?.rank ?? '—'}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        <ShieldCard initialMinutes={25} />
        <DailyChallengeCard />
        <QuizCard topic="Quick Practice" duration={10} questionCount={10} difficulty="Mixed" />

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable style={styles.actionCard} onPress={() => navigate('Revision')}>
            <Ionicons name="bulb-outline" size={24} color={colors.success} />
            <Text style={styles.actionLabel}>Revise</Text>
            {revisionStats.dueToday > 0 && <Text style={styles.badge}>{revisionStats.dueToday} due</Text>}
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigate('MyLearningPaths')}>
            <Ionicons name="sparkles-outline" size={24} color={colors.warning} />
            <Text style={styles.actionLabel}>Learn</Text>
            <Text style={styles.actionSub}>AI Path</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigate('MockAnalyzer')}>
            <Ionicons name="cloud-upload-outline" size={24} color={colors.secondary} />
            <Text style={styles.actionLabel}>Mock</Text>
            <Text style={styles.actionSub}>Analyze</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigate('NCERTSearch')}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>NCERT</Text>
            <Text style={styles.actionSub}>Search</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigate('TestSeries')}>
            <Ionicons name="document-text-outline" size={24} color={colors.warning} />
            <Text style={styles.actionLabel}>Tests</Text>
            <Text style={styles.actionSub}>Series</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigate('QuizGenerator')}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>AI Quiz</Text>
            <Text style={styles.actionSub}>Generate</Text>
          </Pressable>
        </View>

        <View style={styles.questCard}>
          <View style={styles.questHeader}>
            <Text style={styles.questTitle}>Today's Quest</Text>
            <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>+150 XP</Text></View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <View style={styles.questMeta}>
            <Text style={styles.questMetaText}>3/5 quizzes completed</Text>
            <Text style={styles.questPercent}>65%</Text>
          </View>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>45</Text><Text style={styles.miniStatLabel}>mins studied</Text></View>
            <View style={styles.divider} />
            <View style={styles.miniStat}><Text style={styles.miniStatValue}>12</Text><Text style={styles.miniStatLabel}>questions</Text></View>
            <View style={styles.divider} />
            <View style={styles.miniStat}><Text style={[styles.miniStatValue, { color: colors.success }]}>85%</Text><Text style={styles.miniStatLabel}>accuracy</Text></View>
          </View>
        </View>

        <ActiveChallenges />
        <RevisionWidget />
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.mutedForeground },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  questCard: { marginTop: 24, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questTitle: { fontWeight: '700', color: colors.foreground, fontSize: 16 },
  xpBadge: { backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  questMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  questMetaText: { fontSize: 14, color: colors.mutedForeground },
  questPercent: { fontSize: 14, fontWeight: '700', color: colors.primary },
  miniStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatValue: { fontSize: 18, fontWeight: '800', color: colors.foreground },
  miniStatLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  divider: { width: 1, backgroundColor: colors.border },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.foreground },
  statLabel: { fontSize: 12, color: colors.mutedForeground, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '31%', backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionLabel: { fontWeight: '700', color: colors.foreground, fontSize: 14, marginTop: 8 },
  actionSub: { fontSize: 10, color: colors.mutedForeground, marginTop: 4 },
  badge: { fontSize: 10, color: colors.success, marginTop: 4, fontWeight: '600' },
});
