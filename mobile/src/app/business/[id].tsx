import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, api } from '@/api/client';
import type { Business } from '@/api/types';
import { Card, ScreenHeader, SectionTitle, Stars, VerifiedBadge } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { formatCOP, telUrl, timeAgo, whatsappUrl } from '@/utils/format';

export default function BusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  const load = useCallback(() => {
    api.get<{ business: Business; favorited: boolean }>(`/api/mobile/business/${id}`).then((r) => {
      setBusiness(r.business);
      setFavorited(r.favorited);
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFavorite() {
    if (!user) return router.push('/login');
    setFavorited((v) => !v);
    try {
      const r = await api.post<{ favorited: boolean }>(`/api/mobile/business/${id}/favorite`);
      setFavorited(r.favorited);
    } catch {
      setFavorited((v) => !v);
    }
  }

  if (!business) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Palette.brand} />
      </View>
    );
  }

  const waMessage = `Hola, te contacto desde CundiMarket por ${business.name}.`;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader
        title={business.name}
        right={
          <Pressable onPress={toggleFavorite} hitSlop={10} style={{ padding: 4 }}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={24} color={favorited ? Palette.danger : Palette.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerRow}>
          <View style={styles.logo}>
            {business.logoUrl ? (
              <Image source={business.logoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <Text style={{ fontSize: 30 }}>{business.category.icon}</Text>
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.rowGap}>
              <Text style={styles.name} numberOfLines={1}>
                {business.name}
              </Text>
              {business.status === 'VERIFIED' && <VerifiedBadge />}
            </View>
            <Text style={styles.category}>
              {business.category.icon} {business.category.name}
              {business.subcategory ? ` · ${business.subcategory.name}` : ''}
            </Text>
            <Stars value={business.ratingAvg} count={business.ratingCount} />
          </View>
        </View>

        <View style={styles.infoBlock}>
          <InfoRow icon="location" text={`${business.address}${business.neighborhood ? `, ${business.neighborhood}` : ''}, ${business.municipality}`} />
          {business.schedule && <InfoRow icon="time" text={business.schedule} />}
          <InfoRow icon="call" text={business.phone} />
        </View>

        {business.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {business.photos.map((ph) => (
              <Image key={ph.id} source={ph.url} style={styles.galleryImage} contentFit="cover" />
            ))}
          </ScrollView>
        )}

        {business.description ? (
          <View style={styles.section}>
            <SectionTitle>Descripción</SectionTitle>
            <Text style={styles.description}>{business.description}</Text>
          </View>
        ) : null}

        {business.promotions.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>🔥 Promociones vigentes</SectionTitle>
            <View style={{ gap: 8, paddingHorizontal: 16 }}>
              {business.promotions.map((p) => (
                <Card key={p.id} style={styles.promoRow}>
                  <Text style={styles.promoDiscount}>{p.discount ? `-${p.discount}%` : '🔥'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{p.title}</Text>
                    {p.description ? <Text style={styles.listSubtitle}>{p.description}</Text> : null}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {business.products.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>📋 Menú / Catálogo</SectionTitle>
            <View style={{ gap: 8, paddingHorizontal: 16 }}>
              {business.products.map((pr) => (
                <Card key={pr.id} style={styles.promoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{pr.name}</Text>
                    {pr.description ? <Text style={styles.listSubtitle}>{pr.description}</Text> : null}
                  </View>
                  {pr.price ? <Text style={styles.priceText}>{formatCOP(pr.price)}</Text> : null}
                </Card>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionTitle
            action={
              <Pressable onPress={() => (user ? setRateOpen(true) : router.push('/login'))}>
                <Text style={styles.link}>Calificar</Text>
              </Pressable>
            }>
            Calificaciones
          </SectionTitle>
          <View style={{ gap: 8, paddingHorizontal: 16 }}>
            {business.ratings.length ? (
              business.ratings.map((r) => (
                <Card key={r.id}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.listTitle}>{r.user.name}</Text>
                    <Stars value={r.stars} />
                  </View>
                  {r.comment ? <Text style={styles.listSubtitle}>{r.comment}</Text> : null}
                  <Text style={styles.timeAgo}>{timeAgo(r.createdAt)}</Text>
                </Card>
              ))
            ) : (
              <Text style={styles.emptyText}>Sé el primero en calificar este negocio.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.callButton} onPress={() => Linking.openURL(telUrl(business.phone))}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callButtonText}>Llamar</Text>
        </Pressable>
        {business.whatsapp && (
          <Pressable style={styles.waButton} onPress={() => Linking.openURL(whatsappUrl(business.whatsapp!, waMessage))}>
            <Ionicons name="logo-whatsapp" size={18} color={Palette.brandInk} />
            <Text style={styles.waButtonText}>WhatsApp</Text>
          </Pressable>
        )}
      </View>

      <RateModal
        visible={rateOpen}
        onClose={() => setRateOpen(false)}
        onSubmit={async (stars, comment) => {
          try {
            await api.post(`/api/mobile/business/${id}/rate`, { stars, comment });
            setRateOpen(false);
            load();
          } catch (e) {
            Alert.alert('Error', e instanceof ApiError ? e.message : 'No se pudo enviar tu calificación.');
          }
        }}
      />
    </View>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={Palette.text} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function RateModal({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: (stars: number, comment: string) => void }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Calificar negocio</Text>
          <View style={styles.modalStars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setStars(i)} hitSlop={6}>
                <Ionicons name={i <= stars ? 'star' : 'star-outline'} size={32} color={Palette.warn} />
              </Pressable>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Comentario (opcional)"
            placeholderTextColor={Palette.textSecondary}
            multiline
            style={styles.modalInput}
          />
          <Pressable style={styles.modalSubmit} onPress={() => onSubmit(stars, comment)}>
            <Text style={styles.callButtonText}>Enviar calificación</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  headerRow: { flexDirection: 'row', gap: 12, padding: 16 },
  logo: { height: 72, width: 72, borderRadius: Radius.card, backgroundColor: Palette.backgroundElement, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 19, fontWeight: '800', color: Palette.text },
  category: { fontSize: 13, color: Palette.textSecondary, marginTop: 2, marginBottom: 4 },
  infoBlock: { paddingHorizontal: 16, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13.5, color: Palette.textSecondary, flex: 1 },
  gallery: { paddingHorizontal: 16, gap: 8, marginTop: 16 },
  galleryImage: { height: 150, width: 210, borderRadius: Radius.card, backgroundColor: Palette.backgroundElement },
  section: { marginTop: 20, gap: 10 },
  description: { paddingHorizontal: 16, fontSize: 14, color: Palette.textSecondary, lineHeight: 20 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoDiscount: { fontSize: 16, fontWeight: '800', color: Palette.brandStrong },
  listTitle: { fontSize: 14.5, fontWeight: '700', color: Palette.text },
  listSubtitle: { fontSize: 12.5, color: Palette.textSecondary, marginTop: 2 },
  priceText: { fontSize: 14, fontWeight: '800', color: Palette.text },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeAgo: { fontSize: 11, color: Palette.inkFaint, marginTop: 4 },
  emptyText: { fontSize: 13, color: Palette.textSecondary },
  link: { fontSize: 13, fontWeight: '700', color: Palette.brandStrong },
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
  callButton: { flex: 1, height: 50, borderRadius: Radius.card, backgroundColor: Palette.ink, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  callButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  waButton: { flex: 1, height: 50, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  waButtonText: { color: Palette.brandInk, fontWeight: '700', fontSize: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', backgroundColor: Palette.surface, borderRadius: Radius.card, padding: 20, gap: 16 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: Palette.text, textAlign: 'center' },
  modalStars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  modalInput: { minHeight: 70, borderRadius: Radius.card - 6, borderWidth: 1, borderColor: Palette.line, padding: 12, fontSize: 14, color: Palette.text, textAlignVertical: 'top' },
  modalSubmit: { height: 48, borderRadius: Radius.card, backgroundColor: Palette.brand, alignItems: 'center', justifyContent: 'center' },
});
