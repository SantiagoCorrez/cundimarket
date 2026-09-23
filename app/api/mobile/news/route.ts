import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET() {
  const news = await prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 50 });
  return json({ news });
}
