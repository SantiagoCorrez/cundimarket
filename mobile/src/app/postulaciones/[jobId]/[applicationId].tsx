import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Applicant, ApplicantsJob } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { Card, Logo, ScreenHeader } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useApiQuery } from '@/hooks/use-api-query';
import { telUrl, timeAgo, whatsappUrl } from '@/utils/format';

/** Perfil de un postulante (solo para quien publicó la vacante). No se guarda en el dispositivo. */
export default function ApplicantScreen() {
  const { jobId, applicationId } = useLocalSearchParams<{ jobId: string; applicationId: string }>();
  const insets = useSafeAreaInsets();
  const { data, failed, reload } = useApiQuery<{ job: ApplicantsJob; applicant: Applicant }>(
    `/api/mobile/empleo/${jobId}/applications/${applicationId}`,
    { cache: false },
  );

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
        <ScreenHeader title="Perfil del postulante" />
        {failed ? (
          <LoadError onRetry={reload} what="este perfil" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )}
      </View>
    );
  }

  const { job, applicant } = data;
  const { user } = applicant;
  const c = user.candidate;
  const sections = [
    { label: 'Experiencia laboral', value: c?.experience },
    { label: 'Habilidades', value: c?.skills },
    { label: 'Formación académica', value: c?.education },
  ].filter((s) => s.value);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Perfil del postulante" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 32 }}>
        <View style={styles.header}>
          <Logo name={user.name} uri={user.avatarUrl} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.sub}>📍 {user.municipality}</Text>
            <Text style={styles.time}>
              Postulado a {job.title}
              {applicant.appliedAt ? ` · ${timeAgo(applicant.appliedAt)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {user.phone ? (
            <>
              <Action icon="call" label="Llamar" onPress={() => Linking.openURL(telUrl(user.phone!))} />
              <Action
                icon="logo-whatsapp"
                label="WhatsApp"
                onPress={() =>
                  Linking.openURL(whatsappUrl(user.phone!, `Hola ${user.name}, te escribo por tu postulación a ${job.title} en CundiMarket.`))
                }
              />
            </>
          ) : null}
          <Action icon="mail" label="Correo" onPress={() => Linking.openURL(`mailto:${user.email}`)} />
        </View>
        <Text style={styles.time}>{[user.phone, user.email].filter(Boolean).join(' · ')}</Text>

        {sections.map((s) => (
          <Card key={s.label}>
            <Text style={styles.sectionTitle}>{s.label}</Text>
            <Text style={styles.paragraph}>{s.value}</Text>
          </Card>
        ))}
        {c?.cvUrl ? (
          <Card>
            <Text style={styles.sectionTitle}>Hoja de vida</Text>
            <Image source={c.cvUrl} style={styles.cv} contentFit="contain" cachePolicy="none" accessibilityLabel={`Hoja de vida de ${user.name}`} />
          </Card>
        ) : null}
        {!sections.length && !c?.cvUrl && (
          <Text style={styles.paragraph}>Esta persona aún no ha completado su perfil laboral. Puedes contactarla directamente.</Text>
        )}
        <Text style={styles.time}>Usa estos datos solo para este proceso de selección (Ley 1581 de 2012).</Text>
      </ScrollView>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.action} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={17} color="#fff" />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { fontSize: 20, fontWeight: '800', color: Palette.text },
  sub: { fontSize: 13.5, color: Palette.textSecondary },
  time: { fontSize: 12, color: Palette.inkFaint },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, height: 44, borderRadius: Radius.card - 6, backgroundColor: Palette.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.text },
  paragraph: { fontSize: 14, color: Palette.textSecondary, lineHeight: 20, marginTop: 4 },
  cv: { width: '100%', aspectRatio: 0.75, marginTop: 8, borderRadius: Radius.card - 6, backgroundColor: Palette.backgroundElement },
});
