import { signAuthToken } from "@/lib/auth";
import { json, apiError } from "@/lib/api";
import { GoogleAuthError, googleAuthEnabled, signInWithGoogle } from "@/lib/google-auth";

/**
 * Inicio de sesión / registro con Google desde la app.
 * Cuerpo: { idToken, role?, municipality?, acceptTerms? }.
 * Respuestas: { token, user } · { needsSignup: true, email, name } (cuenta nueva sin aceptar términos).
 */
export async function POST(req: Request) {
  if (!googleAuthEnabled()) return apiError("El inicio de sesión con Google no está disponible.", 503);

  const body = await req.json().catch(() => null);
  const idToken = String(body?.idToken || "");
  if (!idToken) return apiError("Falta el token de Google.");

  try {
    const result = await signInWithGoogle(idToken, {
      role: body?.role,
      municipality: body?.municipality,
      acceptTerms: body?.acceptTerms === true,
    });
    if (result.status === "needsSignup") {
      return json({ needsSignup: true, email: result.email, name: result.name });
    }
    const token = await signAuthToken(result.user);
    return json({ token, user: { ...result.user, hasPassword: result.hasPassword }, created: result.created });
  } catch (error) {
    if (error instanceof GoogleAuthError) return apiError(error.message, 401);
    throw error;
  }
}
