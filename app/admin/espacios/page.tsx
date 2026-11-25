import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, Logo, VerifiedBadge, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { setPropertyStatus, setPropertyVerified } from "@/lib/actions/modules";
import { OFFER_TYPES, PROPERTY_STATUSES } from "@/lib/taxonomy";
import { cn, formatCOP, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inmuebles · CundiAdmin" };

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const status = PROPERTY_STATUSES.find((s) => s.key === estado);
  const properties = await prisma.property.findMany({
    where: status ? { status: status.key } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { photos: { take: 1 }, user: { select: { name: true, email: true } } },
  });
  const tabs = [{ key: "", label: "Todos" }, ...PROPERTY_STATUSES];

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold">Inmuebles</h1>
      <p className="text-ink-soft text-sm mt-1">Anuncios de CundiEspacios: verifica, cambia el estado, edita o elimina.</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/espacios?estado=${t.key}` : "/admin/espacios"}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition",
              (status?.key ?? "") === t.key ? "bg-ink text-white border-ink" : "bg-surface border-line text-ink-soft",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3 mt-4">
        {properties.length ? (
          properties.map((p) => {
            const st = PROPERTY_STATUSES.find((s) => s.key === p.status);
            const offer = OFFER_TYPES.find((o) => o.key === p.offerType)?.label;
            const title = `${p.propertyType} · ${formatCOP(p.price)}`;
            return (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Logo name={p.propertyType} src={p.photos[0]?.url} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={st?.tone ?? "neutral"}>{st?.label ?? p.status}</Badge>
                      <Badge tone="brand">{offer}</Badge>
                      {p.verified && <VerifiedBadge small />}
                      <span className="text-xs text-ink-faint">{timeAgo(p.createdAt)}</span>
                    </div>
                    <Link href={`/espacios/${p.id}`} className="block font-bold mt-1">{title}</Link>
                    <p className="text-sm text-ink-soft">
                      {[p.neighborhood, p.municipality, p.address].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Publicó {p.user.name} ({p.user.email}) · Contacto: {p.ownerName}, {p.phone}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={setPropertyVerified.bind(null, p.id, !p.verified)}>
                    <Button size="sm" variant={p.verified ? "outline" : "primary"}>
                      {p.verified ? "Quitar verificación" : "Verificar"}
                    </Button>
                  </form>
                  {PROPERTY_STATUSES.filter((s) => s.key !== p.status).map((s) => (
                    <form key={s.key} action={setPropertyStatus.bind(null, p.id, s.key)}>
                      <Button size="sm" variant="outline">Marcar {s.label.toLowerCase()}</Button>
                    </form>
                  ))}
                  <Link href={`/espacios/${p.id}/editar`} className={buttonClass("outline", "sm")}>
                    <Pencil size={14} /> Editar
                  </Link>
                  <DeleteListingButton kind="property" id={p.id} title={title} from="admin" size="sm" />
                </div>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-ink-soft py-6">No hay inmuebles en esta vista.</p>
        )}
      </div>
    </div>
  );
}
