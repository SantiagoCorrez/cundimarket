import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageListing } from "@/lib/listings";
import { BackBar } from "@/components/nav";
import { PropertyForm } from "@/components/property-form";
import { updateProperty } from "@/lib/actions/modules";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/espacios/${id}/editar`);

  const property = await prisma.property.findUnique({ where: { id }, include: { photos: true } });
  if (!property) notFound();
  if (!canManageListing(property.userId, session)) redirect(`/espacios/${id}`);

  return (
    <div>
      <BackBar title="Editar inmueble" />
      <PropertyForm
        action={updateProperty}
        submitLabel="Guardar cambios"
        property={{ ...property, photos: property.photos.map((p) => p.url) }}
      />
    </div>
  );
}
