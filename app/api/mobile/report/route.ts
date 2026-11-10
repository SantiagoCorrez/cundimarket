import { prisma } from "@/lib/prisma";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

const TARGET_TYPES = ["BUSINESS", "PROPERTY", "SERVICE", "JOB"] as const;
type TargetType = (typeof TARGET_TYPES)[number];

async function targetExists(type: TargetType, id: string) {
  const where = { where: { id }, select: { id: true } };
  switch (type) {
    case "BUSINESS":
      return !!(await prisma.business.findUnique(where));
    case "PROPERTY":
      return !!(await prisma.property.findUnique(where));
    case "SERVICE":
      return !!(await prisma.serviceProvider.findUnique(where));
    case "JOB":
      return !!(await prisma.job.findUnique(where));
  }
}

/** Reporte de contenido inapropiado o incorrecto (lo revisa el equipo en el panel de administración). */
export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;

  const body = await req.json().catch(() => null);
  const targetType = String(body?.targetType || "") as TargetType;
  const targetId = String(body?.targetId || "");
  const reason = String(body?.reason || "").trim().slice(0, 120);
  const detail = String(body?.detail || "").trim().slice(0, 600) || null;

  if (!TARGET_TYPES.includes(targetType) || !targetId || !reason) return apiError("Reporte inválido.");
  if (!(await targetExists(targetType, targetId))) return apiError("La publicación ya no existe.", 404);

  // La app puede reenviar un reporte guardado sin conexión: se ignora un duplicado exacto reciente.
  const duplicate = await prisma.report.findFirst({
    where: { userId: session.id, targetType, targetId, reason, detail, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } },
    select: { id: true },
  });
  if (duplicate) return json({ ok: true });

  await prisma.report.create({ data: { userId: session.id, targetType, targetId, reason, detail } });
  return json({ ok: true });
}
