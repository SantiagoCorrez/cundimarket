import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { News } from '@/api/types';
import { NewsCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { EmptyState } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { data, failed, reload } = useApiQuery<{ news: News[] }>('/api/mobile/news');
  const news = data?.news ?? null;

  if (!news) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        {failed ? <LoadError onRetry={reload} what="las noticias" /> : <ActivityIndicator color={Palette.brand} />}
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: Palette.background }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 10 }}
      data={news}
      keyExtractor={(n) => n.id}
      ListHeaderComponent={<Text style={styles.title}>Noticias del municipio</Text>}
      ListEmptyComponent={
        <EmptyState icon="📰" title="Sin noticias por ahora" subtitle="Pronto verás información oficial de tu municipio." />
      }
      renderItem={({ item }) => <NewsCard n={item} />}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  title: { fontSize: 24, fontWeight: '800', color: Palette.text, marginBottom: 6 },
});
