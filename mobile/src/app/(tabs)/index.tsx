import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeFeed } from '@/api/types';
import { BusinessFeaturedCard, CategoryChip, NewsCard, PromoCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { MunicipalityPicker } from '@/components/municipality-picker';
import { SectionTitle } from '@/components/ui';
import { PILOT_MUNICIPALITY } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';

const MODULES = [
  { key: 'comercios', label: 'Comercios', icon: '🏪', href: '/comercios' as const },
  { key: 'espacios', label: 'CundiEspacios', icon: '🏠', href: '/espacios' as const },
  { key: 'servicios', label: 'CundiServicios', icon: '🛠️', href: '/servicios' as const },
  { key: 'empleo', label: 'CundiEmpleo', icon: '💼', href: '/empleo' as const },
  { key: 'news', label: 'Noticias', icon: '📰', href: '/(tabs)/news' as const },
  { key: 'emergency', label: 'Emergencias', icon: '🚨', href: '/emergency' as const },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, municipality, selectMunicipality } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: feed, failed, loading, reload } = useApiQuery<HomeFeed>(
    `/api/mobile/home?municipality=${encodeURIComponent(municipality)}`,
  );

  if (!feed) {
    return (
      <View style={styles.loading}>
        {failed ? <LoadError onRetry={reload} what="el inicio" /> : <ActivityIndicator color={Palette.brand} />}
      </View>
    );
  }

  async function saveMunicipality(m: string, notify: boolean) {
    try {
      await selectMunicipality(m);
      if (notify) Alert.alert('¡Listo!', `Te avisaremos cuando CundiMarket esté disponible en ${m}.`);
    } catch {
      Alert.alert('No se pudo guardar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  return (
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: Palette.background }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={Palette.brand} />}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>{user ? `Hola, ${user.name.split(' ')[0]} 👋` : 'Hola 👋'}</Text>
            <Pressable style={styles.heroPlace} onPress={() => setPickerOpen(true)} hitSlop={8}>
              <Ionicons name="location" size={16} color={Palette.brand} />
              <Text style={styles.heroPlaceText}>{municipality}</Text>
              {municipality !== PILOT_MUNICIPALITY && <Text style={styles.soonTag}>Próximamente</Text>}
              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
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
          📰 Noticias de {municipality}
        </SectionTitle>
        <View style={{ gap: 10, marginTop: 10 }}>
          {feed.news.slice(0, 3).map((n) => (
            <NewsCard key={n.id} n={n} compact />
          ))}
        </View>
      </View>
    </ScrollView>

    <MunicipalityPicker
      visible={pickerOpen}
      current={municipality}
      onClose={() => setPickerOpen(false)}
      onSelect={(m) => {
        setPickerOpen(false);
        if (m !== municipality) saveMunicipality(m, false);
      }}
      onConfirmSoon={(m) => {
        setPickerOpen(false);
        saveMunicipality(m, !!user);
        // Visitante: además de ver la información de su municipio, se le invita a registrarse.
        // Se navega después de que el modal termine de cerrarse (si no, queda abierto sobre la pantalla nueva).
        if (!user) setTimeout(() => router.push({ pathname: '/register', params: { municipality: m } }), 300);
      }}
      soonConfirmLabel={user ? 'Avisarme cuando esté disponible' : 'Registrarme'}
    />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  hero: { backgroundColor: Palette.ink, borderBottomLeftRadius: Radius.hero, borderBottomRightRadius: Radius.hero, paddingHorizontal: 20, paddingBottom: 28 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroGreeting: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  heroPlace: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  heroPlaceText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  soonTag: { fontSize: 10.5, fontWeight: '700', color: '#fff', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, overflow: 'hidden' },
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
