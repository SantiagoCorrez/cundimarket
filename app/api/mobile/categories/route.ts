import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: true },
  });
  return json({ categories });
}
