import { SignJWT, createRemoteJWKSet, importPKCS8, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import {
  SocialAuthError,
  resolveSocialAccount,
  type SocialSignInResult,
  type SocialSignupInput,
} from "@/lib/social-auth";

/**
 * Iniciar sesión con Apple (app de iOS).
 *
 * - El "identity token" que entrega iOS se verifica con las llaves públicas de Apple; su audiencia es
 *   el bundle ID de la app (APPLE_CLIENT_IDS, por defecto co.cundimarket.app).
 * - Apple exige revocar el acceso al eliminar la cuenta. Para eso, al iniciar sesión se canjea el
 *   "authorization code" por un refresh token que se guarda en el usuario, y al eliminar la cuenta se
 *   revoca. Requiere una llave de "Sign in with Apple": APPLE_TEAM_ID, APPLE_KEY_ID y APPLE_PRIVATE_KEY
 *   (contenido del archivo .p8). Sin ella el inicio de sesión funciona, pero no se revoca.
 */
const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_JWKS = createRemoteJWKSet(new URL(`${APPLE_ISSUER}/auth/keys`));

function appleClientIds() {
  return (process.env.APPLE_CLIENT_IDS ?? "co.cundimarket.app")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Nombre que iOS entrega solo la primera vez que el usuario autoriza la app. */
export type AppleFullName = { givenName?: string | null; familyName?: string | null } | null | undefined;

async function verifyAppleIdentityToken(identityToken: string) {
  try {
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, { issuer: APPLE_ISSUER, audience: appleClientIds() });
    if (!payload.sub) throw new Error("sin sub");
    const verified = payload.email_verified === true || payload.email_verified === "true";
    const email = typeof payload.email === "string" && verified ? payload.email.trim().toLowerCase() : null;
    return { sub: payload.sub, email, aud: String(Array.isArray(payload.aud) ? payload.aud[0] : payload.aud) };
  } catch {
    throw new SocialAuthError("No pudimos verificar tu cuenta de Apple. Inténtalo de nuevo.");
  }
}

/** "client_secret" para la API REST de Apple: un JWT firmado con la llave .p8 (válido 5 minutos). */
async function appleClientSecret(clientId: string) {
  const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = process.env;
  if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) return null;
  const key = await importPKCS8(APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"), "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: APPLE_KEY_ID })
    .setIssuer(APPLE_TEAM_ID)
    .setSubject(clientId)
    .setAudience(APPLE_ISSUER)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

async function appleRequest(path: string, params: Record<string, string>) {
  return fetch(`${APPLE_ISSUER}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(10_000),
  });
}

/** Canjea el authorization code por un refresh token (para poder revocar después). Sin llave: null. */
async function exchangeAuthorizationCode(code: string, clientId: string) {
  const secret = await appleClientSecret(clientId);
  if (!secret) return null;
  try {
    const res = await appleRequest("/auth/token", {
      client_id: clientId,
      client_secret: secret,
      code,
      grant_type: "authorization_code",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { refresh_token?: string };
    return data.refresh_token ?? null;
  } catch {
    return null;
  }
}

/** Inicia sesión o crea la cuenta con Apple (ver resolveSocialAccount). */
export async function signInWithApple(
  input: { identityToken: string; authorizationCode?: string | null; fullName?: AppleFullName },
  signup?: SocialSignupInput,
): Promise<SocialSignInResult> {
  const token = await verifyAppleIdentityToken(input.identityToken);
  const name = [input.fullName?.givenName, input.fullName?.familyName].filter(Boolean).join(" ") || null;

  const result = await resolveSocialAccount({ provider: "apple", sub: token.sub, email: token.email, name, picture: null }, signup);

  if (result.status === "ok" && input.authorizationCode) {
    const refreshToken = await exchangeAuthorizationCode(input.authorizationCode, token.aud);
    if (refreshToken) {
      await prisma.user.update({ where: { id: result.userId }, data: { appleRefreshToken: refreshToken } });
    }
  }
  return result;
}

/** Revoca el acceso de la app en la cuenta de Apple del usuario (al eliminar la cuenta). Nunca lanza. */
export async function revokeAppleAccess(refreshToken: string) {
  const clientId = appleClientIds()[0];
  const secret = await appleClientSecret(clientId).catch(() => null);
  if (!secret) return;
  try {
    await appleRequest("/auth/revoke", {
      client_id: clientId,
      client_secret: secret,
      token: refreshToken,
      token_type_hint: "refresh_token",
    });
  } catch {
    // Si Apple no responde, la cuenta se elimina igual en CundiMarket.
  }
}
