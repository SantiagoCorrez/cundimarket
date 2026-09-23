import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offer = searchParams.get("offer") || undefined;

  const properties = await prisma.property.findMany({
    where: { ...(offer ? { offerType: offer } : {}) },
    orderBy: { createdAt: "desc" },
    include: { photos: true },
    take: 50,
  });
  return json({ properties });
}
