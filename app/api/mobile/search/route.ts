import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { json } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || undefined;

  const where: Prisma.BusinessWhereInput = { status: "VERIFIED" };
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { products: { some: { name: { contains: q } } } },
      { neighborhood: { contains: q } },
    ];
  }
  if (sort === "promos") where.promotions = { some: { active: true } };

  let orderBy: Prisma.BusinessOrderByWithRelationInput = { ratingAvg: "desc" };
  if (sort === "recent") orderBy = { createdAt: "desc" };

  const results = await prisma.business.findMany({
    where,
    orderBy,
    take: 50,
    include: { category: true, _count: { select: { promotions: true } } },
  });

  return json({ results });
}
