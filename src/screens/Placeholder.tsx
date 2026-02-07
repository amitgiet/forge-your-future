import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../constants/theme';

export default function Placeholder() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const name = route.name || 'Screen';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.sub}>Same functionality as web – screen in progress.</Text>
      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24 },
  back: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  backText: { color: '#fff', fontWeight: '600' },
});
