import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json } from "@/lib/api";

/**
 * Marca o desmarca un favorito. Si el cuerpo trae `favorited` (boolean) se fija ese estado,
 * lo que permite reenviar la acción sin riesgo (la app la guarda cuando no hay conexión).
 * Sin cuerpo, alterna el estado actual.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: businessId } = await params;

  const body = await req.json().catch(() => null);

  const existing = await prisma.favorite.findUnique({
    where: { userId_businessId: { userId: session.id, businessId } },
  });
  const want = typeof body?.favorited === "boolean" ? body.favorited : !existing;

  if (want && !existing) {
    await prisma.favorite.create({ data: { userId: session.id, businessId } });
  } else if (!want && existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  }
  return json({ ok: true, favorited: want });
}
