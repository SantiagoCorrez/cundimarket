import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Job } from '@/api/types';
import { JobCard } from '@/components/cards';
import { LoadError } from '@/components/load-error';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { CONTRACT_TYPES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';

export default function EmpleoScreen() {
  const insets = useSafeAreaInsets();
  const [contract, setContract] = useState<string>();
  const { data, failed, reload } = useApiQuery<{ jobs: Job[] }>(
    `/api/mobile/empleo${contract ? `?contract=${encodeURIComponent(contract)}` : ''}`,
    { refreshOnFocus: true },
  );
  const jobs = data?.jobs ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="CundiEmpleo" />
      <ModuleHero title="CundiEmpleo" subtitle="Oportunidades en tu municipio" icon="💼" publishPath="/empleo/nuevo" />
      <Pressable style={styles.profileLink} onPress={() => router.push('/perfil-laboral')}>
        <Text style={styles.profileLinkText}>👤 Mi perfil laboral</Text>
      </Pressable>
      <FilterChips options={CONTRACT_TYPES.map((c) => ({ key: c, label: c }))} current={contract} onChange={setContract} />
      {jobs === null ? (
        failed ? (
          <LoadError onRetry={reload} what="esta lista" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={<EmptyState icon="💼" title="Sin vacantes por ahora" subtitle="Vuelve pronto o publica una vacante." />}
          renderItem={({ item }) => <JobCard j={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileLink: { paddingHorizontal: 16, paddingBottom: 10 },
  profileLinkText: { fontSize: 13, fontWeight: '700', color: Palette.brandStrong },
});
