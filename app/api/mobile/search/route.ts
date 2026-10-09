import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { json } from "@/lib/api";
import { haversineKm } from "@/lib/geo";
import { isOpenNow } from "@/lib/schedule";

const insensitive = "insensitive" as const;

/**
 * Búsqueda y exploración de comercios.
 * Parámetros: q (nombre, categoría, subcategoría, producto, barrio, municipio), category, subcategory,
 * municipality, open=1 (abierto ahora), promos=1 (promociones activas), top=1 (calificación 4+),
 * sort=recent|near (near requiere lat y lng del usuario; por defecto ordena por calificación).
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() || undefined;
  const category = sp.get("category") || undefined;
  const subcategory = sp.get("subcategory") || undefined;
  const municipality = sp.get("municipality") || undefined;
  const sort = sp.get("sort") || undefined;
  const promos = sp.get("promos") === "1" || sort === "promos";
  const openOnly = sp.get("open") === "1";

  const userLat = sp.get("lat") ? Number(sp.get("lat")) : NaN;
  const userLng = sp.get("lng") ? Number(sp.get("lng")) : NaN;
  const hasPosition = Number.isFinite(userLat) && Number.isFinite(userLng);

  const where: Prisma.BusinessWhereInput = { status: "VERIFIED" };
  if (category) where.category = { slug: category };
  if (subcategory) where.subcategory = { slug: subcategory };
  if (municipality) where.municipality = municipality;
  if (promos) where.promotions = { some: { active: true } };
  if (sp.get("top") === "1") where.ratingAvg = { gte: 4 };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: insensitive } },
      { description: { contains: q, mode: insensitive } },
      { neighborhood: { contains: q, mode: insensitive } },
      { municipality: { contains: q, mode: insensitive } },
      { category: { name: { contains: q, mode: insensitive } } },
      { subcategory: { name: { contains: q, mode: insensitive } } },
      { products: { some: { name: { contains: q, mode: insensitive } } } },
    ];
  }

  const orderBy: Prisma.BusinessOrderByWithRelationInput[] =
    sort === "recent"
      ? [{ createdAt: "desc" }]
      : [{ ratingAvg: "desc" }, { ratingCount: "desc" }];

  const rows = await prisma.business.findMany({
    where,
    orderBy,
    take: 200,
    include: { category: true, subcategory: true, _count: { select: { promotions: true } } },
  });

  const now = new Date();
  let results = rows.map((b) => ({
    ...b,
    openNow: isOpenNow(b.schedule, now),
    distanceKm:
      hasPosition && b.lat != null && b.lng != null
        ? Math.round(haversineKm(userLat, userLng, b.lat, b.lng) * 10) / 10
        : null,
  }));

  if (openOnly) results = results.filter((b) => b.openNow === true);
  if (sort === "near" && hasPosition) {
    // Los comercios sin coordenadas quedan al final (conservan el orden por calificación).
    results = results
      .map((b, i) => ({ b, i }))
      .sort((x, y) => {
        const dx = x.b.distanceKm ?? Infinity;
        const dy = y.b.distanceKm ?? Infinity;
        return dx === dy ? x.i - y.i : dx - dy;
      })
      .map(({ b }) => b);
  }

  return json({ results: results.slice(0, 50) });
}
