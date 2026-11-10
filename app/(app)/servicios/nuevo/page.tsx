import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BackBar } from "@/components/nav";
import { PublishGate } from "@/components/publish-gate";
import { ServiceForm } from "@/components/service-form";
import { createService } from "@/lib/actions/modules";

export default async function NewServicePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/servicios/nuevo");
  if (session.role === "CITIZEN") return <PublishGate title="Ofrecer servicio" />;

  return (
    <div>
      <BackBar title="Ofrecer servicio" />
      <ServiceForm action={createService} defaultName={session.name} submitLabel="Publicar servicio" />
    </div>
  );
}
