"use client";

import { Sheet } from "@/components/sheet";
import { Button } from "@/components/ui";
import { COMING_SOON } from "@/lib/taxonomy";

/**
 * Aviso informativo "Próximamente" para municipios que aún no están habilitados.
 * No es un error ni bloquea el registro: ofrece continuar o volver a elegir municipio.
 */
export function ComingSoonSheet({
  municipality,
  onChooseAnother,
  children,
}: {
  municipality: string | null;
  onChooseAnother: () => void;
  /** Acción principal (p. ej. un botón "Registrarme" o un formulario que guarda el municipio). */
  children: React.ReactNode;
}) {
  return (
    <Sheet open={!!municipality} onClose={onChooseAnother}>
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold leading-snug">{COMING_SOON.title}</h3>
        <span className="inline-block rounded-full bg-bg px-3 py-1 text-sm font-semibold text-ink">
          {municipality}
        </span>
        <p className="text-sm text-ink-soft leading-relaxed">{COMING_SOON.body}</p>
        <div className="space-y-2 pt-1">
          {children}
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={onChooseAnother}>
            Elegir otro municipio
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
