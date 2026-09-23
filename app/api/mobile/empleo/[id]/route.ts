import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { json, apiError } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return apiError("Vacante no encontrada.", 404);

  const saved = session
    ? await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: session.id, jobId: id } } })
    : null;

  return json({ job, saved: !!saved, applied: !!saved?.applied });
}
