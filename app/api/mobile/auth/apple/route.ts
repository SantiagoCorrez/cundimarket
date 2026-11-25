import { signAuthToken } from "@/lib/auth";
import { json, apiError } from "@/lib/api";
import { signInWithApple } from "@/lib/apple-auth";
import { SocialAuthError } from "@/lib/social-auth";

/**
 * Iniciar sesión / registrarse con Apple desde la app de iOS.
 * Cuerpo: { identityToken, authorizationCode?, fullName?, role?, municipality?, acceptTerms? }.
 * Respuestas: { token, user } · { needsSignup: true, email, name } (cuenta nueva sin aceptar términos).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const identityToken = String(body?.identityToken || "");
  if (!identityToken) return apiError("Falta el token de Apple.");

  try {
    const result = await signInWithApple(
      {
        identityToken,
        authorizationCode: typeof body?.authorizationCode === "string" ? body.authorizationCode : null,
        fullName: body?.fullName,
      },
      { role: body?.role, municipality: body?.municipality, acceptTerms: body?.acceptTerms === true },
    );
    if (result.status === "needsSignup") {
      return json({ needsSignup: true, email: result.email, name: result.name });
    }
    const token = await signAuthToken(result.user);
    return json({ token, user: { ...result.user, hasPassword: result.hasPassword }, created: result.created });
  } catch (error) {
    if (error instanceof SocialAuthError) return apiError(error.message, 401);
    throw error;
  }
}
