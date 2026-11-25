import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BackBar } from "@/components/nav";
import { PublishGate } from "@/components/publish-gate";
import { PropertyForm } from "@/components/property-form";
import { createProperty } from "@/lib/actions/modules";

export default async function NewPropertyPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/espacios/nuevo");
  if (session.role === "CITIZEN") return <PublishGate title="Publicar inmueble" />;

  return (
    <div>
      <BackBar title="Publicar inmueble" />
      <PropertyForm action={createProperty} defaultName={session.name} submitLabel="Publicar anuncio" />
    </div>
  );
}
