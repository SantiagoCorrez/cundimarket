import type { Href } from 'expo-router';

/** Traduce la ruta web de un aviso a la pantalla equivalente de la app (null si no la hay). */
export function notificationRoute(href: unknown): Href | null {
  if (typeof href !== 'string') return null;
  const applicant = href.match(/^\/empleo\/([\w-]+)\/postulaciones\/([\w-]+)$/);
  if (applicant) {
    return { pathname: '/postulaciones/[jobId]/[applicationId]', params: { jobId: applicant[1], applicationId: applicant[2] } };
  }
  const job = href.match(/^\/empleo\/([\w-]+)\/postulaciones$/);
  if (job) return { pathname: '/postulaciones/[jobId]', params: { jobId: job[1] } };
  return null;
}
