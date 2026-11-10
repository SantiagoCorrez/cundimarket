import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkError, api } from '@/api/client';
import { searchSavedBusinesses } from '@/api/offline-search';
import type { Business, Category } from '@/api/types';
import { BusinessCard } from '@/components/cards';
import { EmptyState } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useReconnectTick } from '@/context/connectivity';

type Position = { lat: number; lng: number };

/**
 * Exploración de comercios: búsqueda (nombre, categoría, producto, barrio, municipio),
 * jerarquía Categoría → Subcategoría y filtros (abierto ahora, mejor calificados, promociones, más cercanos).
 *
 * - mode "search": muestra resultados desde el inicio (pestaña Buscar).
 * - mode "browse": primero muestra las categorías (módulo Comercios de Explorar).
 */
export function CommerceExplorer({
  mode,
  initialCategory,
  topInset = true,
}: {
  mode: 'search' | 'browse';
  initialCategory?: string;
  topInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState<string | undefined>(initialCategory);
  const [subcategorySlug, setSubcategorySlug] = useState<string | undefined>();
  const [openNow, setOpenNow] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [withPromos, setWithPromos] = useState(false);
  const [nearest, setNearest] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [locating, setLocating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Business[]>([]);
  // 'saved': sin conexión y sin copia de esta búsqueda; se muestran los comercios guardados en el dispositivo.
  const [status, setStatus] = useState<'loading' | 'ok' | 'saved' | 'error'>('loading');
  const loading = status === 'loading';
  const reconnectTick = useReconnectTick();

  const category = useMemo(() => categories.find((c) => c.slug === categorySlug), [categories, categorySlug]);
  const hasSelection = !!(query.trim() || categorySlug || openNow || topRated || withPromos || nearest);
  const showCategoryGrid = mode === 'browse' && !hasSelection;

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/api/mobile/categories')
      .then((r) => setCategories(r.categories))
      .catch(() => undefined);
  }, [reconnectTick]);

  useEffect(() => {
    if (showCategoryGrid) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change, not derived state
    setStatus('loading');
    const search = new URLSearchParams();
    if (query.trim()) search.set('q', query.trim());
    if (categorySlug) search.set('category', categorySlug);
    if (subcategorySlug) search.set('subcategory', subcategorySlug);
    if (openNow) search.set('open', '1');
    if (topRated) search.set('top', '1');
    if (withPromos) search.set('promos', '1');
    if (nearest && position) {
      search.set('sort', 'near');
      search.set('lat', String(position.lat));
      search.set('lng', String(position.lng));
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      api
        .get<{ results: Business[] }>(`/api/mobile/search?${search.toString()}`)
        .then((r) => {
          if (cancelled) return;
          setResults(r.results);
          setStatus('ok');
        })
        .catch(async (e) => {
          if (cancelled) return;
          if (e instanceof NetworkError) {
            const saved = await searchSavedBusinesses({ q: query, categorySlug, subcategorySlug, topRated, withPromos });
            if (cancelled) return;
            setResults(saved);
            setStatus('saved');
            return;
          }
          setResults([]);
          setStatus('error');
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [showCategoryGrid, query, categorySlug, subcategorySlug, openNow, topRated, withPromos, nearest, position, reconnectTick]);

  async function toggleNearest() {
    if (nearest) {
      setNearest(false);
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ubicación no disponible', 'Activa el permiso de ubicación para ver los comercios más cercanos a ti.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setNearest(true);
    } catch {
      Alert.alert('No pudimos obtener tu ubicación', 'Revisa que el GPS esté activo e inténtalo de nuevo.');
    } finally {
      setLocating(false);
    }
  }

  function selectCategory(slug: string | undefined) {
    setCategorySlug(slug);
    setSubcategorySlug(undefined);
  }

  const filters = [
    { key: 'open', label: '🟢 Abierto ahora', active: openNow, onPress: () => setOpenNow((v) => !v) },
    { key: 'top', label: '⭐ Mejor calificados', active: topRated, onPress: () => setTopRated((v) => !v) },
    { key: 'promos', label: '🔥 Promociones activas', active: withPromos, onPress: () => setWithPromos((v) => !v) },
    { key: 'near', label: locating ? '📍 Buscando…' : '📍 Más cercanos', active: nearest, onPress: toggleNearest },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: topInset ? insets.top + 12 : 12 }}>
      <View style={styles.headerBlock}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Palette.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nombre, categoría, producto, barrio o municipio"
            placeholderTextColor={Palette.textSecondary}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={Palette.inkFaint} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsList}
          renderItem={({ item }) => (
            <Pressable onPress={item.onPress} style={[styles.filterChip, item.active && styles.chipActive]}>
              <Text style={[styles.chipText, item.active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          )}
        />

        {!showCategoryGrid && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 'all', slug: undefined, name: 'Todas', icon: '🏪' }, ...categories]}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.chipsRow}
            style={styles.chipsList}
            renderItem={({ item }) => {
              const active = item.slug === categorySlug;
              return (
                <Pressable onPress={() => selectCategory(item.slug)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {item.icon} {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}

        {!showCategoryGrid && !!category?.subcategories?.length && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 'all', slug: undefined, name: `Todo en ${category.name}` }, ...category.subcategories]}
            keyExtractor={(s) => s.id}
            contentContainerStyle={styles.chipsRow}
            style={styles.chipsList}
            renderItem={({ item }) => {
              const active = item.slug === subcategorySlug;
              return (
                <Pressable onPress={() => setSubcategorySlug(item.slug)} style={[styles.subChip, active && styles.subChipActive]}>
                  <Text style={[styles.subChipText, active && styles.subChipTextActive]}>{item.name}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {showCategoryGrid ? (
        <FlatList
          key="categories"
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          data={categories}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Categorías</Text>}
          ListEmptyComponent={<ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />}
          renderItem={({ item }) => (
            <Pressable style={styles.categoryCard} onPress={() => selectCategory(item.slug)}>
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              <Text style={styles.categoryName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.categoryCount}>{item.subcategories?.length ?? 0} subcategorías</Text>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          key="results"
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24, gap: 10 }]}
          data={loading ? [] : results}
          keyExtractor={(b) => b.id}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            status === 'ok' || status === 'saved' ? (
              <Text style={styles.resultsCount}>
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                {category ? ` en ${category.name}` : ''}
                {status === 'saved' ? ' · guardados en este dispositivo' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
            ) : status === 'saved' ? (
              <EmptyState
                icon="📡"
                title="Sin resultados guardados"
                subtitle="No tienes conexión. Conéctate a internet para buscar entre todos los comercios."
              />
            ) : status === 'error' ? (
              <EmptyState icon="📡" title="No pudimos cargar los comercios" subtitle="Revisa tu conexión e inténtalo de nuevo." />
            ) : (
              <EmptyState title="Sin resultados" subtitle="Prueba con otra categoría, filtro o término de búsqueda." />
            )
          }
          renderItem={({ item }) => <BusinessCard b={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: { paddingHorizontal: 16, gap: 10, paddingBottom: 10 },
  content: { paddingHorizontal: 16, paddingTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.surface,
    height: 46,
    borderRadius: Radius.card,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 14.5, color: Palette.text },
  chipsList: { flexGrow: 0, marginHorizontal: -16 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.line },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Palette.surface },
  chipActive: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  chipText: { fontSize: 12.5, fontWeight: '600', color: Palette.text },
  chipTextActive: { color: '#fff' },
  subChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.line },
  subChipActive: { backgroundColor: Palette.ink, borderColor: Palette.ink },
  subChipText: { fontSize: 12, fontWeight: '600', color: Palette.textSecondary },
  subChipTextActive: { color: '#fff' },
  resultsCount: { fontSize: 13, color: Palette.textSecondary, marginBottom: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Palette.text, marginBottom: 10 },
  categoryCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: 14,
    marginBottom: 10,
    gap: 4,
    minHeight: 112,
  },
  categoryName: { fontSize: 14.5, fontWeight: '700', color: Palette.text },
  categoryCount: { fontSize: 11.5, color: Palette.textSecondary },
});
