import { cacheStorage } from '@/utils/cache-storage';

/**
 * Caché persistente de las respuestas GET de la API, para usar la app sin conexión.
 *
 * - Cada respuesta se guarda por usuario ("scope"), porque algunas dependen de la sesión
 *   (favoritos, si guardaste una vacante…). Al cerrar sesión se borra la caché de ese usuario.
 * - Registro: primera línea = fecha (ms), el resto = el JSON tal como llegó del servidor.
 * - Hay un tope de entradas y de tamaño; al excederlo se descartan las más antiguas.
 */
const PREFIX = 'cm:c:';
const INDEX_KEY = 'cm:idx';
const MAX_ENTRIES = 250;
const MAX_CHARS = 40_000_000;

type Index = Record<string, { at: number; size: number }>;

/** Endpoints iguales para todos los usuarios: si no hay copia propia, sirve la de visitante. */
const PUBLIC_PATH = /^\/api\/mobile\/(categories|emergency|news|search|espacios|servicios|empleo)(\?.*)?$|^\/api\/mobile\/(news|espacios|servicios)\/[^/?]+$/;

let scope = 'anon';
let index: Index | null = null;
let chain: Promise<unknown> = Promise.resolve();

/** Ejecuta las operaciones de escritura una a una para no corromper el índice. */
function serial<T>(task: () => Promise<T>): Promise<T> {
  const next = chain.then(task, task);
  chain = next.catch(() => undefined);
  return next;
}

export function setCacheScope(userId: string | null) {
  scope = userId ?? 'anon';
}

const keyFor = (path: string, sc: string = scope) => `${PREFIX}${sc}:${path}`;

async function loadIndex(): Promise<Index> {
  if (index) return index;
  try {
    const raw = await cacheStorage.getItem(INDEX_KEY);
    index = raw ? (JSON.parse(raw) as Index) : {};
  } catch {
    index = {};
  }
  return index;
}

async function saveIndex() {
  if (index) await cacheStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function encode(at: number, text: string) {
  return `${at}\n${text}`;
}

function decode<T>(raw: string): { at: number; data: T } | null {
  const cut = raw.indexOf('\n');
  if (cut < 1) return null;
  try {
    return { at: Number(raw.slice(0, cut)), data: JSON.parse(raw.slice(cut + 1)) as T };
  } catch {
    return null;
  }
}

async function evict(idx: Index) {
  const keys = Object.keys(idx);
  let total = keys.reduce((sum, k) => sum + idx[k].size, 0);
  if (keys.length <= MAX_ENTRIES && total <= MAX_CHARS) return;
  const oldestFirst = keys.sort((a, b) => idx[a].at - idx[b].at);
  for (const k of oldestFirst) {
    if (Object.keys(idx).length <= MAX_ENTRIES * 0.9 && total <= MAX_CHARS * 0.9) break;
    total -= idx[k].size;
    delete idx[k];
    await cacheStorage.removeItem(k);
  }
}

/** Guarda el JSON (texto) de una respuesta. */
export function cacheWriteText(path: string, text: string): Promise<void> {
  return serial(async () => {
    try {
      const idx = await loadIndex();
      const key = keyFor(path);
      const at = Date.now();
      const record = encode(at, text);
      await cacheStorage.setItem(key, record);
      idx[key] = { at, size: record.length };
      await evict(idx);
      await saveIndex();
    } catch {
      // la caché es opcional: si falla (disco lleno, etc.) la app sigue funcionando
    }
  });
}

/** Lee una respuesta guardada. En endpoints públicos cae a la copia de visitante si falta la del usuario. */
export async function cacheRead<T>(path: string): Promise<{ at: number; data: T } | null> {
  try {
    let raw = await cacheStorage.getItem(keyFor(path));
    if (!raw && scope !== 'anon' && PUBLIC_PATH.test(path)) raw = await cacheStorage.getItem(keyFor(path, 'anon'));
    return raw ? decode<T>(raw) : null;
  } catch {
    return null;
  }
}

/** Modifica una respuesta ya guardada (p. ej. reflejar un favorito hecho sin conexión). No cambia su fecha. */
export function cachePatch<T>(path: string, update: (data: T) => T): Promise<void> {
  return serial(async () => {
    try {
      const idx = await loadIndex();
      const key = keyFor(path);
      const raw = await cacheStorage.getItem(key);
      const hit = raw ? decode<T>(raw) : null;
      if (!hit) return;
      const record = encode(hit.at, JSON.stringify(update(hit.data)));
      await cacheStorage.setItem(key, record);
      idx[key] = { at: idx[key]?.at ?? hit.at, size: record.length };
      await saveIndex();
    } catch {
      // no-op
    }
  });
}

/** Borra la copia guardada de una ruta (p. ej. tras eliminar esa publicación). */
export function cacheRemove(path: string): Promise<void> {
  return serial(async () => {
    try {
      const idx = await loadIndex();
      for (const sc of new Set([scope, 'anon'])) {
        const key = keyFor(path, sc);
        await cacheStorage.removeItem(key);
        delete idx[key];
      }
      await saveIndex();
    } catch {
      // no-op
    }
  });
}

/** Devuelve todas las respuestas guardadas (del usuario actual) cuya ruta empieza por `pathPrefix`. */
export async function cacheReadAll<T>(pathPrefix: string): Promise<T[]> {
  const idx = await loadIndex();
  const wanted = [`${PREFIX}${scope}:${pathPrefix}`, ...(scope !== 'anon' ? [`${PREFIX}anon:${pathPrefix}`] : [])];
  const out: T[] = [];
  for (const key of Object.keys(idx)) {
    if (!wanted.some((w) => key.startsWith(w))) continue;
    try {
      const raw = await cacheStorage.getItem(key);
      const hit = raw ? decode<T>(raw) : null;
      if (hit) out.push(hit.data);
    } catch {
      // ignora entradas ilegibles
    }
  }
  return out;
}

/** Borra la caché de un usuario (al cerrar sesión o eliminar la cuenta). */
export function cachePurgeScope(userId: string): Promise<void> {
  return serial(async () => {
    try {
      const idx = await loadIndex();
      const prefix = `${PREFIX}${userId}:`;
      for (const key of Object.keys(idx)) {
        if (!key.startsWith(prefix)) continue;
        delete idx[key];
        await cacheStorage.removeItem(key);
      }
      await saveIndex();
    } catch {
      // no-op
    }
  });
}
