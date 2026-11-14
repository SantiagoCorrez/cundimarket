import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EmergencyContact, EmergencyDirectory } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { MunicipalityChip } from '@/components/municipality-chip';
import { Card, ScreenHeader } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';
import { splitPhones, telUrl } from '@/utils/format';

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();
  const { municipality } = useAuth();
  const { data, failed, reload } = useApiQuery<EmergencyDirectory>(
    `/api/mobile/emergency?municipality=${encodeURIComponent(municipality)}`,
  );

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Canales de atención" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 32 }}>
        <Pressable style={styles.sos} onPress={() => Linking.openURL('tel:123')} accessibilityRole="button" accessibilityLabel="Llamar al 123">
          <View style={styles.sosIcon}>
            <Ionicons name="call" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>Emergencias: 123</Text>
            <Text style={styles.sosText}>Línea única para Policía, ambulancia y bomberos</Text>
          </View>
        </Pressable>

        <MunicipalityChip />

        {!data ? (
          failed ? (
            <LoadError onRetry={reload} what="la lista de canales de atención" />
          ) : (
            <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
          )
        ) : (
          <>
            <Section title={`Líneas de ${data.municipality}`}>
              {data.local?.length ? (
                data.local.map((c) => <ContactCard key={c.id} c={c} />)
              ) : (
                <Text style={styles.note}>No hay líneas propias publicadas para este municipio. Usa la línea 123.</Text>
              )}
            </Section>
            <Section title="Gobernación de Cundinamarca">
              {data.departmental?.map((c) => <ContactCard key={c.id} c={c} />)}
            </Section>
            <Section title="Líneas nacionales">
              {data.national?.map((c) => <ContactCard key={c.id} c={c} />)}
            </Section>
            <Text style={styles.source}>
              Fuentes: directorios oficiales de la Policía Nacional, Bomberos, ESE, alcaldías y Gobernación de
              Cundinamarca (consulta 12 de noviembre de 2026). Si un número no responde, llama al 123.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ContactCard({ c }: { c: EmergencyContact }) {
  const phones = splitPhones(c.phone);
  return (
    <Card style={styles.row}>
      <View style={styles.icon}>
        <Text style={{ fontSize: 22 }}>{c.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name}>{c.name}</Text>
        {c.detail ? <Text style={styles.detail}>{c.detail}</Text> : null}
        {phones.length > 0 && (
          <View style={styles.phones}>
            {phones.map((p) => (
              <Pressable
                key={p}
                style={styles.callButton}
                onPress={() => Linking.openURL(telUrl(p))}
                accessibilityRole="button"
                accessibilityLabel={`Llamar a ${c.name} al ${p}`}>
                <Ionicons name="call" size={14} color="#fff" />
                <Text style={styles.callText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  sos: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: Radius.card, backgroundColor: Palette.danger },
  sosIcon: { height: 46, width: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sosTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sosText: { color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Palette.text, marginTop: 4 },
  note: { fontSize: 13.5, color: Palette.textSecondary },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { height: 46, width: 46, borderRadius: Radius.card - 6, backgroundColor: 'rgba(226,59,59,0.12)', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14.5, fontWeight: '700', color: Palette.text },
  detail: { fontSize: 12.5, color: Palette.textSecondary },
  phones: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  callButton: { height: 36, paddingHorizontal: 12, borderRadius: Radius.card - 8, backgroundColor: Palette.ink, flexDirection: 'row', alignItems: 'center', gap: 6 },
  callText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  source: { fontSize: 11.5, color: Palette.inkFaint, lineHeight: 16, marginTop: 4 },
});
