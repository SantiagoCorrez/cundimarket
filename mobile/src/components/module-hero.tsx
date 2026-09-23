import * as WebBrowser from 'expo-web-browser';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from '@/api/client';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export function ModuleHero({
  title,
  subtitle,
  icon,
  publishPath,
}: {
  title: string;
  subtitle: string;
  icon: string;
  publishPath?: string;
}) {
  const { user } = useAuth();
  const canPublish = user?.role === 'MERCHANT' || user?.role === 'ADMIN';

  return (
    <View style={styles.hero}>
      <Text style={{ fontSize: 30 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {canPublish && publishPath && (
        <Pressable style={styles.publishButton} onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}${publishPath}`)}>
          <Text style={styles.publishText}>+ Publicar</Text>
        </Pressable>
      )}
    </View>
  );
}

export function FilterChips<T extends string>({
  options,
  current,
  onChange,
}: {
  options: { key: T; label: string }[];
  current?: T;
  onChange: (key: T | undefined) => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={options}
      keyExtractor={(o) => o.key}
      contentContainerStyle={styles.chipsRow}
      style={{ flexGrow: 0 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => onChange(current === item.key ? undefined : item.key)} style={[styles.chip, current === item.key && styles.chipActive]}>
          <Text style={[styles.chipText, current === item.key && styles.chipTextActive]}>{item.label}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  title: { fontSize: 19, fontWeight: '800', color: Palette.text },
  subtitle: { fontSize: 12.5, color: Palette.textSecondary, marginTop: 2 },
  publishButton: { backgroundColor: Palette.brand, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  publishText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Palette.surface },
  chipActive: { backgroundColor: Palette.brand },
  chipText: { fontSize: 12.5, fontWeight: '600', color: Palette.text },
  chipTextActive: { color: '#fff' },
});
