import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { json, apiError } from "@/lib/api";
import { isOpenNow } from "@/lib/schedule";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      photos: true,
      products: true,
      promotions: { where: { active: true }, orderBy: { createdAt: "desc" } },
      ratings: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!business) return apiError("Negocio no encontrado.", 404);

  prisma.business.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  const favorited = session
    ? !!(await prisma.favorite.findUnique({
        where: { userId_businessId: { userId: session.id, businessId: id } },
      }))
    : false;

  return json({ business, favorited, openNow: isOpenNow(business.schedule) });
}
