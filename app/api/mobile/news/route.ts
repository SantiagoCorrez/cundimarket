import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";
import { ensureFreshNews } from "@/lib/news-sync";

export async function GET() {
  ensureFreshNews();
  const news = await prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 50 });
  return json({ news });
}
