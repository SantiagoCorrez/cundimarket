import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE = "cundi_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "cundimarket-dev-secret-change-in-production-2026",
);

export type Role = "CITIZEN" | "MERCHANT" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  municipality: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Firma un JWT de sesión (30 días). Usado tanto para la cookie web como para el token bearer móvil. */
export async function signAuthToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
      municipality: payload.municipality as string,
    };
  } catch {
    return null;
  }
}

/** Firma un JWT y lo guarda en cookie httpOnly. Llamar desde Server Action / Route Handler. */
export async function createSession(user: SessionUser) {
  const token = await signAuthToken(user);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Devuelve el usuario de la sesión o null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
      municipality: payload.municipality as string,
    };
  } catch {
    return null;
  }
}

/** Carga el usuario completo desde la base de datos. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id } });
}

/** Sesión para la API móvil: token bearer (app nativa) o cookie (fallback). */
export async function getSessionFromRequest(req: Request): Promise<SessionUser | null> {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyAuthToken(header.slice(7));
  }
  return getSession();
}
