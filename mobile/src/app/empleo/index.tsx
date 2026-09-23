import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL, api } from '@/api/client';
import type { Job } from '@/api/types';
import { JobCard } from '@/components/cards';
import { FilterChips, ModuleHero } from '@/components/module-hero';
import { EmptyState, ScreenHeader } from '@/components/ui';
import { CONTRACT_TYPES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';

export default function EmpleoScreen() {
  const insets = useSafeAreaInsets();
  const [contract, setContract] = useState<string>();
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-filter-change, not derived state
    setJobs(null);
    const search = contract ? `?contract=${encodeURIComponent(contract)}` : '';
    api.get<{ jobs: Job[] }>(`/api/mobile/empleo${search}`).then((r) => setJobs(r.jobs));
  }, [contract]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="CundiEmpleo" />
      <ModuleHero title="CundiEmpleo" subtitle="Oportunidades en tu municipio" icon="💼" publishPath="/empleo/nuevo" />
      <Pressable style={styles.profileLink} onPress={() => WebBrowser.openBrowserAsync(`${API_BASE_URL}/empleo/perfil`)}>
        <Text style={styles.profileLinkText}>👤 Mi perfil laboral</Text>
      </Pressable>
      <FilterChips options={CONTRACT_TYPES.map((c) => ({ key: c, label: c }))} current={contract} onChange={setContract} />
      {jobs === null ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
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
