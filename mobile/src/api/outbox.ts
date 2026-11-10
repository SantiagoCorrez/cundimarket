import { ApiError, NetworkError, api } from '@/api/client';
import { connectivity } from '@/api/connectivity';
import { cacheStorage } from '@/utils/cache-storage';

/**
 * Cola de acciones hechas sin conexión (favoritos, guardar/aplicar a vacantes, calificaciones, reportes).
 * Se guardan en el dispositivo y se envían en orden cuando vuelve la conexión. Solo se encolan acciones
 * seguras de reenviar (el servidor ignora duplicados o las trata como "fijar estado").
 */
const KEY = 'cm:outbox';
const MAX_ATTEMPTS = 5;

type Job = { id: string; userId: string; path: string; body?: unknown; createdAt: number; attempts: number };

let jobs: Job[] | null = null;
let flushing = false;

async function load(): Promise<Job[]> {
  if (jobs) return jobs;
  try {
    const raw = await cacheStorage.getItem(KEY);
    jobs = raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    jobs = [];
  }
  return jobs;
}

async function save(userId: string) {
  const list = await load();
  try {
    await cacheStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // si no se puede persistir, la cola sigue en memoria mientras la app esté abierta
  }
  connectivity.setPending(list.filter((j) => j.userId === userId).length);
}

/** Cuántas acciones pendientes tiene este usuario (y actualiza el contador global). */
export async function refreshPending(userId: string | null): Promise<number> {
  const list = await load();
  const count = userId ? list.filter((j) => j.userId === userId).length : 0;
  connectivity.setPending(count);
  return count;
}

async function enqueue(userId: string, path: string, body?: unknown) {
  const list = await load();
  list.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, path, body, createdAt: Date.now(), attempts: 0 });
  await save(userId);
}

/**
 * Envía una acción; si no hay conexión la guarda para enviarla después.
 * Si ya hay acciones pendientes, la encola también para no alterar el orden.
 */
export async function sendOrQueue(userId: string, path: string, body?: unknown): Promise<{ queued: boolean }> {
  const list = await load();
  if (flushing || list.some((j) => j.userId === userId)) {
    await enqueue(userId, path, body);
    void flushOutbox(userId);
    return { queued: true };
  }
  try {
    await api.post(path, body);
    return { queued: false };
  } catch (e) {
    if (e instanceof NetworkError) {
      await enqueue(userId, path, body);
      return { queued: true };
    }
    throw e;
  }
}

/** Envía en orden las acciones pendientes del usuario. Se detiene al primer fallo de red. */
export async function flushOutbox(userId: string): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const list = await load();
    while (true) {
      const job = list.find((j) => j.userId === userId);
      if (!job) break;
      try {
        await api.post(job.path, job.body);
        list.splice(list.indexOf(job), 1);
      } catch (e) {
        if (e instanceof NetworkError) break;
        const status = e instanceof ApiError ? e.status : 0;
        // Rechazos definitivos (publicación borrada, datos inválidos…) se descartan; el resto se reintenta.
        const retryable = status === 401 || status === 408 || status === 429 || status >= 500;
        job.attempts += 1;
        if (!retryable || job.attempts >= MAX_ATTEMPTS) list.splice(list.indexOf(job), 1);
        else break;
      }
      await save(userId);
    }
    await save(userId);
  } finally {
    flushing = false;
  }
}

/** Descarta las acciones pendientes de un usuario (al cerrar sesión o eliminar la cuenta). */
export async function purgeOutbox(userId: string) {
  const list = await load();
  for (let i = list.length - 1; i >= 0; i--) if (list[i].userId === userId) list.splice(i, 1);
  await save(userId);
  connectivity.setPending(0);
}
