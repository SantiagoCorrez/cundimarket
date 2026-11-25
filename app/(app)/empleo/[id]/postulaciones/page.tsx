import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listApplicants } from "@/lib/applications";
import { BackBar } from "@/components/nav";
import { Badge, Card, EmptyState, Logo } from "@/components/ui";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postulantes · CundiMarket" };

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/empleo/${id}/postulaciones`);
  const result = await listApplicants(id, session.id);
  if (!result) notFound();
  const { job, applicants } = result;

  return (
    <div>
      <BackBar title="Postulantes" />
      <div className="p-4 space-y-3">
        <div>
          <p className="font-bold">{job.title}</p>
          <p className="text-sm text-ink-soft">
            {job.companyName} · {applicants.length} {applicants.length === 1 ? "postulante" : "postulantes"}
          </p>
        </div>
        {applicants.length ? (
          applicants.map((a) => (
            <Link key={a.id} href={`/empleo/${id}/postulaciones/${a.id}`} className="block">
              <Card className="p-3.5 flex items-center gap-3">
                <Logo name={a.user.name} src={a.user.avatarUrl} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{a.user.name}</p>
                    {!a.viewedAt && <Badge tone="brand">Nuevo</Badge>}
                  </div>
                  <p className="text-xs text-ink-soft truncate">
                    {a.user.candidate?.skills || a.user.candidate?.education || "Sin perfil laboral"}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {a.user.municipality}
                    {a.appliedAt ? ` · ${timeAgo(a.appliedAt)}` : ""}
                  </p>
                </div>
                <ChevronRight size={18} className="text-ink-faint shrink-0" />
              </Card>
            </Link>
          ))
        ) : (
          <EmptyState icon="📭" title="Aún no hay postulantes" subtitle="Te avisaremos cuando alguien se postule a esta vacante." />
        )}
      </div>
    </div>
  );
}
