import { connectivity } from '@/api/connectivity';
import { cacheRead, cacheWriteText } from '@/api/offline-cache';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://cundimarket.online';

const REQUEST_TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** No se pudo llegar al servidor (sin internet, tiempo agotado o servidor caído). */
export class NetworkError extends ApiError {
  constructor(message = 'Sin conexión a internet. Revisa tu red e inténtalo de nuevo.') {
    super(message, 0);
  }
}

let authToken: string | null = null;

/** Actualiza el token en memoria que usa cada request (ver AuthProvider). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

export function hasAuthToken() {
  return authToken !== null;
}

async function requestRaw(path: string, init?: RequestInit): Promise<{ data: unknown; text: string }> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let res: Response;
    let text: string;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, signal: controller.signal });
      text = await res.text();
    } catch {
      connectivity.reportRequest(false);
      throw new NetworkError();
    }

    // 502/503/504: el proxy responde pero la aplicación no (servidor caído o reiniciando).
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      connectivity.reportRequest(false);
      throw new NetworkError('El servidor no responde. Inténtalo de nuevo en un momento.');
    }

    let data: unknown = {};
    let parsed = true;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      parsed = false;
    }
    if (res.ok && !parsed) {
      // 200 con algo que no es JSON: típico de portales cautivos o proxies; se trata como sin conexión.
      connectivity.reportRequest(false);
      throw new NetworkError();
    }

    connectivity.reportRequest(true);
    if (!res.ok) {
      const message = (data as { error?: string } | null)?.error;
      throw new ApiError(message || 'Algo salió mal. Intenta de nuevo.', res.status);
    }
    return { data, text };
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return (await requestRaw(path, init)).data as T;
}

/**
 * GET con respaldo sin conexión: cada respuesta exitosa se guarda en el dispositivo y, si luego
 * no hay conexión, se devuelve la última copia guardada. Con `cache: false` no se guarda ni se usa.
 */
async function cachedGet<T>(path: string, options?: { cache?: boolean }): Promise<T> {
  if (options?.cache === false) return request<T>(path);
  try {
    const { data, text } = await requestRaw(path);
    void cacheWriteText(path, text);
    return data as T;
  } catch (e) {
    if (e instanceof NetworkError) {
      const hit = await cacheRead<T>(path);
      if (hit) return hit.data;
    }
    throw e;
  }
}

export const api = {
  get: cachedGet,
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
