import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageListing } from "@/lib/listings";
import { BackBar } from "@/components/nav";
import { JobForm } from "@/components/job-form";
import { updateJob } from "@/lib/actions/modules";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/empleo/${id}/editar`);

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();
  if (!canManageListing(job.userId, session)) redirect(`/empleo/${id}`);

  return (
    <div>
      <BackBar title="Editar vacante" />
      <JobForm action={updateJob} job={job} submitLabel="Guardar cambios" />
    </div>
  );
}
