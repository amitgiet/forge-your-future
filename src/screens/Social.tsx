import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import BottomNav from '../components/BottomNav';

export default function Social() {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [fRes, rRes] = await Promise.all([
          apiService.social.getFriends(),
          apiService.social.getFriendRequests(),
        ]);
        setFriends(fRes.data?.data || []);
        setRequests(rRes.data?.data || []);
      } catch (_) {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Social</Text>
        <Pressable style={styles.addBtn} onPress={() => navigate('AddFriend')}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Friend</Text>
        </Pressable>

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requests</Text>
            {requests.map((r) => (
              <View key={r._id} style={styles.card}>
                <Text style={styles.name}>{r.name || r.email}</Text>
                <View style={styles.cardActions}>
                  <Pressable style={styles.acceptBtn} onPress={async () => { try { await apiService.social.acceptFriendRequest(r._id); setRequests((p) => p.filter((x) => x._id !== r._id)); setFriends((p) => [...p, r]); } catch (_) {} }}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends</Text>
          {friends.length === 0 ? (
            <Text style={styles.empty}>No friends yet. Add someone!</Text>
          ) : (
            friends.map((f) => (
              <Pressable key={f._id} style={styles.card} onPress={() => navigate('Chat', { chatId: f.chatId || f._id })}>
                <Text style={styles.name}>{f.name || f.email}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, marginBottom: 24 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  name: { flex: 1, fontWeight: '600', color: colors.foreground },
  cardActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.success },
  acceptBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { color: colors.mutedForeground },
});
