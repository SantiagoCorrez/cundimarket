import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MunicipalityNews } from '@/api/types';
import { NewsCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { MunicipalityChip } from '@/components/municipality-chip';
import { EmptyState } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { municipality } = useAuth();
  const { data, failed, reload } = useApiQuery<MunicipalityNews>(
    `/api/mobile/news?municipality=${encodeURIComponent(municipality)}`,
  );
  const news = data?.news ?? null;
  const syncing = !!data?.syncing && news?.length === 0;

  // La primera vez que se piden las noticias de una alcaldía tardan unos segundos: se vuelve a consultar.
  useEffect(() => {
    if (!syncing) return;
    const id = setTimeout(reload, 4000);
    return () => clearTimeout(id);
  }, [syncing, reload, data]);

  const header = (
    <View style={{ gap: 10, marginBottom: 6 }}>
      <Text style={styles.title}>Noticias del municipio</Text>
      <MunicipalityChip />
    </View>
  );

  if (!news) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top + 16 }]}>
        <View style={{ paddingHorizontal: 16, width: '100%' }}>{header}</View>
        {failed ? <LoadError onRetry={reload} what="las noticias" /> : <ActivityIndicator style={{ marginTop: 32 }} color={Palette.brand} />}
      </View>
    );
  }

  const source = data?.source;
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: Palette.background }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, gap: 10 }}
      data={news}
      keyExtractor={(n) => n.id}
      ListHeaderComponent={header}
      ListEmptyComponent={
        syncing ? (
          <EmptyState icon="⏳" title={`Trayendo las noticias de ${data?.municipality}…`} subtitle="Esto toma unos segundos la primera vez." />
        ) : (
          <EmptyState
            icon="📰"
            title={`Sin noticias de ${data?.municipality ?? municipality} por ahora`}
            subtitle="Puedes consultarlas directamente en el sitio oficial de la alcaldía."
          />
        )
      }
      ListFooterComponent={
        source ? (
          <Pressable style={styles.sourceLink} onPress={() => WebBrowser.openBrowserAsync(source.news)} accessibilityRole="link">
            <Text style={styles.sourceText}>Ver más en el sitio de la Alcaldía de {data?.municipality}</Text>
            <Ionicons name="open-outline" size={14} color={Palette.brandStrong} />
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => <NewsCard n={item} />}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', backgroundColor: Palette.background },
  title: { fontSize: 24, fontWeight: '800', color: Palette.text },
  sourceLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  sourceText: { fontSize: 13.5, fontWeight: '700', color: Palette.brandStrong },
});
