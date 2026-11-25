import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { canManageListing, deleteJobListing } from "@/lib/listings";
import { json, apiError, requireUser, isErrorResponse } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return apiError("Vacante no encontrada.", 404);

  const isOwner = !!session && canManageListing(job.userId, session);
  const saved = session
    ? await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: session.id, jobId: id } } })
    : null;
  // Una vacante pausada solo la ven su dueño, un administrador o quien la guardó o se postuló.
  if (!job.active && !isOwner && !saved) return apiError("Vacante no encontrada.", 404);

  // Solo quien publicó la vacante ve a sus postulantes (un administrador no).
  const applicants =
    session?.id === job.userId ? await prisma.savedJob.count({ where: { jobId: id, applied: true } }) : undefined;

  return json({ job, saved: !!saved, applied: !!saved?.applied, isOwner, applicants });
}

/** Elimina la vacante: solo su dueño o un administrador. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, select: { userId: true } });
  if (!job) return apiError("Vacante no encontrada.", 404);
  if (!canManageListing(job.userId, session)) return apiError("No puedes eliminar esta publicación.", 403);

  await deleteJobListing(id);
  return json({ ok: true });
}
