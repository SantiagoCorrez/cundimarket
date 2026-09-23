import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

export function Button({
  children,
  onPress,
  variant = 'solid',
  size = 'md',
  disabled,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        size === 'lg' && styles.buttonLg,
        variant === 'solid' && styles.buttonSolid,
        variant === 'outline' && styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}>
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.buttonText,
            variant === 'solid' && styles.buttonTextSolid,
            variant !== 'solid' && styles.buttonTextOutline,
          ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function Badge({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'danger' | 'neutral' }) {
  const bg = tone === 'brand' ? Palette.brand : tone === 'danger' ? Palette.danger : Palette.backgroundElement;
  const color = tone === 'neutral' ? Palette.text : '#fff';
  return (
    <View style={[styles.badge, { backgroundColor: tone === 'neutral' ? Palette.backgroundElement : bg }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <View style={styles.verifiedBadge}>
      <Ionicons name="checkmark-circle" size={small ? 14 : 16} color={Palette.info} />
      <Text style={[styles.verifiedText, small && { fontSize: 11 }]}>Verificado</Text>
    </View>
  );
}

export function Stars({ value, count, size = 15 }: { value: number; count?: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rounded ? 'star' : 'star-outline'}
          size={size}
          color={Palette.warn}
        />
      ))}
      {count !== undefined && (
        <Text style={styles.starsCount}>
          {value.toFixed(1)} ({count})
        </Text>
      )}
    </View>
  );
}

export function Logo({ name, uri, size = 56 }: { name: string; uri?: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (uri) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 3.2, overflow: 'hidden', backgroundColor: Palette.backgroundElement }}>
        <Image source={uri} style={{ width: size, height: size }} contentFit="cover" />
      </View>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3.2,
        backgroundColor: Palette.brand,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size / 2.6 }}>{initials}</Text>
    </View>
  );
}

export function EmptyState({ icon = '🔍', title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBack}>
        <Ionicons name="chevron-back" size={26} color={Palette.text} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.card,
    padding: 14,
    shadowColor: '#0f1419',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Palette.text },
  button: {
    height: 46,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  buttonLg: { height: 52 },
  buttonSolid: { backgroundColor: Palette.brand },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Palette.line },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonText: { fontSize: 15, fontWeight: '700' },
  buttonTextSolid: { color: '#fff' },
  buttonTextOutline: { color: Palette.text },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { color: Palette.info, fontSize: 12, fontWeight: '700' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starsCount: { marginLeft: 4, fontSize: 12, color: Palette.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Palette.text },
  emptySubtitle: { fontSize: 13, color: Palette.textSecondary, textAlign: 'center', marginTop: 4 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: Palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.line,
    gap: 4,
  },
  headerBack: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Palette.text, flex: 1 },
});
