import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || undefined;

  const providers = await prisma.serviceProvider.findMany({
    where: { ...(cat ? { category: cat } : {}) },
    orderBy: [{ verified: "desc" }, { ratingAvg: "desc" }],
    take: 50,
  });
  return json({ providers });
}
