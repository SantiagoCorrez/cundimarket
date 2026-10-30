import * as WebBrowser from 'expo-web-browser';

import { API_BASE_URL } from '@/api/client';

/** Políticas publicadas en la web (se abren en el navegador integrado). */
export type LegalPath = '/politicas' | '/terminos' | '/privacidad' | '/cookies' | '/contenido';

export function openLegal(path: LegalPath) {
  return WebBrowser.openBrowserAsync(`${API_BASE_URL}${path}`);
}
