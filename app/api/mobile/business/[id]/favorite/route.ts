import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: businessId } = await params;

  const existing = await prisma.favorite.findUnique({
    where: { userId_businessId: { userId: session.id, businessId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: session.id, businessId } });
  }
  return json({ ok: true, favorited: !existing });
}
