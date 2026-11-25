import { notFound, redirect } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getApplicant } from "@/lib/applications";
import { BackBar } from "@/components/nav";
import { Card, Logo, buttonClass } from "@/components/ui";
import { telLink, timeAgo, whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perfil del postulante · CundiMarket" };

export default async function ApplicantPage({ params }: { params: Promise<{ id: string; applicationId: string }> }) {
  const { id, applicationId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/empleo/${id}/postulaciones/${applicationId}`);
  const result = await getApplicant(id, applicationId, session.id);
  if (!result) notFound();
  const { job, applicant } = result;
  const { user } = applicant;
  const c = user.candidate;
  const sections = [
    { label: "Experiencia laboral", value: c?.experience },
    { label: "Habilidades", value: c?.skills },
    { label: "Formación académica", value: c?.education },
  ].filter((s) => s.value);

  return (
    <div>
      <BackBar title="Perfil del postulante" />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Logo name={user.name} src={user.avatarUrl} size={64} />
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold truncate">{user.name}</h1>
            <p className="text-sm text-ink-soft flex items-center gap-1"><MapPin size={14} /> {user.municipality}</p>
            <p className="text-xs text-ink-faint">
              Postulado a {job.title}
              {applicant.appliedAt ? ` · ${timeAgo(applicant.appliedAt)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.phone && (
            <>
              <a href={telLink(user.phone)} className={buttonClass("dark", "md", "flex-1")}><Phone size={16} /> Llamar</a>
              <a
                href={whatsappLink(user.phone, `Hola ${user.name}, te escribo por tu postulación a ${job.title} en CundiMarket.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "md", "flex-1")}
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </>
          )}
          <a href={`mailto:${user.email}`} className={buttonClass("outline", "md", "flex-1")}><Mail size={16} /> Correo</a>
        </div>
        <p className="text-xs text-ink-faint">{[user.phone, user.email].filter(Boolean).join(" · ")}</p>

        {sections.map((s) => (
          <Card key={s.label} className="p-4">
            <h2 className="font-bold">{s.label}</h2>
            <p className="text-sm text-ink-soft mt-1 whitespace-pre-line leading-relaxed">{s.value}</p>
          </Card>
        ))}
        {c?.cvUrl && (
          <Card className="p-4">
            <h2 className="font-bold mb-2">Hoja de vida</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.cvUrl} alt={`Hoja de vida de ${user.name}`} className="w-full rounded-xl border border-line" />
          </Card>
        )}
        {!sections.length && !c?.cvUrl && (
          <p className="text-sm text-ink-soft">Esta persona aún no ha completado su perfil laboral. Puedes contactarla directamente.</p>
        )}
        <p className="text-xs text-ink-faint">
          Usa estos datos solo para este proceso de selección (Ley 1581 de 2012).
        </p>
      </div>
    </div>
  );
}
