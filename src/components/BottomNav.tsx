import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const tabs = [
  { name: 'Dashboard', icon: 'home-outline', iconActive: 'home' },
  { name: 'TestSeries', icon: 'document-text-outline', iconActive: 'document-text' },
  { name: 'Quiz', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { name: 'Social', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'Profile', icon: 'person-outline', iconActive: 'person' },
] as const;

export default function BottomNav() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View style={styles.container}>
      {tabs.map(({ name, icon, iconActive }) => {
        const isActive = route.name === name;
        return (
          <Pressable key={name} style={styles.tab} onPress={() => navigation.navigate(name)}>
            <Ionicons name={isActive ? iconActive : icon} size={24} color={isActive ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{name === 'TestSeries' ? 'Tests' : name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { alignItems: 'center', paddingHorizontal: 12 },
  label: { fontSize: 10, marginTop: 4, color: colors.mutedForeground, fontWeight: '600' },
  labelActive: { color: colors.primary },
});
