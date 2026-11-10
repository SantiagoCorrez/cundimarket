import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Property } from '@/api/types';
import { PropertyCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { OFFER_TYPES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';

export default function EspaciosScreen() {
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<string>();
  const { data, failed, reload } = useApiQuery<{ properties: Property[] }>(`/api/mobile/espacios${offer ? `?offer=${offer}` : ''}`);
  const properties = data?.properties ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="CundiEspacios" />
      <ModuleHero title="CundiEspacios" subtitle="Encuentra tu próximo hogar" icon="🏠" publishPath="/espacios/nuevo" />
      <FilterChips options={OFFER_TYPES.map((o) => ({ key: o.key, label: o.label }))} current={offer} onChange={setOffer} />
      {properties === null ? (
        failed ? (
          <LoadError onRetry={reload} what="esta lista" />
        ) : (
          <ActivityIndicator style={styles.loading} color={Palette.brand} />
        )
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={<EmptyState icon="🏠" title="Aún no hay publicaciones" subtitle="Sé el primero en publicar un inmueble." />}
          renderItem={({ item }) => <PropertyCard p={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 24 },
});
