import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BackBar } from "@/components/nav";
import { PublishGate } from "@/components/publish-gate";
import { JobForm } from "@/components/job-form";
import { createJob } from "@/lib/actions/modules";

export default async function NewJobPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/empleo/nuevo");
  if (session.role === "CITIZEN") return <PublishGate title="Publicar vacante" />;

  return (
    <div>
      <BackBar title="Publicar vacante" />
      <JobForm action={createJob} submitLabel="Publicar vacante" />
    </div>
  );
}
