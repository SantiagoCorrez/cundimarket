import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * Google Sign-In nativo (Android/iOS). Requiere:
 *  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: ID de cliente OAuth tipo "Web" (el token se emite para él).
 *  - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: ID de cliente OAuth tipo "iOS" (solo iOS; ver app.config.js).
 * Sin ellos el botón no se muestra.
 */
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const googleSignInAvailable = !!WEB_CLIENT_ID && (Platform.OS !== 'ios' || !!IOS_CLIENT_ID);

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
  configured = true;
}

export class GoogleSignInError extends Error {}

/** Abre el selector de cuentas de Google y devuelve el ID token, o null si el usuario canceló. */
export async function getGoogleIdToken(): Promise<string | null> {
  if (!googleSignInAvailable) throw new GoogleSignInError('El inicio de sesión con Google no está disponible.');
  ensureConfigured();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    const idToken = response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
    if (!idToken) throw new GoogleSignInError('Google no entregó los datos de tu cuenta. Inténtalo de nuevo.');
    return idToken;
  } catch (error) {
    if (error instanceof GoogleSignInError) throw error;
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.IN_PROGRESS) return null;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new GoogleSignInError('Tu dispositivo no tiene Google Play Services actualizado.');
      }
    }
    throw new GoogleSignInError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
  }
}

/** Cierra la sesión de Google en el dispositivo (para que la próxima vez pregunte la cuenta). */
export async function googleSignOut() {
  if (!configured) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // no-op
  }
}
