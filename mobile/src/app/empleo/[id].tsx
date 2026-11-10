import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setJobState } from '@/api/offline-actions';
import type { Job } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { OwnerActions } from '@/components/owner-actions';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { ReportButton } from '@/components/report-button';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';
import { formatCOP } from '@/utils/format';
import { openDirections } from '@/utils/maps';

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, failed, reload } = useApiQuery<{ job: Job; saved: boolean; applied: boolean; isOwner?: boolean }>(
    `/api/mobile/empleo/${id}`,
    { refreshOnFocus: true },
  );
  const job = data?.job ?? null;

  // Guardado/aplicado se reflejan al instante; el valor local vale mientras no lleguen datos nuevos del servidor.
  const [override, setOverride] = useState<{ source: unknown; saved: boolean; applied: boolean } | null>(null);
  const local = override && override.source === data ? override : null;
  const saved = local ? local.saved : (data?.saved ?? false);
  const applied = local ? local.applied : (data?.applied ?? false);

  async function update(next: { saved: boolean; applied: boolean }) {
    if (!user) return router.push('/login');
    const previous = { saved, applied };
    setOverride({ source: data, ...next });
    try {
      await setJobState(user.id, id, next);
    } catch {
      setOverride({ source: data, ...previous });
      Alert.alert('No se pudo guardar', 'Inténtalo de nuevo en unos segundos.');
    }
  }

  const toggleSave = () => update({ saved: !saved, applied: false });
  const apply = () => update({ saved: true, applied: true });

  if (!job) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        {failed ? <LoadError onRetry={reload} what="esta vacante" /> : <ActivityIndicator color={Palette.brand} />}
      </View>
    );
  }

  const meta = [
    { icon: 'briefcase', label: 'Empresa', value: job.companyName },
    { icon: 'location', label: 'Ubicación', value: `${job.municipality}${job.address ? `, ${job.address}` : ''}` },
    { icon: 'cash', label: 'Salario', value: formatCOP(job.salary) },
    { icon: 'time', label: 'Contrato', value: `${job.contractType}${job.workday ? ` · ${job.workday}` : ''}` },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Vacante" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.body}>
          <Badge tone="brand">{job.sector}</Badge>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.companyName}</Text>

          <View style={styles.metaGrid}>
            {meta.map((m) => {
              const link = m.label === 'Ubicación' && !!job.address;
              const card = (
                <Card>
                  <View style={styles.metaLabelRow}>
                    <Ionicons name={m.icon} size={13} color={Palette.inkFaint} />
                    <Text style={styles.metaLabel}>{m.label}</Text>
                  </View>
                  <Text style={[styles.metaValue, link && styles.metaLink]}>{m.value}</Text>
                  {link && <Text style={styles.metaHint}>Cómo llegar ›</Text>}
                </Card>
              );
              return (
                <View key={m.label} style={styles.metaCell}>
                  {link ? (
                    <Pressable onPress={() => openDirections(job)} accessibilityRole="link" accessibilityLabel="Cómo llegar">
                      {card}
                    </Pressable>
                  ) : (
                    card
                  )}
                </View>
              );
            })}
          </View>

          {job.functions ? (
            <>
              <Text style={styles.sectionTitle}>Funciones</Text>
              <Text style={styles.paragraph}>{job.functions}</Text>
            </>
          ) : null}
          {job.requirements ? (
            <>
              <Text style={styles.sectionTitle}>Requisitos</Text>
              <Text style={styles.paragraph}>{job.requirements}</Text>
            </>
          ) : null}
          {job.experience ? (
            <Text style={styles.paragraph}>
              <Text style={{ fontWeight: '700', color: Palette.text }}>Experiencia: </Text>
              {job.experience}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button variant="outline" onPress={toggleSave} style={{ flex: 1 }}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={Palette.text} />
              <Text style={{ fontWeight: '700', color: Palette.text }}>{saved ? 'Guardada' : 'Guardar'}</Text>
            </Button>
            <Button onPress={apply} disabled={applied} style={{ flex: 1 }}>
              {applied ? 'Ya aplicaste' : 'Aplicar'}
            </Button>
          </View>
        </View>
        {data?.isOwner && <OwnerActions kind="job" id={job.id} title={job.title} onChanged={reload} admin={user?.role === 'ADMIN'} />}
        <ReportButton targetType="JOB" targetId={job.id} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  body: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Palette.text, marginTop: 8 },
  company: { fontSize: 14, color: Palette.textSecondary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  metaCell: { width: '47.5%' },
  metaLink: { color: Palette.brandStrong, textDecorationLine: 'underline' },
  metaHint: { fontSize: 11.5, fontWeight: '700', color: Palette.brandStrong, marginTop: 3 },
  metaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaLabel: { fontSize: 11, color: Palette.inkFaint },
  metaValue: { fontSize: 13.5, fontWeight: '700', color: Palette.text, marginTop: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.text, marginTop: 20 },
  paragraph: { fontSize: 14, color: Palette.textSecondary, marginTop: 6, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
