import { prisma } from "@/lib/prisma";
import { json, apiError } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) return apiError("Noticia no encontrada.", 404);
  return json({ news: item });
}
