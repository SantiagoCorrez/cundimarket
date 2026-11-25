import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Button, Badge } from "@/components/ui";
import { resolveReport } from "@/lib/actions/admin";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const targetHref: Record<string, string> = {
  BUSINESS: "/business/",
  PROPERTY: "/espacios/",
  SERVICE: "/servicios/",
  JOB: "/empleo/",
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } } },
  });

  // Resolver nombres de comercios reportados
  const bizIds = reports.filter((r) => r.targetType === "BUSINESS").map((r) => r.targetId);
  const bizs = await prisma.business.findMany({ where: { id: { in: bizIds } }, select: { id: true, name: true } });
  const bizName = (id: string) => bizs.find((b) => b.id === id)?.name;

  // Vacantes, servicios e inmuebles reportados que todavía existen (para ofrecer "Eliminar publicación")
  const jobIds = new Set(
    (await prisma.job.findMany({ where: { id: { in: reports.filter((r) => r.targetType === "JOB").map((r) => r.targetId) } }, select: { id: true } })).map((j) => j.id),
  );
  const propertyIds = new Set(
    (await prisma.property.findMany({ where: { id: { in: reports.filter((r) => r.targetType === "PROPERTY").map((r) => r.targetId) } }, select: { id: true } })).map((p) => p.id),
  );
  const serviceIds = new Set(
    (await prisma.serviceProvider.findMany({ where: { id: { in: reports.filter((r) => r.targetType === "SERVICE").map((r) => r.targetId) } }, select: { id: true } })).map((s) => s.id),
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <h1 className="text-2xl font-extrabold">Reportes ciudadanos</h1>
      <p className="text-ink-soft text-sm mt-1">Revisa los reportes enviados por los usuarios.</p>

      <div className="space-y-3 mt-4">
        {reports.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={r.status === "OPEN" ? "warn" : "neutral"}>
                    {r.status === "OPEN" ? "Abierto" : r.status === "REVIEWED" ? "Revisado" : "Descartado"}
                  </Badge>
                  <Badge tone="neutral">{r.targetType}</Badge>
                </div>
                <p className="font-semibold mt-1.5">{r.reason}</p>
                {r.detail && <p className="text-sm text-ink-soft">{r.detail}</p>}
                <p className="text-xs text-ink-faint mt-1">
                  {r.targetType === "BUSINESS" && bizName(r.targetId) ? `${bizName(r.targetId)} · ` : ""}
                  Reportó {r.user.name} · {timeAgo(r.createdAt)}
                </p>
                <Link href={`${targetHref[r.targetType] || "/"}${r.targetId}`} className="text-xs font-semibold text-brand-strong">
                  Ver publicación →
                </Link>
              </div>
            </div>
            {r.status === "OPEN" && (
              <div className="flex flex-wrap items-start gap-2 mt-3">
                {r.targetType === "BUSINESS" && (
                  <form action={resolveReport}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="suspend" />
                    <Button size="sm" variant="danger">Suspender comercio</Button>
                  </form>
                )}
                {r.targetType === "JOB" && jobIds.has(r.targetId) && (
                  <DeleteListingButton kind="job" id={r.targetId} title="esta vacante" from="reports" />
                )}
                {r.targetType === "PROPERTY" && propertyIds.has(r.targetId) && (
                  <DeleteListingButton kind="property" id={r.targetId} title="este inmueble" from="reports" />
                )}
                {r.targetType === "SERVICE" && serviceIds.has(r.targetId) && (
                  <DeleteListingButton kind="service" id={r.targetId} title="este servicio" from="reports" />
                )}
                <form action={resolveReport}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="action" value="dismiss" />
                  <Button size="sm" variant="outline">Descartar</Button>
                </form>
              </div>
            )}
          </Card>
        ))}
        {!reports.length && <p className="text-ink-soft text-sm">No hay reportes.</p>}
      </div>
    </div>
  );
}
