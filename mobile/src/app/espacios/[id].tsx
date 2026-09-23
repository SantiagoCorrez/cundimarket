import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { Property } from '@/api/types';
import { Badge, Card, ScreenHeader, VerifiedBadge } from '@/components/ui';
import { OFFER_TYPES } from '@/constants/taxonomy';
import { Palette, Radius } from '@/constants/theme';
import { formatCOP, telUrl, whatsappUrl } from '@/utils/format';

export default function PropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<Property | null>(null);

  useEffect(() => {
    api.get<{ property: Property }>(`/api/mobile/espacios/${id}`).then((r) => setP(r.property));
  }, [id]);

  if (!p) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Palette.brand} />
      </View>
    );
  }

  const offer = OFFER_TYPES.find((o) => o.key === p.offerType);
  const specs = [
    p.rooms ? { icon: 'bed', label: `${p.rooms} hab.` } : null,
    p.bathrooms ? { icon: 'water', label: `${p.bathrooms} baños` } : null,
    p.parking ? { icon: 'car', label: 'Parqueadero' } : null,
    p.area ? { icon: 'resize', label: `${p.area} m²` } : null,
  ].filter(Boolean) as { icon: keyof typeof Ionicons.glyphMap; label: string }[];

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title={p.propertyType} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {p.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {p.photos.map((ph) => (
              <Image key={ph.id} source={ph.url} style={styles.photo} contentFit="cover" />
            ))}
          </ScrollView>
        )}
        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <Badge tone="brand">{offer?.label}</Badge>
            {p.verified && <VerifiedBadge small />}
            {p.status !== 'ACTIVE' && <Badge tone="neutral">{p.status === 'RESERVED' ? 'Reservado' : 'Cerrado'}</Badge>}
          </View>
          <Text style={styles.price}>
            {formatCOP(p.price)}
            {p.offerType === 'RENT' && p.price ? <Text style={styles.priceUnit}> /mes</Text> : null}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Palette.textSecondary} />
            <Text style={styles.locationText}>
              {p.neighborhood ? `${p.neighborhood}, ` : ''}
              {p.municipality}
              {p.address ? ` · ${p.address}` : ''}
            </Text>
          </View>

          {specs.length > 0 && (
            <View style={styles.specsGrid}>
              {specs.map((s, i) => (
                <Card key={i} style={styles.specCard}>
                  <Ionicons name={s.icon} size={18} color={Palette.text} />
                  <Text style={styles.specLabel}>{s.label}</Text>
                </Card>
              ))}
            </View>
          )}

          {p.description ? (
            <>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.paragraph}>{p.description}</Text>
            </>
          ) : null}
          {p.services ? (
            <>
              <Text style={styles.sectionTitle}>Servicios incluidos</Text>
              <Text style={styles.paragraph}>{p.services}</Text>
            </>
          ) : null}
          {p.stratum ? <Text style={styles.paragraph}>Estrato {p.stratum}</Text> : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.ownerText}>Contacto: {p.ownerName}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.callButton} onPress={() => Linking.openURL(telUrl(p.phone))}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.callButtonText}>Llamar</Text>
          </Pressable>
          {p.whatsapp && (
            <Pressable
              style={styles.waButton}
              onPress={() => Linking.openURL(whatsappUrl(p.whatsapp!, `Hola, me interesa el ${p.propertyType} publicado en CundiEspacios.`))}>
              <Ionicons name="logo-whatsapp" size={18} color={Palette.brandInk} />
              <Text style={styles.waButtonText}>WhatsApp</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  photo: { height: 220, width: 300, backgroundColor: Palette.backgroundElement },
  body: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  price: { fontSize: 24, fontWeight: '800', color: Palette.text, marginTop: 8 },
  priceUnit: { fontSize: 15, fontWeight: '600', color: Palette.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  locationText: { fontSize: 13, color: Palette.textSecondary, flex: 1 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  specCard: { width: '23%', alignItems: 'center', gap: 4, paddingVertical: 12 },
  specLabel: { fontSize: 11, color: Palette.textSecondary, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.text, marginTop: 20 },
  paragraph: { fontSize: 14, color: Palette.textSecondary, marginTop: 6, lineHeight: 20 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    gap: 8,
    backgroundColor: Palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.line,
  },
  ownerText: { fontSize: 12, color: Palette.textSecondary, paddingHorizontal: 4 },
  callButton: { flex: 1, height: 48, borderRadius: Radius.card, backgroundColor: Palette.ink, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  callButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  waButton: { flex: 1, height: 48, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  waButtonText: { color: Palette.brandInk, fontWeight: '700', fontSize: 15 },
});
