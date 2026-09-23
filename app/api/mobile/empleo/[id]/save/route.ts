import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: jobId } = await params;
  const body = await req.json().catch(() => ({}));
  const applied = !!body?.applied;

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.id, jobId } },
  });
  if (existing && !applied) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else if (existing && applied) {
    await prisma.savedJob.update({ where: { id: existing.id }, data: { applied: true } });
  } else {
    await prisma.savedJob.create({ data: { userId: session.id, jobId, applied } });
  }
  return json({ ok: true });
}
