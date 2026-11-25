/** En la vista web de Expo no existe "Iniciar sesión con Apple" nativo: el botón no se muestra. */
export type AppleCredentials = {
  identityToken: string;
  authorizationCode: string | null;
  fullName: { givenName: string | null; familyName: string | null } | null;
};

export class AppleSignInError extends Error {}

export async function appleSignInAvailable() {
  return false;
}

export async function getAppleCredentials(): Promise<AppleCredentials | null> {
  throw new AppleSignInError('Iniciar sesión con Apple solo está disponible en la app de iOS.');
}

export const AppleAuthentication = null;
