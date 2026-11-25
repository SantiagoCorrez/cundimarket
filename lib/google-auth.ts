import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  SocialAuthError,
  resolveSocialAccount,
  type SocialProfile,
  type SocialSignInResult,
  type SocialSignupInput,
} from "@/lib/social-auth";

/**
 * Inicio de sesión con Google (web y app).
 *
 * El cliente obtiene un "ID token" de Google y lo envía al servidor, que verifica su firma con las
 * llaves públicas de Google y que fue emitido para alguno de nuestros clientes OAuth.
 * Configuración: GOOGLE_CLIENT_IDS = IDs de cliente OAuth (web, iOS y Android) separados por comas.
 */
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export { SocialAuthError as GoogleAuthError };
export type GoogleSignupInput = SocialSignupInput;
export type GoogleSignInResult = SocialSignInResult;

export function googleClientIds() {
  return (process.env.GOOGLE_CLIENT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function googleAuthEnabled() {
  return googleClientIds().length > 0;
}

async function verifyGoogleIdToken(idToken: string): Promise<SocialProfile> {
  const audience = googleClientIds();
  if (!audience.length) throw new SocialAuthError("El inicio de sesión con Google no está configurado.");
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience,
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!payload.sub || !email || payload.email_verified !== true) {
      throw new SocialAuthError("Tu cuenta de Google no tiene un correo verificado.");
    }
    return {
      provider: "google",
      sub: payload.sub,
      email,
      name: typeof payload.name === "string" ? payload.name : null,
      picture: typeof payload.picture === "string" ? payload.picture : null,
    };
  } catch (error) {
    if (error instanceof SocialAuthError) throw error;
    throw new SocialAuthError("No pudimos verificar tu cuenta de Google. Inténtalo de nuevo.");
  }
}

/** Inicia sesión o crea la cuenta con un ID token de Google (ver resolveSocialAccount). */
export async function signInWithGoogle(idToken: string, signup?: SocialSignupInput): Promise<SocialSignInResult> {
  return resolveSocialAccount(await verifyGoogleIdToken(idToken), signup);
}
