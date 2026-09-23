import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contract = searchParams.get("contract") || undefined;

  const jobs = await prisma.job.findMany({
    where: { active: true, ...(contract ? { contractType: contract } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return json({ jobs });
}
