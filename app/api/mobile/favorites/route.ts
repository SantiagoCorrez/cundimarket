import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json } from "@/lib/api";

export async function GET(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: { business: { include: { category: true, _count: { select: { promotions: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return json({ favorites: favorites.map((f) => f.business) });
}
