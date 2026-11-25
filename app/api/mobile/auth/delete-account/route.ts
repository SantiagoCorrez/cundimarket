import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { accountDeletionBlocker, deleteUserAccount } from "@/lib/account";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

/** Elimina la cuenta del usuario autenticado. Pide la contraseña (o escribir ELIMINAR en cuentas de Google o Apple). */
export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;

  const body = await req.json().catch(() => null);
  const password = String(body?.password || "");

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return apiError("No encontramos tu cuenta.", 404);
  // Las cuentas de Google o Apple no tienen contraseña: confirman escribiendo ELIMINAR.
  if (!user.passwordHash) {
    if (String(body?.confirm || '').trim().toUpperCase() !== 'ELIMINAR') {
      return apiError('Escribe ELIMINAR para confirmar.', 403);
    }
  } else if (!(await verifyPassword(password, user.passwordHash))) {
    return apiError("La contraseña no es correcta.", 403);
  }

  const blocker = await accountDeletionBlocker(user);
  if (blocker) return apiError(blocker, 409);

  await deleteUserAccount(user.id);
  return json({ ok: true });
}
