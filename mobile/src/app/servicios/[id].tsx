import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { ServiceProvider } from '@/api/types';
import { Card, ScreenHeader, SectionTitle, Stars, VerifiedBadge } from '@/components/ui';
import { ReportButton } from '@/components/report-button';
import { Palette, Radius } from '@/constants/theme';
import { useContactGuard } from '@/hooks/use-contact-guard';
import { telUrl, timeAgo, whatsappUrl } from '@/utils/format';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const guardContact = useContactGuard();
  const [s, setS] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    api.get<{ provider: ServiceProvider }>(`/api/mobile/servicios/${id}`).then((r) => setS(r.provider));
  }, [id]);

  if (!s) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Palette.brand} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Prestador de servicio" />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            {s.photoUrl ? (
              <Image source={s.photoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <Text style={{ fontSize: 28 }}>🛠️</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.rowGap}>
              <Text style={styles.name}>{s.providerName}</Text>
              {s.verified && <VerifiedBadge small />}
            </View>
            <Text style={styles.subtitle}>{s.serviceType}</Text>
            <Stars value={s.ratingAvg} count={s.ratingCount} />
          </View>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={15} color={Palette.text} />
            <Text style={styles.infoText}>{s.coverageZone || s.municipality}</Text>
          </View>
          {s.yearsExperience ? (
            <View style={styles.infoRow}>
              <Ionicons name="ribbon" size={15} color={Palette.text} />
              <Text style={styles.infoText}>{s.yearsExperience} años de experiencia</Text>
            </View>
          ) : null}
        </View>

        {s.description ? (
          <View style={styles.section}>
            <SectionTitle>Sobre el servicio</SectionTitle>
            <Text style={styles.paragraph}>{s.description}</Text>
          </View>
        ) : null}

        {!!s.photos?.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 16 }}>
            {s.photos.map((ph) => (
              <Image key={ph.id} source={ph.url} style={styles.photo} contentFit="cover" />
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <SectionTitle>Calificaciones</SectionTitle>
          <View style={{ gap: 8, paddingHorizontal: 16 }}>
            {s.ratings?.length ? (
              s.ratings.map((r) => (
                <Card key={r.id}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.name}>{r.user.name}</Text>
                    <Stars value={r.stars} />
                  </View>
                  {r.comment ? <Text style={styles.subtitle}>{r.comment}</Text> : null}
                  <Text style={styles.timeAgo}>{timeAgo(r.createdAt)}</Text>
                </Card>
              ))
            ) : (
              <Text style={styles.paragraph}>Aún no hay calificaciones.</Text>
            )}
          </View>
        </View>
        <ReportButton targetType="SERVICE" targetId={s.id} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.callButton} onPress={() => guardContact(() => Linking.openURL(telUrl(s.phone)))}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callButtonText}>Llamar</Text>
        </Pressable>
        {s.whatsapp && (
          <Pressable
            style={styles.waButton}
            onPress={() => guardContact(() => Linking.openURL(whatsappUrl(s.whatsapp!, `Hola, vi tu servicio de ${s.serviceType} en CundiMarket.`)))}>
            <Ionicons name="logo-whatsapp" size={18} color={Palette.brandInk} />
            <Text style={styles.waButtonText}>WhatsApp</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  headerRow: { flexDirection: 'row', gap: 12, padding: 16 },
  avatar: { height: 72, width: 72, borderRadius: Radius.card, backgroundColor: Palette.backgroundElement, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Palette.text },
  subtitle: { fontSize: 13, color: Palette.textSecondary, marginTop: 2, marginBottom: 4 },
  infoBlock: { paddingHorizontal: 16, gap: 6, marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13.5, color: Palette.textSecondary },
  section: { marginTop: 20, gap: 8 },
  paragraph: { paddingHorizontal: 16, fontSize: 14, color: Palette.textSecondary, lineHeight: 20 },
  photo: { height: 130, width: 180, borderRadius: Radius.card, backgroundColor: Palette.backgroundElement },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeAgo: { fontSize: 11, color: Palette.inkFaint, marginTop: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: Palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.line,
  },
  callButton: { flex: 1, height: 48, borderRadius: Radius.card, backgroundColor: Palette.ink, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  callButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  waButton: { flex: 1, height: 48, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  waButtonText: { color: Palette.brandInk, fontWeight: '700', fontSize: 15 },
});
