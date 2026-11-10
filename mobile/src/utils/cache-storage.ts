import Storage from 'expo-sqlite/kv-store';

/**
 * Almacenamiento persistente para la caché sin conexión y la cola de acciones pendientes.
 * En nativo usa SQLite (soporta respuestas grandes); en web ver cache-storage.web.ts.
 */
export const cacheStorage = {
  getItem: (key: string): Promise<string | null> => Storage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => Storage.setItem(key, value),
  removeItem: (key: string): Promise<void> => Storage.removeItem(key),
};
