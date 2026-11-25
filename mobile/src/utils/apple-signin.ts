import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

/** Datos que se envían al servidor para iniciar sesión con Apple. */
export type AppleCredentials = {
  identityToken: string;
  authorizationCode: string | null;
  /** iOS solo entrega el nombre la primera vez que el usuario autoriza la app. */
  fullName: { givenName: string | null; familyName: string | null } | null;
};

export class AppleSignInError extends Error {}

/** "Iniciar sesión con Apple" solo existe en iOS (y debe estar disponible en el dispositivo). */
export async function appleSignInAvailable() {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Muestra la hoja de Apple y devuelve las credenciales, o null si el usuario canceló. */
export async function getAppleCredentials(): Promise<AppleCredentials | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new AppleSignInError('Apple no entregó los datos de tu cuenta. Inténtalo de nuevo.');
    return {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      fullName: credential.fullName
        ? { givenName: credential.fullName.givenName, familyName: credential.fullName.familyName }
        : null,
    };
  } catch (error) {
    if ((error as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
    if (error instanceof AppleSignInError) throw error;
    throw new AppleSignInError('No se pudo iniciar sesión con Apple. Inténtalo de nuevo.');
  }
}

export { AppleAuthentication };
