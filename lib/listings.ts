import { prisma } from "@/lib/prisma";

/** Puede editar/eliminar una publicación su dueño o un administrador. */
export function canManageListing(ownerId: string, session: { id: string; role: string }) {
  return ownerId === session.id || session.role === "ADMIN";
}

/** Elimina una vacante (y sus postulaciones/guardados) y da por revisados los reportes abiertos sobre ella. */
export async function deleteJobListing(id: string) {
  await prisma.job.delete({ where: { id } });
  await prisma.notification.deleteMany({ where: { dedupeKey: { startsWith: `application:${id}:` } } });
  await prisma.report.updateMany({ where: { targetType: "JOB", targetId: id, status: "OPEN" }, data: { status: "REVIEWED" } });
}

/** Elimina un inmueble (con sus fotos) y da por revisados los reportes abiertos sobre él. */
export async function deletePropertyListing(id: string) {
  await prisma.property.delete({ where: { id } });
  await prisma.report.updateMany({ where: { targetType: "PROPERTY", targetId: id, status: "OPEN" }, data: { status: "REVIEWED" } });
}

/** Elimina un servicio (con sus fotos y calificaciones) y da por revisados los reportes abiertos sobre él. */
export async function deleteServiceListing(id: string) {
  await prisma.serviceProvider.delete({ where: { id } });
  await prisma.report.updateMany({ where: { targetType: "SERVICE", targetId: id, status: "OPEN" }, data: { status: "REVIEWED" } });
}
