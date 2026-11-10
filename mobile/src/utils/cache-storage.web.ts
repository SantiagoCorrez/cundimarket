/**
 * Versión web de la caché local (solo para la vista previa web de Expo): localStorage.
 * expo-sqlite en web es alfa y exige configuración extra, así que no se usa aquí.
 */
export const cacheStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // cuota llena o almacenamiento no disponible
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // no-op
    }
  },
};
