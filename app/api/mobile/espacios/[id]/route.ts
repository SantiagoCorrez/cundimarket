import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { canManageListing, deletePropertyListing } from "@/lib/listings";
import { json, apiError, requireUser, isErrorResponse } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  const property = await prisma.property.findUnique({ where: { id }, include: { photos: true } });
  if (!property) return apiError("Inmueble no encontrado.", 404);

  // Un inmueble cerrado solo lo ve su dueño (o un administrador).
  const isOwner = !!session && canManageListing(property.userId, session);
  if (property.status === "CLOSED" && !isOwner) return apiError("Inmueble no encontrado.", 404);
  return json({ property, isOwner });
}

/** Elimina el inmueble: solo su dueño o un administrador. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id } = await params;

  const property = await prisma.property.findUnique({ where: { id }, select: { userId: true } });
  if (!property) return apiError("Inmueble no encontrado.", 404);
  if (!canManageListing(property.userId, session)) return apiError("No puedes eliminar esta publicación.", 403);

  await deletePropertyListing(id);
  return json({ ok: true });
}
