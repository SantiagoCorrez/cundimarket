import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConnectivity } from '@/context/connectivity';

/**
 * Envuelve la app y muestra una franja arriba cuando no hay conexión (o cuando acaba de volver).
 * Mientras la franja está visible ocupa el área segura superior, así que a las pantallas se les
 * informa un inset superior de 0 para que no dupliquen ese espacio.
 */
export function ConnectivityFrame({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { online, pending, recovered } = useConnectivity();
  const showOffline = !online;
  const showBack = online && recovered;
  const visible = showOffline || showBack;

  const pendingText = pending > 0 ? ` · ${pending} ${pending === 1 ? 'cambio pendiente' : 'cambios pendientes'}` : '';

  return (
    <View style={{ flex: 1 }}>
      {visible && (
        <View
          accessibilityRole="alert"
          style={[styles.bar, showOffline ? styles.offline : styles.back, { paddingTop: insets.top + 6 }]}>
          <Ionicons
            name={showOffline ? 'cloud-offline-outline' : 'checkmark-circle-outline'}
            size={15}
            color={showOffline ? '#5a3d00' : '#0b4a26'}
          />
          <Text style={[styles.text, { color: showOffline ? '#5a3d00' : '#0b4a26' }]} numberOfLines={2}>
            {showOffline
              ? `Sin conexión · mostrando datos guardados${pendingText}`
              : pending > 0
                ? `Conexión restablecida · enviando ${pending} ${pending === 1 ? 'cambio' : 'cambios'}…`
                : 'Conexión restablecida'}
          </Text>
        </View>
      )}
      <SafeAreaInsetsContext.Provider value={visible ? { ...insets, top: 0 } : insets}>{children}</SafeAreaInsetsContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 7 },
  offline: { backgroundColor: '#ffe9a8' },
  back: { backgroundColor: '#c9f2d9' },
  text: { fontSize: 12.5, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
});
