import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { Property } from '@/api/types';
import { PropertyCard } from '@/components/cards';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { OFFER_TYPES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';

export default function EspaciosScreen() {
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<string>();
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change, not derived state
    setProperties(null);
    const search = offer ? `?offer=${offer}` : '';
    api.get<{ properties: Property[] }>(`/api/mobile/espacios${search}`).then((r) => setProperties(r.properties));
  }, [offer]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="CundiEspacios" />
      <ModuleHero title="CundiEspacios" subtitle="Encuentra tu próximo hogar" icon="🏠" publishPath="/espacios/nuevo" />
      <FilterChips options={OFFER_TYPES.map((o) => ({ key: o.key, label: o.label }))} current={offer} onChange={setOffer} />
      {properties === null ? (
        <ActivityIndicator style={styles.loading} color={Palette.brand} />
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
