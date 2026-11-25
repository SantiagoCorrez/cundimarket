import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { AppNotification } from '@/api/types';
import { LoadError } from '@/components/load-error';
import { Button, Card, EmptyState, ScreenHeader } from '@/components/ui';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useApiQuery } from '@/hooks/use-api-query';
import { timeAgo } from '@/utils/format';
import { notificationRoute } from '@/utils/notification-route';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, failed, reload } = useApiQuery<{ notifications: AppNotification[]; unread: number }>(
    user ? '/api/mobile/notifications' : null,
    { refreshOnFocus: true, cache: false },
  );
  const unread = data?.unread ?? 0;

  // Al ver la lista se marcan como leídas (el resaltado se mantiene hasta volver a entrar).
  useEffect(() => {
    if (unread > 0) api.post('/api/mobile/notifications').catch(() => undefined);
  }, [unread]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Notificaciones" />
      {!user ? (
        <View style={{ padding: 24, gap: 16 }}>
          <EmptyState icon="🔔" title="Inicia sesión" subtitle="Así podrás ver tus notificaciones." />
          <Button onPress={() => router.push('/login')}>Iniciar sesión</Button>
        </View>
      ) : !data ? (
        failed ? (
          <LoadError onRetry={reload} what="tus notificaciones" />
        ) : (
          <ActivityIndicator style={{ marginTop: 24 }} color={Palette.brand} />
        )
      ) : (
        <FlatList
          data={data.notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <EmptyState icon="🔔" title="Sin notificaciones" subtitle="Aquí verás, por ejemplo, cuando alguien se postule a tus vacantes." />
          }
          renderItem={({ item }) => {
            const route = notificationRoute(item.href);
            return (
              <Pressable onPress={() => route && router.push(route)} accessibilityRole="button">
                <Card style={[styles.row, !item.readAt && styles.unread]}>
                  <Text style={{ fontSize: 22 }}>{item.type === 'JOB_APPLICATION' ? '💼' : '🔔'}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                  </View>
                  {!item.readAt && <View style={styles.dot} />}
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  unread: { borderWidth: 1, borderColor: Palette.brand, backgroundColor: 'rgba(30,144,255,0.06)' },
  title: { fontSize: 14.5, fontWeight: '700', color: Palette.text },
  body: { fontSize: 13.5, color: Palette.textSecondary, lineHeight: 19 },
  time: { fontSize: 11.5, color: Palette.inkFaint },
  dot: { height: 9, width: 9, borderRadius: 5, backgroundColor: Palette.brandStrong, marginTop: 5 },
});
