import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { ServiceProvider } from '@/api/types';
import { ServiceCard } from '@/components/cards';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';

export default function ServiciosScreen() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<string>();
  const [providers, setProviders] = useState<ServiceProvider[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change, not derived state
    setProviders(null);
    const search = cat ? `?cat=${cat}` : '';
    api.get<{ providers: ServiceProvider[] }>(`/api/mobile/servicios${search}`).then((r) => setProviders(r.providers));
  }, [cat]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="CundiServicios" />
      <ModuleHero title="CundiServicios" subtitle="Encuentra expertos cerca de ti" icon="🛠️" publishPath="/servicios/nuevo" />
      <FilterChips
        options={SERVICE_CATEGORIES.map((c) => ({ key: c.key, label: `${c.icon} ${c.name.replace('Servicios ', '')}` }))}
        current={cat}
        onChange={setCat}
      />
      {providers === null ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={<EmptyState icon="🛠️" title="Sin prestadores aún" subtitle="Sé el primero en ofrecer tu servicio." />}
          renderItem={({ item }) => <ServiceCard s={item} />}
        />
      )}
    </View>
  );
}
