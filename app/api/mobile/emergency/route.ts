import { getSessionFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";
import { emergencyDirectory } from "@/lib/emergency";
import { normalizeMunicipality } from "@/lib/taxonomy";

/**
 * Líneas de atención del municipio pedido (?municipality=), o del de la sesión:
 * `local` (del municipio), `departmental` (Gobernación) y `national`.
 * `contacts` mantiene el formato de versiones anteriores de la app (un solo número por fila).
 */
export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  const requested = new URL(req.url).searchParams.get("municipality");
  const municipality = normalizeMunicipality(requested, session?.municipality);
  const directory = await emergencyDirectory(municipality);

  const contacts = directory.local
    .flatMap((c) =>
      c.phone
        .split(/\s*\/\s*/)
        .filter((p) => /^\d/.test(p))
        .map((p, i) => ({ ...c, id: `${c.id}-${i}`, name: c.detail ? `${c.name} · ${c.detail}` : c.name, phone: p.split(/\s*ext/i)[0] })),
    );

  return json({ ...directory, contacts });
}
