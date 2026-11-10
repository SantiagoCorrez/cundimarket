import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ServiceProvider } from '@/api/types';
import { ServiceCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';

export default function ServiciosScreen() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState<string>();
  const { data, failed, reload } = useApiQuery<{ providers: ServiceProvider[] }>(
    `/api/mobile/servicios${cat ? `?cat=${cat}` : ''}`,
    { refreshOnFocus: true },
  );
  const providers = data?.providers ?? null;

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
        failed ? (
          <LoadError onRetry={reload} what="esta lista" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )
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
