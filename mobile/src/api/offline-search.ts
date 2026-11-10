import { cacheReadAll } from '@/api/offline-cache';
import type { Business, HomeFeed } from '@/api/types';

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export type SavedSearch = {
  q: string;
  categorySlug?: string;
  subcategorySlug?: string;
  topRated: boolean;
  withPromos: boolean;
};

/**
 * Búsqueda sin conexión: filtra los comercios que ya se descargaron en este dispositivo
 * (resultados de búsquedas, inicio, favoritos y fichas abiertas). No aplica "abierto ahora" ni
 * "más cercanos", que necesitan datos actualizados del servidor.
 */
export async function searchSavedBusinesses(params: SavedSearch): Promise<Business[]> {
  const [searches, homes, favorites, details] = await Promise.all([
    cacheReadAll<{ results: Business[] }>('/api/mobile/search'),
    cacheReadAll<HomeFeed>('/api/mobile/home'),
    cacheReadAll<{ favorites: Business[] }>('/api/mobile/favorites'),
    cacheReadAll<{ business?: Business }>('/api/mobile/business/'),
  ]);

  // Las fichas completas tienen más datos (productos, etc.): ganan sobre las versiones de las listas.
  const byId = new Map<string, Business>();
  for (const list of [
    ...searches.map((s) => s.results ?? []),
    ...homes.map((h) => h.featured ?? []),
    ...favorites.map((f) => f.favorites ?? []),
  ]) {
    for (const b of list) byId.set(b.id, b);
  }
  for (const d of details) if (d.business) byId.set(d.business.id, d.business);

  const tokens = normalize(params.q).split(/\s+/).filter(Boolean);

  return [...byId.values()]
    .filter((b) => {
      if (params.categorySlug && b.category?.slug !== params.categorySlug) return false;
      if (params.subcategorySlug && b.subcategory?.slug !== params.subcategorySlug) return false;
      if (params.topRated && !(b.ratingAvg >= 4)) return false;
      if (params.withPromos && !((b._count?.promotions ?? b.promotions?.length ?? 0) > 0)) return false;
      if (!tokens.length) return true;
      const haystack = normalize(
        [
          b.name,
          b.description,
          b.neighborhood,
          b.municipality,
          b.category?.name,
          b.subcategory?.name,
          ...(b.products ?? []).flatMap((p) => [p.name, p.description]),
        ]
          .filter(Boolean)
          .join(' '),
      );
      return tokens.every((t) => haystack.includes(t));
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.ratingAvg - a.ratingAvg);
}
