import { prisma } from "@/lib/prisma";
import { json, apiError } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id }, include: { photos: true } });
  if (!property) return apiError("Inmueble no encontrado.", 404);
  return json({ property });
}
