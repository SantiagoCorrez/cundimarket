import { prisma } from "@/lib/prisma";
import type { Role, SessionUser } from "@/lib/auth";
import { normalizeMunicipality } from "@/lib/taxonomy";

/** Mensaje para quien intenta entrar con contraseña a una cuenta creada con Google o Apple. */
export function noPasswordMessage(user: { appleId?: string | null; googleId?: string | null }) {
  if (user.appleId && !user.googleId) return "Esta cuenta se creó con Apple. Usa «Continuar con Apple».";
  if (user.googleId && !user.appleId) return "Esta cuenta se creó con Google. Usa «Continuar con Google».";
  return "Esta cuenta no tiene contraseña: entra con Google o Apple.";
}

/** Error de inicio de sesión con un proveedor externo (Google, Apple); el mensaje se muestra al usuario. */
export class SocialAuthError extends Error {}

/** Perfil verificado que entrega el proveedor. `email` puede faltar (Apple solo lo da la primera vez). */
export type SocialProfile = {
  provider: "google" | "apple";
  sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

/** Datos para crear la cuenta la primera vez (el usuario debe aceptar los términos). */
export type SocialSignupInput = { role?: string; municipality?: string; acceptTerms?: boolean };

export type SocialSignInResult =
  | { status: "ok"; userId: string; user: SessionUser; created: boolean; hasPassword: boolean }
  | { status: "needsSignup"; email: string; name: string };

/**
 * Resuelve la cuenta de un perfil verificado:
 * 1. Si ya hay una cuenta vinculada a ese proveedor, entra.
 * 2. Si hay una cuenta con el mismo correo (verificado por el proveedor), la vincula y entra.
 * 3. Si no existe, la crea solo si `signup.acceptTerms`; si no, pide completar el registro.
 */
export async function resolveSocialAccount(profile: SocialProfile, signup?: SocialSignupInput): Promise<SocialSignInResult> {
  const idField = profile.provider === "google" ? "googleId" : "appleId";

  let user = await prisma.user.findFirst({ where: { [idField]: profile.sub } });
  let created = false;

  if (!user) {
    if (!profile.email) {
      throw new SocialAuthError(
        "No recibimos tu correo. En Ajustes del iPhone › tu nombre › Iniciar sesión con Apple, quita CundiMarket y vuelve a intentarlo.",
      );
    }
    const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
    const name = profile.name?.trim() || profile.email.split("@")[0];

    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { [idField]: profile.sub, avatarUrl: byEmail.avatarUrl ?? profile.picture },
      });
    } else if (signup?.acceptTerms) {
      user = await prisma.user.create({
        data: {
          name,
          email: profile.email,
          passwordHash: "",
          [idField]: profile.sub,
          avatarUrl: profile.picture,
          role: signup.role === "MERCHANT" ? "MERCHANT" : "CITIZEN",
          municipality: normalizeMunicipality(signup.municipality),
        },
      });
      created = true;
    } else {
      return { status: "needsSignup", email: profile.email, name };
    }
  }

  return {
    status: "ok",
    userId: user.id,
    created,
    hasPassword: !!user.passwordHash,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      municipality: user.municipality,
    },
  };
}
