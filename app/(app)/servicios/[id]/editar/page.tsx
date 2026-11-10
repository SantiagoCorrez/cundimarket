import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageListing } from "@/lib/listings";
import { BackBar } from "@/components/nav";
import { ServiceForm } from "@/components/service-form";
import { updateService } from "@/lib/actions/modules";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/servicios/${id}/editar`);

  const service = await prisma.serviceProvider.findUnique({ where: { id }, include: { photos: true } });
  if (!service) notFound();
  if (!canManageListing(service.userId, session)) redirect(`/servicios/${id}`);

  return (
    <div>
      <BackBar title="Editar servicio" />
      <ServiceForm
        action={updateService}
        submitLabel="Guardar cambios"
        service={{
          ...service,
          photos: [service.photoUrl, ...service.photos.map((p) => p.url)].filter((u): u is string => !!u),
        }}
      />
    </div>
  );
}
