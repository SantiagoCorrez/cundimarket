import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Applicant, ApplicantsJob } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { Badge, Card, EmptyState, Logo, ScreenHeader } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';
import { timeAgo } from '@/utils/format';

/** Postulantes de una vacante (solo para quien la publicó). No se guardan en el dispositivo. */
export default function ApplicantsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const insets = useSafeAreaInsets();
  const { data, failed, reload } = useApiQuery<{ job: ApplicantsJob; applicants: Applicant[] }>(
    `/api/mobile/empleo/${jobId}/applications`,
    { refreshOnFocus: true, cache: false },
  );

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Postulantes" />
      {!data ? (
        failed ? (
          <LoadError onRetry={reload} what="los postulantes" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )
      ) : (
        <FlatList
          data={data.applicants}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.job}>{data.job.title}</Text>
              <Text style={styles.sub}>
                {data.job.companyName} · {data.applicants.length} {data.applicants.length === 1 ? 'postulante' : 'postulantes'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState icon="📭" title="Aún no hay postulantes" subtitle="Te avisaremos cuando alguien se postule a esta vacante." />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/postulaciones/[jobId]/[applicationId]', params: { jobId, applicationId: item.id } })}
              accessibilityRole="button">
              <Card style={styles.row}>
                <Logo name={item.user.name} uri={item.user.avatarUrl} size={46} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.user.name}</Text>
                    {!item.viewedAt && <Badge>Nuevo</Badge>}
                  </View>
                  <Text style={styles.sub} numberOfLines={1}>
                    {item.user.candidate?.skills || item.user.candidate?.education || 'Sin perfil laboral'}
                  </Text>
                  <Text style={styles.time}>
                    {item.user.municipality}
                    {item.appliedAt ? ` · ${timeAgo(item.appliedAt)}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Palette.inkFaint} />
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  job: { fontSize: 18, fontWeight: '800', color: Palette.text },
  sub: { fontSize: 13, color: Palette.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '700', color: Palette.text, flexShrink: 1 },
  time: { fontSize: 11.5, color: Palette.inkFaint },
});
