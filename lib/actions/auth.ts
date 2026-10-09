"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  verifyPassword,
  type Role,
} from "@/lib/auth";
import { MUNICIPALITIES, PILOT_MUNICIPALITY } from "@/lib/taxonomy";
import { accountDeletionBlocker, deleteUserAccount } from "@/lib/account";

export type AuthState = { error?: string } | undefined;

/** Solo rutas internas: evita redirigir a sitios externos desde el parámetro ?next=. */
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = formData.get("confirmPassword");
  const phone = String(formData.get("phone") || "").trim();
  const requestedMunicipality = String(formData.get("municipality") || PILOT_MUNICIPALITY);
  const municipality = MUNICIPALITIES.includes(requestedMunicipality) ? requestedMunicipality : PILOT_MUNICIPALITY;
  const role = (String(formData.get("role") || "CITIZEN") as Role) || "CITIZEN";
  const next = safeNext(String(formData.get("next") || ""));
  const terms = formData.get("terms");

  if (!name || !email || password.length < 6) {
    return { error: "Completa todos los campos. La contraseña debe tener mínimo 6 caracteres." };
  }
  if (confirmPassword !== null && String(confirmPassword) !== password) {
    return { error: "Las contraseñas no coinciden." };
  }
  if (!terms) {
    return { error: "Debes aceptar los términos y el tratamiento de datos para continuar." };
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con este correo." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      municipality,
      role: role === "MERCHANT" ? "MERCHANT" : "CITIZEN",
      passwordHash: await hashPassword(password),
    },
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  });

  redirect(next || (user.role === "MERCHANT" ? "/merchant" : "/home"));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || ""));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  });

  redirect(
    next ||
      (user.role === "ADMIN" ? "/admin" : user.role === "MERCHANT" ? "/merchant" : "/home"),
  );
}

/** Elimina definitivamente la cuenta del usuario con sesión; pide la contraseña como confirmación. */
export async function deleteAccountAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) redirect("/login?next=/eliminar-cuenta");

  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { id: session!.id } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "La contraseña no es correcta." };
  }
  const blocker = await accountDeletionBlocker(user);
  if (blocker) return { error: blocker };

  await deleteUserAccount(user.id);
  await destroySession();
  redirect("/eliminar-cuenta?listo=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/home");
}

/** Actualiza el municipio del usuario y refresca la sesión. */
export async function updateMunicipalityAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const requested = String(formData.get("municipality") || session!.municipality);
  const municipality = MUNICIPALITIES.includes(requested) ? requested : session!.municipality;

  const user = await prisma.user.update({
    where: { id: session!.id },
    data: { municipality },
  });
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  });
  revalidatePath("/profile");
  redirect("/profile");
}

/**
 * Alterna el tipo principal del usuario entre "Quiero descubrir" (CITIZEN)
 * y "Tengo un negocio" (MERCHANT). No afecta a los administradores.
 */
export async function switchUserTypeAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session!.role === "ADMIN") redirect("/profile");

  const requested = String(formData.get("role") || "");
  const nextRole: Role = requested === "MERCHANT" ? "MERCHANT" : "CITIZEN";

  const user = await prisma.user.update({
    where: { id: session!.id },
    data: { role: nextRole },
  });
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  });
  revalidatePath("/profile");
  redirect(nextRole === "MERCHANT" ? "/merchant" : "/profile");
}
