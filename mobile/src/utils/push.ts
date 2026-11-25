import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { api } from '@/api/client';
import { notificationRoute } from '@/utils/notification-route';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let currentToken: string | null = null;

/**
 * Registra este dispositivo para recibir push del usuario con sesión. Con `ask` pide el permiso si
 * aún no se ha decidido; si no, solo registra cuando ya estaba concedido. Nunca lanza: sin push, los
 * avisos igual se ven dentro de la app.
 */
export async function registerForPush({ ask }: { ask: boolean }) {
  try {
    if (Platform.OS === 'android') {
      // En Android 13+ el permiso no se puede pedir sin un canal creado.
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Avisos',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && ask && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.post('/api/mobile/push-token', { token });
    currentToken = token;
  } catch {
    // Sin credenciales de push, sin red o en un emulador: no es un error para el usuario.
  }
}

/** Deja de enviar push a este dispositivo (al cerrar sesión). Espera poco para no demorar el cierre. */
export async function unregisterPush() {
  const token = currentToken;
  currentToken = null;
  if (!token) return;
  await Promise.race([
    api.delete('/api/mobile/push-token', { token }).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
}

/** Abre la pantalla del aviso cuando el usuario toca una notificación push. */
export function usePushNavigation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const open = (notification: Notifications.Notification) => {
      const route = notificationRoute(notification.request.content.data?.href);
      if (route) router.push(route);
    };
    const last = Notifications.getLastNotificationResponse();
    if (last) {
      Notifications.clearLastNotificationResponse();
      open(last.notification);
    }
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => sub.remove();
  }, [enabled]);
}
