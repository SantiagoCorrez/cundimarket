import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/api/client';
import { useReconnectTick } from '@/context/connectivity';

type Result<T> = { path: string; data: T | null; failed: boolean; version: string };

/**
 * Pide `path` a la API (con respaldo sin conexión) y lo vuelve a pedir cuando vuelve la conexión.
 * - `data` solo contiene datos de la ruta actual (nunca los de una ruta anterior).
 * - `failed` es true si no se pudo cargar y tampoco hay copia guardada.
 * - Pasa `null` para no pedir nada todavía.
 * - `cache: false` no guarda ni usa la copia sin conexión (para datos personales de otras personas).
 * - `refreshOnFocus` vuelve a pedir los datos al regresar a la pantalla (p. ej. tras editar o eliminar).
 */
export function useApiQuery<T>(path: string | null, options?: { refreshOnFocus?: boolean; cache?: boolean }) {
  const tick = useReconnectTick();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const version = `${tick}:${attempt}`;
  const cache = options?.cache !== false;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api
      .get<T>(path, { cache })
      .then((data) => !cancelled && setResult({ path, data, failed: false, version }))
      .catch(() => !cancelled && setResult((prev) => ({ path, data: prev?.path === path ? prev.data : null, failed: true, version })));
    return () => {
      cancelled = true;
    };
  }, [path, version, cache]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // Al volver a enfocar la pantalla (no en el primer enfoque, que ya carga arriba) se refrescan los datos.
  const firstFocus = useRef(true);
  const refresh = options?.refreshOnFocus === true;
  useFocusEffect(
    useCallback(() => {
      if (!refresh) return;
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [refresh, reload]),
  );

  const current = result && result.path === path ? result : null;
  return {
    data: current?.data ?? null,
    failed: !!current && current.failed && !current.data,
    loading: !!path && !(current && current.version === version),
    reload,
  };
}
