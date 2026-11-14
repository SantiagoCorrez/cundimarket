import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";
import { ensureFreshNews } from "@/lib/news-sync";
import { normalizeMunicipality } from "@/lib/taxonomy";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  const municipality = normalizeMunicipality(new URL(req.url).searchParams.get("municipality"), session?.municipality);
  void ensureFreshNews(municipality);

  const [categories, featured, promos, news] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.business.findMany({
      where: { status: "VERIFIED" },
      orderBy: [{ featured: "desc" }, { ratingAvg: "desc" }],
      take: 8,
      include: { category: true, _count: { select: { promotions: true } } },
    }),
    prisma.promotion.findMany({
      where: { active: true, business: { status: "VERIFIED" } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { business: { select: { id: true, name: true, logoUrl: true } } },
    }),
    prisma.news.findMany({ where: { municipality }, orderBy: { publishedAt: "desc" }, take: 5 }),
  ]);

  return json({
    session: session
      ? { name: session.name, municipality: session.municipality }
      : null,
    categories,
    featured,
    promos,
    news,
    municipality,
  });
}
