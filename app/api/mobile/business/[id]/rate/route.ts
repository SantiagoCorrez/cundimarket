import { prisma } from "@/lib/prisma";
import { recomputeBusinessRating } from "@/lib/ratings";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id: businessId } = await params;

  const body = await req.json().catch(() => null);
  const stars = Number(body?.stars);
  const comment = String(body?.comment || "").trim() || null;
  if (!stars || stars < 1 || stars > 5) return apiError("Calificación inválida.");

  await prisma.rating.create({ data: { userId: session.id, businessId, stars, comment } });
  await recomputeBusinessRating(businessId);

  return json({ ok: true });
}
