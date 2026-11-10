import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Card, Logo, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Servicios · CundiAdmin" };

export default async function AdminServicesPage() {
  const services = await prisma.serviceProvider.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-extrabold">Servicios</h1>
      <p className="text-ink-soft text-sm mt-1">Todos los prestadores de servicios publicados. Puedes editarlos o eliminarlos.</p>

      <div className="space-y-3 mt-4">
        {services.length ? (
          services.map((s) => (
            <Card key={s.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Logo name={s.providerName} src={s.photoUrl} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {s.verified && <Badge tone="success">Verificado</Badge>}
                    <span className="text-xs text-ink-faint">{timeAgo(s.createdAt)}</span>
                  </div>
                  <Link href={`/servicios/${s.id}`} className="block font-bold mt-1">{s.providerName}</Link>
                  <p className="text-sm text-ink-soft">{s.serviceType} · {s.municipality}</p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Publicó {s.user.name} ({s.user.email}) · {s.ratingCount} {s.ratingCount === 1 ? "calificación" : "calificaciones"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/servicios/${s.id}/editar`} className={buttonClass("outline", "sm")}>
                  <Pencil size={14} /> Editar
                </Link>
                <DeleteListingButton kind="service" id={s.id} title={s.providerName} from="admin" />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-ink-soft py-6">Aún no hay servicios publicados.</p>
        )}
      </div>
    </div>
  );
}
