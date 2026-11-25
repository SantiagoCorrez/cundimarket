/** En la vista web de Expo no hay Google Sign-In nativo: el botón no se muestra. */
export const googleSignInAvailable = false;

export class GoogleSignInError extends Error {}

export async function getGoogleIdToken(): Promise<string | null> {
  throw new GoogleSignInError('El inicio de sesión con Google solo está disponible en la app.');
}

export async function googleSignOut() {}
