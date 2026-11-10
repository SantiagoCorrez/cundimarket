import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vacantes · CundiAdmin" };

const tabs = [
  { key: "", label: "Todas" },
  { key: "activas", label: "Activas" },
  { key: "pausadas", label: "Pausadas" },
];

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const jobs = await prisma.job.findMany({
    where: estado === "activas" ? { active: true } : estado === "pausadas" ? { active: false } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } }, _count: { select: { applications: true } } },
  });

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold">Vacantes</h1>
      <p className="text-ink-soft text-sm mt-1">Todas las vacantes publicadas. Puedes editarlas o eliminarlas.</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/empleos?estado=${t.key}` : "/admin/empleos"}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition",
              (estado || "") === t.key ? "bg-ink text-white border-ink" : "bg-surface border-line text-ink-soft",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3 mt-4">
        {jobs.length ? (
          jobs.map((j) => (
            <Card key={j.id} className="p-4 space-y-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={j.active ? "success" : "warn"}>{j.active ? "Activa" : "Pausada"}</Badge>
                  <Badge tone="neutral">{j.contractType}</Badge>
                  <span className="text-xs text-ink-faint">{timeAgo(j.createdAt)}</span>
                </div>
                <Link href={`/empleo/${j.id}`} className="block font-bold mt-1.5">{j.title}</Link>
                <p className="text-sm text-ink-soft">{j.companyName} · {j.sector} · {j.municipality}</p>
                <p className="text-xs text-ink-faint mt-0.5">
                  Publicó {j.user.name} ({j.user.email}) · {j._count.applications} {j._count.applications === 1 ? "guardado/postulación" : "guardados/postulaciones"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/empleo/${j.id}/editar`} className={buttonClass("outline", "sm")}>
                  <Pencil size={14} /> Editar
                </Link>
                <DeleteListingButton kind="job" id={j.id} title={j.title} from="admin" />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-ink-soft py-6">No hay vacantes en esta vista.</p>
        )}
      </div>
    </div>
  );
}
