import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

const TOKEN = /^Expo(nent)?PushToken\[[^\]]{1,200}\]$/;

async function readToken(req: Request) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token || "");
  return TOKEN.test(token) ? token : null;
}

/** Registra el dispositivo para recibir push. Un dispositivo pertenece a un solo usuario a la vez. */
export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const token = await readToken(req);
  if (!token) return apiError("Token inválido.");
  await prisma.pushToken.upsert({ where: { token }, create: { token, userId: session.id }, update: { userId: session.id } });
  return json({ ok: true });
}

/** Deja de enviar push a este dispositivo (al cerrar sesión). */
export async function DELETE(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const token = await readToken(req);
  if (token) await prisma.pushToken.deleteMany({ where: { token, userId: session.id } });
  return json({ ok: true });
}
