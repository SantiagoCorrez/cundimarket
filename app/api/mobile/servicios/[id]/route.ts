import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { canManageListing, deleteServiceListing } from "@/lib/listings";
import { json, apiError, requireUser, isErrorResponse } from "@/lib/api";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);

  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      photos: true,
      ratings: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!provider) return apiError("Prestador no encontrado.", 404);
  return json({ provider, isOwner: !!session && canManageListing(provider.userId, session) });
}

/** Elimina el servicio: solo su dueño o un administrador. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id } = await params;

  const provider = await prisma.serviceProvider.findUnique({ where: { id }, select: { userId: true } });
  if (!provider) return apiError("Prestador no encontrado.", 404);
  if (!canManageListing(provider.userId, session)) return apiError("No puedes eliminar esta publicación.", 403);

  await deleteServiceListing(id);
  return json({ ok: true });
}
