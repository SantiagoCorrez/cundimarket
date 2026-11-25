import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BackBar } from "@/components/nav";
import { Badge, Button, Card, SectionTitle, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { setPropertyStatus } from "@/lib/actions/modules";
import { PROPERTY_STATUSES } from "@/lib/taxonomy";
import { formatCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis publicaciones · CundiMarket" };

export default async function MyListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/mis-publicaciones");

  const [jobs, services, properties] = await Promise.all([
    prisma.job.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: { where: { applied: true } } } } },
    }),
    prisma.serviceProvider.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.property.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const canPublish = session.role === "MERCHANT" || session.role === "ADMIN";

  return (
    <div>
      <BackBar title="Mis publicaciones" />
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
                  <Link href={`/empleo/${j.id}/postulaciones`} className={buttonClass("primary", "md")}>
                    <Users size={16} /> Postulantes ({j._count.applications})
                  </Link>
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

        <section className="space-y-3">
          <SectionTitle
            action={
              canPublish ? (
                <Link href="/espacios/nuevo" className="text-sm font-semibold text-brand-strong inline-flex items-center gap-1">
                  <Plus size={14} /> Publicar
                </Link>
              ) : undefined
            }
          >
            🏠 Inmuebles
          </SectionTitle>
          {properties.length ? (
            properties.map((p) => {
              const st = PROPERTY_STATUSES.find((s) => s.key === p.status);
              const title = `${p.propertyType} · ${formatCOP(p.price)}`;
              return (
                <Card key={p.id} className="p-3.5 space-y-3">
                  <div className="min-w-0">
                    <Badge tone={st?.tone ?? "neutral"}>{st?.label ?? p.status}</Badge>
                    <Link href={`/espacios/${p.id}`} className="block font-semibold mt-1.5 truncate">{title}</Link>
                    <p className="text-xs text-ink-soft truncate">{[p.neighborhood, p.municipality].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_STATUSES.filter((s) => s.key !== p.status).map((s) => (
                      <form key={s.key} action={setPropertyStatus.bind(null, p.id, s.key)}>
                        <Button variant="outline">Marcar {s.label.toLowerCase()}</Button>
                      </form>
                    ))}
                    <Link href={`/espacios/${p.id}/editar`} className={buttonClass("outline", "md")}>
                      <Pencil size={16} /> Editar
                    </Link>
                    <DeleteListingButton kind="property" id={p.id} title={title} />
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-ink-soft">Aún no has publicado inmuebles.</p>
          )}
        </section>

        {!canPublish && !jobs.length && !services.length && !properties.length && (
          <p className="text-sm text-ink-soft">
            Para publicar vacantes, servicios o inmuebles cambia tu perfil a <b>🏪 Tengo un negocio</b> desde tu perfil.
          </p>
        )}
      </div>
    </div>
  );
}
