import * as Network from 'expo-network';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';

import { API_BASE_URL } from '@/api/client';
import { connectivity, type ConnectivitySnapshot } from '@/api/connectivity';
import { flushOutbox, refreshPending } from '@/api/outbox';
import { prefetchEssentials } from '@/api/prefetch';
import { useAuth } from '@/context/auth';

const PING_INTERVAL_MS = 15_000;
const RETRY_PENDING_MS = 60_000;

/** Consulta el servidor con una petición mínima; si responde, la app vuelve a estar "en línea". */
async function pingServer() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE_URL}/api/mobile/health`, { signal: controller.signal });
    connectivity.reportRequest(res.ok);
  } catch {
    connectivity.reportRequest(false);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Mantiene el estado de conexión: escucha la red del dispositivo, comprueba el servidor mientras
 * está caído, reenvía las acciones pendientes al volver y descarga lo esencial para uso sin conexión.
 */
export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const { user, municipality } = useAuth();
  const userId = user?.id ?? null;
  const snapshot = useConnectivity();

  // Red del dispositivo
  useEffect(() => {
    let active = true;
    const apply = (s: Network.NetworkState) => {
      if (!active) return;
      const online = s.isConnected !== false && s.isInternetReachable !== false;
      connectivity.setDeviceOnline(online);
      // Al volver la red del dispositivo, confirma que el servidor también responde.
      if (online) void pingServer();
    };
    Network.getNetworkStateAsync().then(apply, () => undefined);
    const sub = Network.addNetworkStateListener(apply);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  // Mientras el servidor no responda, vuelve a comprobarlo cada pocos segundos.
  useEffect(() => {
    if (snapshot.online || !snapshot.deviceOnline) return;
    const id = setInterval(() => void pingServer(), PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [snapshot.online, snapshot.deviceOnline]);

  // Al recuperar la conexión: enviar lo pendiente y refrescar lo esencial.
  useEffect(() => {
    return connectivity.onRecover(() => {
      if (userId) void flushOutbox(userId);
      void prefetchEssentials(userId, municipality);
    });
  }, [userId, municipality]);

  // Al iniciar, cambiar de usuario o de municipio: contar pendientes, enviarlos y precargar.
  useEffect(() => {
    void (async () => {
      await refreshPending(userId);
      if (!connectivity.getSnapshot().online) return;
      if (userId) await flushOutbox(userId);
      void prefetchEssentials(userId, municipality);
    })();
  }, [userId, municipality]);

  // Reintenta periódicamente si quedaron acciones pendientes que fallaron por un error del servidor.
  useEffect(() => {
    if (!userId || snapshot.pending === 0 || !snapshot.online) return;
    const id = setInterval(() => void flushOutbox(userId), RETRY_PENDING_MS);
    return () => clearInterval(id);
  }, [userId, snapshot.pending, snapshot.online]);

  return <>{children}</>;
}

/** Estado de conexión reactivo. */
export function useConnectivity(): ConnectivitySnapshot {
  return useSyncExternalStore(connectivity.subscribe, connectivity.getSnapshot, connectivity.getSnapshot);
}

/** Número que cambia cada vez que vuelve la conexión; úsalo como dependencia para volver a pedir datos. */
export function useReconnectTick(): number {
  return useConnectivity().tick;
}
