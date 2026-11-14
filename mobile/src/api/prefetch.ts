import { api } from '@/api/client';
import type { Business } from '@/api/types';
import { cacheStorage } from '@/utils/cache-storage';

const STAMP_KEY = 'cm:prefetch';
const REFRESH_AFTER_MS = 3 * 60 * 60 * 1000;
const MAX_FAVORITE_DETAILS = 10;

/**
 * Descarga con conexión lo esencial para poder usar la app después sin ella:
 * inicio, categorías, noticias, canales de emergencia y, si hay sesión, favoritos con su detalle.
 * Corre en segundo plano, como máximo una vez cada 3 horas, y ignora los errores.
 */
export async function prefetchEssentials(userId: string | null, municipality: string, force = false): Promise<void> {
  try {
    const last = Number((await cacheStorage.getItem(`${STAMP_KEY}:${userId ?? 'anon'}:${municipality}`)) ?? 0);
    if (!force && Date.now() - last < REFRESH_AFTER_MS) return;
  } catch {
    // sin marca previa: continúa
  }

  const quiet = <T>(p: Promise<T>) => p.catch(() => null);
  const m = encodeURIComponent(municipality);
  const [home, categories, news, emergency] = await Promise.all([
    quiet(api.get(`/api/mobile/home?municipality=${m}`)),
    quiet(api.get('/api/mobile/categories')),
    quiet(api.get(`/api/mobile/news?municipality=${m}`)),
    quiet(api.get(`/api/mobile/emergency?municipality=${m}`)),
  ]);
  // Si no se pudo descargar nada (sin conexión real), no se marca para reintentar pronto.
  if (!home && !categories && !news && !emergency) return;

  if (userId) {
    const fav = await quiet(api.get<{ favorites: Business[] }>('/api/mobile/favorites'));
    for (const b of fav?.favorites.slice(0, MAX_FAVORITE_DETAILS) ?? []) {
      await quiet(api.get(`/api/mobile/business/${b.id}`));
    }
  }

  try {
    await cacheStorage.setItem(`${STAMP_KEY}:${userId ?? 'anon'}:${municipality}`, String(Date.now()));
  } catch {
    // no-op
  }
}
