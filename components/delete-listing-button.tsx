"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteJob, deleteProperty, deleteService, type DeleteReturn } from "@/lib/actions/modules";

const KINDS = {
  job: { remove: deleteJob, warning: " y se borrarán las postulaciones recibidas." },
  service: { remove: deleteService, warning: " y se borrarán sus fotos y calificaciones." },
  property: { remove: deleteProperty, warning: " y se borrarán sus fotos." },
} as const;

/** Botón "Eliminar" con confirmación en dos pasos para una vacante, un servicio o un inmueble. */
export function DeleteListingButton({
  kind,
  id,
  title,
  className,
  size = "md",
  from,
}: {
  kind: keyof typeof KINDS;
  id: string;
  title: string;
  className?: string;
  size?: "sm" | "md";
  /** A dónde volver al terminar (los valores "admin" y "reports" solo aplican a un administrador). */
  from?: DeleteReturn;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="outline" size={size} className={`!text-danger !border-danger/30 ${className ?? ""}`} onClick={() => setConfirming(true)}>
        <Trash2 size={16} /> Eliminar
      </Button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirmar eliminación" className="rounded-2xl border border-danger/30 bg-danger/5 p-3 space-y-2 w-full">
      <p className="text-sm text-ink">
        ¿Eliminar <b>{title}</b>? Esta acción no se puede deshacer
        {KINDS[kind].warning}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => start(async () => void (await KINDS[kind].remove(id, from)))}
        >
          {pending ? "Eliminando…" : "Sí, eliminar"}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
