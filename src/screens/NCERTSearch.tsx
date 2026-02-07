import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function NCERTSearch() {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>NCERT Search</Text>
        </View>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search any concept..."
          placeholderTextColor={colors.mutedForeground}
        />
        <Text style={styles.hint}>Search for concepts to get exact line references and spaced quizzes.</Text>
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
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, color: colors.foreground },
  hint: { fontSize: 14, color: colors.mutedForeground, marginTop: 16 },
});
