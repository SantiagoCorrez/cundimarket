import { MUNICIPALITIES, PILOT_MUNICIPALITY } from "@/lib/taxonomy";

/**
 * Opciones de un <select> con todos los municipios de Cundinamarca.
 * Solo el municipio habilitado se puede elegir al publicar; el resto aparece como "próximamente".
 * `current` conserva seleccionable el valor de una publicación existente (al editar).
 */
export function MunicipalityOptions({ current }: { current?: string }) {
  return (
    <>
      {MUNICIPALITIES.map((m) => {
        const enabled = m === PILOT_MUNICIPALITY || m === current;
        return (
          <option key={m} value={m} disabled={!enabled}>
            {m}
            {m === PILOT_MUNICIPALITY ? "" : " (próximamente)"}
          </option>
        );
      })}
    </>
  );
}
