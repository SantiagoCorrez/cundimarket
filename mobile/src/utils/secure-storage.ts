import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * expo-secure-store solo tiene implementación nativa (Keychain/Keystore).
 * En web (soportado por Expo Router para esta misma app) usamos localStorage.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // almacenamiento no disponible (modo privado, etc.)
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // no-op
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
