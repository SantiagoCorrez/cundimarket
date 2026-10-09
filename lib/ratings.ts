import { prisma } from "./prisma";

/** Recalcula promedio y cantidad de calificaciones de un comercio. */
export async function recomputeBusinessRating(businessId: string) {
  const agg = await prisma.rating.aggregate({
    where: { businessId },
    _avg: { stars: true },
    _count: true,
  });
  await prisma.business.updateMany({
    where: { id: businessId },
    data: { ratingAvg: agg._avg.stars || 0, ratingCount: agg._count },
  });
}

/** Recalcula promedio y cantidad de calificaciones de un prestador de servicios. */
export async function recomputeProviderRating(providerId: string) {
  const agg = await prisma.rating.aggregate({
    where: { providerId },
    _avg: { stars: true },
    _count: true,
  });
  await prisma.serviceProvider.updateMany({
    where: { id: providerId },
    data: { ratingAvg: agg._avg.stars || 0, ratingCount: agg._count },
  });
}
