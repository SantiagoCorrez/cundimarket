import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json } from "@/lib/api";

/**
 * Guarda/quita una vacante o marca que aplicaste.
 * - `{ saved: boolean, applied?: boolean }` fija el estado (idempotente; lo usa la app para reenviar sin conexión).
 * - `{ applied }` sin `saved` mantiene el comportamiento anterior (alternar guardado / marcar aplicada).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: jobId } = await params;
  const body = await req.json().catch(() => ({}));
  const applied = !!body?.applied;

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.id, jobId } },
  });

  if (typeof body?.saved === "boolean") {
    if (!body.saved) {
      if (existing) await prisma.savedJob.delete({ where: { id: existing.id } });
    } else if (existing) {
      if (applied && !existing.applied) {
        await prisma.savedJob.update({ where: { id: existing.id }, data: { applied: true } });
      }
    } else {
      await prisma.savedJob.create({ data: { userId: session.id, jobId, applied } });
    }
    return json({ ok: true });
  }

  if (existing && !applied) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else if (existing && applied) {
    await prisma.savedJob.update({ where: { id: existing.id }, data: { applied: true } });
  } else {
    await prisma.savedJob.create({ data: { userId: session.id, jobId, applied } });
  }
  return json({ ok: true });
}
