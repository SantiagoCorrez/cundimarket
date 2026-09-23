import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { Job } from '@/api/types';
import { Badge, Button, Card, ScreenHeader } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { formatCOP } from '@/utils/format';

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  const load = useCallback(() => {
    api.get<{ job: Job; saved: boolean; applied: boolean }>(`/api/mobile/empleo/${id}`).then((r) => {
      setJob(r.job);
      setSaved(r.saved);
      setApplied(r.applied);
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSave() {
    if (!user) return router.push('/login');
    const next = !saved;
    setSaved(next);
    await api.post(`/api/mobile/empleo/${id}/save`, { applied: false });
    if (!next) return;
  }

  async function apply() {
    if (!user) return router.push('/login');
    setApplied(true);
    setSaved(true);
    await api.post(`/api/mobile/empleo/${id}/save`, { applied: true });
  }

  if (!job) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Palette.brand} />
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
            {meta.map((m) => (
              <Card key={m.label} style={styles.metaCard}>
                <View style={styles.metaLabelRow}>
                  <Ionicons name={m.icon} size={13} color={Palette.inkFaint} />
                  <Text style={styles.metaLabel}>{m.label}</Text>
                </View>
                <Text style={styles.metaValue}>{m.value}</Text>
              </Card>
            ))}
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
  metaCard: { width: '47.5%' },
  metaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaLabel: { fontSize: 11, color: Palette.inkFaint },
  metaValue: { fontSize: 13.5, fontWeight: '700', color: Palette.text, marginTop: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.text, marginTop: 20 },
  paragraph: { fontSize: 14, color: Palette.textSecondary, marginTop: 6, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
