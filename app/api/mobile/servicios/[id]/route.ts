import { prisma } from "@/lib/prisma";
import { json, apiError } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      photos: true,
      ratings: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!provider) return apiError("Prestador no encontrado.", 404);
  return json({ provider });
}
