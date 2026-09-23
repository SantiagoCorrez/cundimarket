import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { Business, Category } from '@/api/types';
import { BusinessCard } from '@/components/cards';
import { EmptyState } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';

const SORTS = [
  { key: 'top', label: 'Mejor calificados' },
  { key: 'recent', label: 'Nuevos' },
  { key: 'promos', label: 'Con promoción' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>(params.category);
  const [sort, setSort] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ categories: Category[] }>('/api/mobile/categories').then((r) => setCategories(r.categories));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the category filter when navigated here with a new param
    setCategory(params.category);
  }, [params.category]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change, not derived state
    setLoading(true);
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    if (category) search.set('category', category);
    if (sort) search.set('sort', sort);
    const timeout = setTimeout(() => {
      api
        .get<{ results: Business[] }>(`/api/mobile/search?${search.toString()}`)
        .then((r) => setResults(r.results))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, category, sort]);

  const activeCategoryName = useMemo(
    () => categories.find((c) => c.slug === category)?.name,
    [categories, category],
  );

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Palette.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar negocios, productos…"
          placeholderTextColor={Palette.textSecondary}
          style={styles.input}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.chipsRow}
        style={{ flexGrow: 0, marginTop: 10 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategory(category === item.slug ? undefined : item.slug)}
            style={[styles.chip, category === item.slug && styles.chipActive]}>
            <Text style={[styles.chipText, category === item.slug && styles.chipTextActive]}>
              {item.icon} {item.name}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SORTS}
        keyExtractor={(s) => s.key}
        contentContainerStyle={styles.chipsRow}
        style={{ flexGrow: 0, marginTop: 6 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSort(sort === item.key ? undefined : item.key)}
            style={[styles.sortChip, sort === item.key && styles.chipActive]}>
            <Text style={[styles.chipText, sort === item.key && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
              {activeCategoryName ? ` en ${activeCategoryName}` : ''}
            </Text>
          }
          ListEmptyComponent={
            <EmptyState title="Sin resultados" subtitle="Prueba con otra categoría o término de búsqueda." />
          }
          renderItem={({ item }) => <BusinessCard b={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.surface,
    height: 46,
    borderRadius: Radius.card,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: Palette.text },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: Palette.surface },
  sortChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: 'transparent', borderWidth: 1, borderColor: Palette.line },
  chipActive: { backgroundColor: Palette.brand, borderColor: Palette.brand },
  chipText: { fontSize: 12.5, fontWeight: '600', color: Palette.text },
  chipTextActive: { color: '#fff' },
  resultsCount: { fontSize: 13, color: Palette.textSecondary, marginBottom: 4 },
});
