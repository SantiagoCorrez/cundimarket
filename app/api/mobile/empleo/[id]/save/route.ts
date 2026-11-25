import { prisma } from "@/lib/prisma";
import { ApplicationError, setJobState } from "@/lib/applications";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

/**
 * Guarda/quita una vacante o se postula.
 * - `{ saved: boolean, applied?: boolean }` fija el estado (idempotente; lo usa la app para reenviar sin conexión).
 * - `{ applied }` sin `saved` (versiones anteriores de la app): alterna guardado / se postula.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: jobId } = await params;
  const body = await req.json().catch(() => ({}));
  const applied = !!body?.applied;

  let saved: boolean;
  if (typeof body?.saved === "boolean") saved = body.saved;
  else if (applied) saved = true;
  else saved = !(await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: session.id, jobId } } }));

  try {
    await setJobState(session, jobId, { saved, applied });
  } catch (error) {
    if (error instanceof ApplicationError) return apiError(error.message, error.status);
    throw error;
  }
  return json({ ok: true });
}
