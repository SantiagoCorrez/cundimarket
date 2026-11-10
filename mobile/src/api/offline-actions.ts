import { cachePatch } from '@/api/offline-cache';
import { sendOrQueue } from '@/api/outbox';
import type { Business, Job, Rating } from '@/api/types';

/**
 * Acciones del usuario que funcionan con o sin conexión. Cada una se envía al servidor si hay red
 * y, si no, queda en la cola (ver outbox.ts) y se refleja de inmediato en la copia guardada.
 * Devuelven `queued: true` cuando quedó pendiente de enviar.
 */

type BusinessDetail = { business: Business; favorited: boolean; openNow: boolean | null };
type JobDetail = { job: Job; saved: boolean; applied: boolean };

export async function setFavorite(userId: string, business: Business, favorited: boolean) {
  const result = await sendOrQueue(userId, `/api/mobile/business/${business.id}/favorite`, { favorited });

  await cachePatch<BusinessDetail>(`/api/mobile/business/${business.id}`, (d) => ({ ...d, favorited }));
  await cachePatch<{ favorites: Business[] }>('/api/mobile/favorites', (d) => ({
    favorites: favorited
      ? d.favorites.some((f) => f.id === business.id)
        ? d.favorites
        : [business, ...d.favorites]
      : d.favorites.filter((f) => f.id !== business.id),
  }));
  return result;
}

export async function rateBusiness(userId: string, userName: string, businessId: string, stars: number, comment: string) {
  const result = await sendOrQueue(userId, `/api/mobile/business/${businessId}/rate`, { stars, comment });

  const pending: Rating = {
    id: `local-${Date.now()}`,
    stars,
    comment: comment.trim() || null,
    createdAt: new Date().toISOString(),
    user: { name: userName },
  };
  await cachePatch<BusinessDetail>(`/api/mobile/business/${businessId}`, (d) => ({
    ...d,
    business: { ...d.business, ratings: [pending, ...d.business.ratings].slice(0, 8) },
  }));
  return result;
}

export async function setJobState(userId: string, jobId: string, state: { saved: boolean; applied: boolean }) {
  const result = await sendOrQueue(userId, `/api/mobile/empleo/${jobId}/save`, state);
  await cachePatch<JobDetail>(`/api/mobile/empleo/${jobId}`, (d) => ({ ...d, saved: state.saved, applied: state.applied }));
  return result;
}

export function reportContent(userId: string, body: { targetType: string; targetId: string; reason: string; detail: string }) {
  return sendOrQueue(userId, '/api/mobile/report', body);
}
