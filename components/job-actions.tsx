"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Check } from "lucide-react";
import { Button } from "./ui";
import { setJobStateAction } from "@/lib/actions/modules";

export function JobActions({
  jobId,
  initialSaved,
  initialApplied,
  isAuthed,
  hasProfile,
}: {
  jobId: string;
  initialSaved: boolean;
  initialApplied: boolean;
  isAuthed: boolean;
  /** Si ya llenó su perfil laboral (lo que verá el empleador). */
  hasProfile: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState({ saved: initialSaved, applied: initialApplied });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function update(next: { saved: boolean; applied: boolean }) {
    if (!isAuthed) {
      router.push(`/login?next=/empleo/${jobId}`);
      return;
    }
    const previous = state;
    setError(null);
    setState(next);
    start(async () => {
      const r = await setJobStateAction(jobId, next);
      if (r.error) {
        setState(previous);
        setError(r.error);
      }
    });
  }

  function toggleSave() {
    // Quitarla de guardados retira la postulación: se confirma para no hacerlo por accidente.
    if (state.applied && !window.confirm("¿Retirar tu postulación? El empleador dejará de ver tu perfil.")) return;
    update({ saved: !state.saved, applied: false });
  }

  return (
    <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-line p-3 space-y-2">
      {error && <p className="text-sm text-danger bg-danger/10 rounded-xl px-3 py-2">{error}</p>}
      <p className="text-xs text-ink-soft px-1">
        {state.applied
          ? "El empleador ya puede ver tu perfil y tus datos de contacto."
          : "Al postularte, el empleador verá tu nombre, tus datos de contacto y tu perfil laboral."}
        {isAuthed && !hasProfile && (
          <>
            {" "}
            <Link href="/empleo/perfil" className="font-semibold text-brand-strong underline">
              Completa tu perfil laboral
            </Link>
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={toggleSave}
          disabled={pending}
          variant="outline"
          size="lg"
          className="px-4"
          aria-label={state.applied ? "Retirar postulación" : state.saved ? "Quitar de guardadas" : "Guardar vacante"}
        >
          <Bookmark size={18} className={state.saved ? "fill-ink" : ""} />
        </Button>
        {state.applied ? (
          <Button size="lg" className="flex-1 bg-success text-white" disabled>
            <Check size={18} /> Postulación enviada
          </Button>
        ) : (
          <Button size="lg" className="flex-1" disabled={pending} onClick={() => update({ saved: true, applied: true })}>
            Postularme
          </Button>
        )}
      </div>
    </div>
  );
}
