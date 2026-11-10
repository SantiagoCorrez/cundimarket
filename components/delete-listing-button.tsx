"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { deleteJob, deleteService, type DeleteReturn } from "@/lib/actions/modules";

/** Botón "Eliminar" con confirmación en dos pasos para una vacante o un servicio. */
export function DeleteListingButton({
  kind,
  id,
  title,
  className,
  from,
}: {
  kind: "job" | "service";
  id: string;
  title: string;
  className?: string;
  /** A dónde volver al terminar (los valores "admin" y "reports" solo aplican a un administrador). */
  from?: DeleteReturn;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="outline" className={`text-danger border-danger/30 ${className ?? ""}`} onClick={() => setConfirming(true)}>
        <Trash2 size={16} /> Eliminar
      </Button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirmar eliminación" className="rounded-2xl border border-danger/30 bg-danger/5 p-3 space-y-2 w-full">
      <p className="text-sm text-ink">
        ¿Eliminar <b>{title}</b>? Esta acción no se puede deshacer
        {kind === "job" ? " y se borrarán las postulaciones guardadas." : " y se borrarán sus fotos y calificaciones."}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending}
          onClick={() => start(async () => void (await (kind === "job" ? deleteJob(id, from) : deleteService(id, from))))}
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
