import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { HomeFeed } from '@/api/types';
import { BusinessFeaturedCard, CategoryChip, NewsCard, PromoCard } from '@/components/cards';
import { SectionTitle } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

const MODULES = [
  { key: 'espacios', label: 'CundiEspacios', icon: '🏠', href: '/espacios' as const },
  { key: 'servicios', label: 'CundiServicios', icon: '🛠️', href: '/servicios' as const },
  { key: 'empleo', label: 'CundiEmpleo', icon: '💼', href: '/empleo' as const },
  { key: 'emergency', label: 'Emergencias', icon: '🚨', href: '/emergency' as const },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<HomeFeed>('/api/mobile/home');
      setFeed(data);
    } catch {
      // silencioso: la sección se muestra vacía si la API no responde
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, not derived state
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!feed) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Palette.brand} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Palette.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.brand} />}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>{user ? `Hola, ${user.name.split(' ')[0]} 👋` : 'Hola 👋'}</Text>
            <View style={styles.heroPlace}>
              <Ionicons name="location" size={16} color={Palette.brand} />
              <Text style={styles.heroPlaceText}>{user?.municipality ?? feed.session?.municipality ?? 'Mosquera'}</Text>
            </View>
          </View>
          <Pressable style={styles.bellButton} onPress={() => router.push(user ? '/(tabs)/profile' : '/login')}>
            <Ionicons name="notifications" size={18} color="#fff" />
          </Pressable>
        </View>

        <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={20} color={Palette.textSecondary} />
          <Text style={styles.searchBarText}>Buscar negocios, productos…</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionTitle>Categorías</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {feed.categories.map((c) => (
            <CategoryChip key={c.id} category={c} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionTitle>Módulos</SectionTitle>
        <View style={styles.moduleGrid}>
          {MODULES.map((m) => (
            <Pressable key={m.key} style={styles.moduleCard} onPress={() => router.push(m.href)}>
              <Text style={{ fontSize: 26 }}>{m.icon}</Text>
              <Text style={styles.moduleLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          action={
            <Pressable onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.link}>Ver más</Text>
            </Pressable>
          }>
          ⭐ Negocios destacados
        </SectionTitle>
        {feed.featured.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {feed.featured.map((b) => (
              <BusinessFeaturedCard key={b.id} b={b} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>Aún no hay negocios verificados.</Text>
        )}
      </View>

      {feed.promos.length > 0 && (
        <View style={styles.section}>
          <SectionTitle>🔥 Promociones del día</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {feed.promos.map((p) => (
              <PromoCard key={p.id} p={p} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.section, { paddingHorizontal: 16, marginBottom: insets.bottom + 24 }]}>
        <SectionTitle
          action={
            <Pressable onPress={() => router.push('/(tabs)/news')}>
              <Text style={styles.link}>Ver todas</Text>
            </Pressable>
          }>
          📰 Noticias del municipio
        </SectionTitle>
        <View style={{ gap: 10, marginTop: 10 }}>
          {feed.news.slice(0, 3).map((n) => (
            <NewsCard key={n.id} n={n} compact />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  hero: { backgroundColor: Palette.ink, borderBottomLeftRadius: Radius.hero, borderBottomRightRadius: Radius.hero, paddingHorizontal: 20, paddingBottom: 28 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroGreeting: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  heroPlace: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  heroPlaceText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bellButton: { height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', height: 48, borderRadius: Radius.card, paddingHorizontal: 16 },
  searchBarText: { color: Palette.textSecondary, fontSize: 15 },
  section: { marginTop: 22, gap: 10 },
  hList: { paddingHorizontal: 16, gap: 10 },
  link: { fontSize: 13, fontWeight: '700', color: Palette.brandStrong },
  emptyText: { paddingHorizontal: 16, fontSize: 13, color: Palette.textSecondary },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  moduleCard: {
    width: '47%',
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  moduleLabel: { fontSize: 13, fontWeight: '700', color: Palette.text },
});
