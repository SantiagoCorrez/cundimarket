import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Stars, VerifiedBadge } from '@/components/ui';
import { Palette, Radius } from '@/constants/theme';
import type { Business, Category, Job, News, Promotion, Property, ServiceProvider } from '@/api/types';
import { NEWS_TYPES, OFFER_TYPES } from '@/constants/taxonomy';
import { formatCOP, formatDistance, timeAgo } from '@/utils/format';

export function CategoryChip({ category }: { category: Category }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/comercios', params: { category: category.slug } })}
      style={styles.categoryChip}>
      <Text style={styles.categoryChipIcon}>{category.icon}</Text>
      <Text style={styles.categoryChipLabel} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

export function BusinessFeaturedCard({ b }: { b: Business }) {
  return (
    <Pressable onPress={() => router.push(`/business/${b.id}`)} style={{ width: 168 }}>
      <Card style={styles.featuredCard}>
        <View style={styles.featuredThumb}>
          {b.logoUrl ? (
            <Image source={b.logoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ fontSize: 32 }}>{b.category.icon}</Text>
          )}
        </View>
        <Text style={styles.featuredName} numberOfLines={1}>
          {b.name}
        </Text>
        <Text style={styles.featuredCategory} numberOfLines={1}>
          {b.category.icon} {b.category.name}
        </Text>
        <Stars value={b.ratingAvg} count={b.ratingCount} size={12} />
      </Card>
    </Pressable>
  );
}

export function BusinessCard({ b }: { b: Business }) {
  return (
    <Pressable onPress={() => router.push(`/business/${b.id}`)}>
      <Card style={styles.listCard}>
        <View style={styles.listThumb}>
          {b.logoUrl ? (
            <Image source={b.logoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ fontSize: 26 }}>{b.category.icon}</Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.rowGap}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {b.name}
            </Text>
            {b.status === 'VERIFIED' && <VerifiedBadge small />}
          </View>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {b.category.icon} {b.category.name}
            {b.subcategory ? ` · ${b.subcategory.name}` : ''}
            {b.neighborhood ? ` · ${b.neighborhood}` : ''}
          </Text>
          <Stars value={b.ratingAvg} count={b.ratingCount} size={13} />
          {(b.openNow != null || b.distanceKm != null) && (
            <View style={styles.metaRow}>
              {b.openNow != null && (
                <Text style={[styles.metaText, { color: b.openNow ? Palette.success : Palette.inkFaint }]}>
                  {b.openNow ? '● Abierto ahora' : '● Cerrado'}
                </Text>
              )}
              {b.distanceKm != null && <Text style={styles.metaText}>{formatDistance(b.distanceKm)}</Text>}
            </View>
          )}
        </View>
        {(b._count?.promotions ?? 0) > 0 && (
          <View style={styles.promoDot}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export function PromoCard({ p }: { p: Promotion }) {
  return (
    <Pressable onPress={() => p.business && router.push(`/business/${p.business.id}`)} style={{ width: 220 }}>
      <Card style={styles.promoCard}>
        <View style={styles.promoBadge}>
          <Text style={styles.promoBadgeText}>{p.discount ? `-${p.discount}%` : '🔥 Promo'}</Text>
        </View>
        <Text style={[styles.featuredName, { color: '#fff' }]} numberOfLines={1}>
          {p.title}
        </Text>
        <Text style={[styles.listSubtitle, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
          {p.business?.name}
        </Text>
      </Card>
    </Pressable>
  );
}

export function NewsCard({ n, compact }: { n: News; compact?: boolean }) {
  const t = NEWS_TYPES[n.type] ?? NEWS_TYPES.NEWS;
  return (
    <Pressable onPress={() => router.push(`/news/${n.id}`)}>
      <Card style={styles.newsCard}>
        <View style={styles.newsIcon}>
          {n.imageUrl ? (
            <Image source={n.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ fontSize: 22 }}>{t.icon}</Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.listTitle} numberOfLines={compact ? 1 : 2}>
            {n.title}
          </Text>
          <Text style={styles.listSubtitle}>
            {t.label} · {timeAgo(n.publishedAt)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function PropertyCard({ p }: { p: Property }) {
  const offer = OFFER_TYPES.find((o) => o.key === p.offerType);
  return (
    <Pressable onPress={() => router.push(`/espacios/${p.id}`)}>
      <Card style={styles.listCard}>
        <View style={styles.listThumb}>
          {p.photos[0] ? (
            <Image source={p.photos[0].url} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {p.propertyType} · {offer?.label}
          </Text>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {p.neighborhood ? `${p.neighborhood}, ` : ''}
            {p.municipality}
          </Text>
          <Text style={styles.priceText}>
            {formatCOP(p.price)}
            {p.offerType === 'RENT' && p.price ? ' /mes' : ''}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function ServiceCard({ s }: { s: ServiceProvider }) {
  return (
    <Pressable onPress={() => router.push(`/servicios/${s.id}`)}>
      <Card style={styles.listCard}>
        <View style={styles.listThumb}>
          {s.photoUrl ? (
            <Image source={s.photoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ fontSize: 24 }}>🛠️</Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.rowGap}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {s.providerName}
            </Text>
            {s.verified && <VerifiedBadge small />}
          </View>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {s.serviceType}
          </Text>
          <Stars value={s.ratingAvg} count={s.ratingCount} size={13} />
        </View>
      </Card>
    </Pressable>
  );
}

export function JobCard({ j }: { j: Job }) {
  return (
    <Pressable onPress={() => router.push(`/empleo/${j.id}`)}>
      <Card style={styles.listCard}>
        <View style={styles.listThumb}>
          <Text style={{ fontSize: 24 }}>💼</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {j.title}
          </Text>
          <Text style={styles.listSubtitle} numberOfLines={1}>
            {j.companyName} · {j.contractType}
          </Text>
          <Text style={styles.priceText}>{formatCOP(j.salary)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: Radius.card,
    backgroundColor: Palette.surface,
    gap: 4,
  },
  categoryChipIcon: { fontSize: 24 },
  categoryChipLabel: { fontSize: 11, fontWeight: '600', color: Palette.text, textAlign: 'center' },
  featuredCard: { padding: 10, gap: 4 },
  featuredThumb: {
    height: 90,
    borderRadius: Radius.card - 6,
    backgroundColor: Palette.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  featuredName: { fontSize: 14, fontWeight: '700', color: Palette.text, marginTop: 4 },
  featuredCategory: { fontSize: 12, color: Palette.textSecondary },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listThumb: {
    height: 56,
    width: 56,
    borderRadius: Radius.card - 8,
    backgroundColor: Palette.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 },
  metaText: { fontSize: 12, fontWeight: '600', color: Palette.textSecondary },
  listTitle: { fontSize: 15, fontWeight: '700', color: Palette.text },
  listSubtitle: { fontSize: 12.5, color: Palette.textSecondary, marginTop: 2, marginBottom: 3 },
  priceText: { fontSize: 14, fontWeight: '800', color: Palette.text },
  promoDot: { alignItems: 'center', justifyContent: 'center' },
  promoCard: { gap: 4, backgroundColor: Palette.brandInk, minHeight: 88 },
  promoBadge: { alignSelf: 'flex-start', backgroundColor: Palette.brand, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  promoBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  newsCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  newsIcon: {
    height: 48,
    width: 48,
    borderRadius: Radius.card - 8,
    backgroundColor: Palette.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
