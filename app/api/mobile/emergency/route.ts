import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET() {
  const contacts = await prisma.emergencyContact.findMany({ orderBy: { order: "asc" } });
  return json({ contacts });
}
