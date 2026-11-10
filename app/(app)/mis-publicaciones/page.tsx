import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BackBar } from "@/components/nav";
import { Badge, Card, SectionTitle, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis vacantes y servicios · CundiMarket" };

export default async function MyListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/mis-publicaciones");

  const [jobs, services] = await Promise.all([
    prisma.job.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.serviceProvider.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const canPublish = session.role === "MERCHANT" || session.role === "ADMIN";

  return (
    <div>
      <BackBar title="Mis vacantes y servicios" />
      <div className="p-4 space-y-6">
        <section className="space-y-3">
          <SectionTitle
            action={
              canPublish ? (
                <Link href="/empleo/nuevo" className="text-sm font-semibold text-brand-strong inline-flex items-center gap-1">
                  <Plus size={14} /> Publicar
                </Link>
              ) : undefined
            }
          >
            💼 Vacantes
          </SectionTitle>
          {jobs.length ? (
            jobs.map((j) => (
              <Card key={j.id} className="p-3.5 space-y-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={j.active ? "success" : "warn"}>{j.active ? "Activa" : "Pausada"}</Badge>
                    <Badge tone="neutral">{j.contractType}</Badge>
                  </div>
                  <Link href={`/empleo/${j.id}`} className="block font-semibold mt-1.5 truncate">{j.title}</Link>
                  <p className="text-xs text-ink-soft truncate">{j.companyName} · {j.municipality}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/empleo/${j.id}/editar`} className={buttonClass("outline", "md")}>
                    <Pencil size={16} /> Editar
                  </Link>
                  <DeleteListingButton kind="job" id={j.id} title={j.title} />
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-ink-soft">Aún no has publicado vacantes.</p>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle
            action={
              canPublish ? (
                <Link href="/servicios/nuevo" className="text-sm font-semibold text-brand-strong inline-flex items-center gap-1">
                  <Plus size={14} /> Ofrecer
                </Link>
              ) : undefined
            }
          >
            🛠️ Servicios
          </SectionTitle>
          {services.length ? (
            services.map((s) => (
              <Card key={s.id} className="p-3.5 space-y-3">
                <div className="min-w-0">
                  <Link href={`/servicios/${s.id}`} className="block font-semibold truncate">{s.providerName}</Link>
                  <p className="text-xs text-ink-soft truncate">{s.serviceType} · {s.municipality}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/servicios/${s.id}/editar`} className={buttonClass("outline", "md")}>
                    <Pencil size={16} /> Editar
                  </Link>
                  <DeleteListingButton kind="service" id={s.id} title={s.providerName} />
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-ink-soft">Aún no ofreces servicios.</p>
          )}
        </section>

        {!canPublish && !jobs.length && !services.length && (
          <p className="text-sm text-ink-soft">
            Para publicar vacantes o servicios cambia tu perfil a <b>🏪 Tengo un negocio</b> desde tu perfil.
          </p>
        )}
      </div>
    </div>
  );
}
