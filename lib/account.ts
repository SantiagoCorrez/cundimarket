import { prisma } from "./prisma";
import { recomputeBusinessRating, recomputeProviderRating } from "./ratings";
import { revokeAppleAccess } from "./apple-auth";

/** Motivo por el que una cuenta no se puede eliminar (null si se puede). */
export async function accountDeletionBlocker(user: { role: string }): Promise<string | null> {
  if (user.role === "ADMIN" && (await prisma.user.count({ where: { role: "ADMIN" } })) <= 1) {
    return "No puedes eliminar la única cuenta de administrador.";
  }
  return null;
}

/**
 * Elimina definitivamente la cuenta y todo lo asociado (comercios, publicaciones, favoritos,
 * calificaciones, reportes, perfil laboral…: las relaciones del usuario son en cascada) y
 * recalcula los promedios de calificación de lo que el usuario había calificado.
 */
export async function deleteUserAccount(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { userId },
    select: { businessId: true, providerId: true },
  });

  // Si entró con Apple, se revoca el acceso de la app en su cuenta de Apple (lo exige Apple).
  const account = await prisma.user.findUnique({ where: { id: userId }, select: { appleRefreshToken: true } });
  if (account?.appleRefreshToken) await revokeAppleAccess(account.appleRefreshToken);

  await prisma.user.delete({ where: { id: userId } });

  const businessIds = new Set(ratings.map((r) => r.businessId).filter((id): id is string => !!id));
  const providerIds = new Set(ratings.map((r) => r.providerId).filter((id): id is string => !!id));
  await Promise.all([
    ...[...businessIds].map(recomputeBusinessRating),
    ...[...providerIds].map(recomputeProviderRating),
  ]);
}
