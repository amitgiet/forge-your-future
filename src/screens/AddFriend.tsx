import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import apiService from '../lib/apiService';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function AddFriend() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await apiService.social.searchUsers(query.trim());
      setResults(res.data?.data || []);
    } catch (_) {
      setResults([]);
    }
    setSearching(false);
  };

  const sendRequest = async (friendId: string) => {
    try {
      await apiService.social.sendFriendRequest(friendId);
      setResults((p) => p.filter((u) => u._id !== friendId));
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Social')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>Add Friend</Text>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or email"
            placeholderTextColor={colors.mutedForeground}
            onSubmitEditing={search}
          />
          <Pressable style={styles.searchBtn} onPress={search} disabled={searching}>
            <Text style={styles.searchBtnText}>{searching ? '...' : 'Search'}</Text>
          </Pressable>
        </View>
        {results.map((user) => (
          <View key={user._id} style={styles.card}>
            <Text style={styles.name}>{user.name || user.email}</Text>
            <Pressable style={styles.addBtn} onPress={() => sendRequest(user._id)}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, color: colors.foreground },
  searchBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  name: { flex: 1, fontWeight: '600', color: colors.foreground },
  addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.primary },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
