import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Button, Field, Input } from "@/components/ui";
import { createContact, deleteContact } from "@/lib/actions/admin";
import { MUNICIPALITIES, PILOT_MUNICIPALITY } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** "Colombia" = líneas nacionales, "Cundinamarca" = departamentales; el resto, municipios. */
const GROUPS = ["Colombia", "Cundinamarca", ...MUNICIPALITIES];
const label = (g: string) => (g === "Colombia" ? "Nacionales" : g === "Cundinamarca" ? "Gobernación" : g);

export default async function AdminContactsPage({ searchParams }: { searchParams: Promise<{ municipio?: string }> }) {
  const { municipio } = await searchParams;
  const group = municipio && GROUPS.includes(municipio) ? municipio : PILOT_MUNICIPALITY;
  const contacts = await prisma.emergencyContact.findMany({ where: { municipality: group }, orderBy: { order: "asc" } });

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <h1 className="text-2xl font-extrabold">Canales de atención</h1>
      <p className="text-ink-soft text-sm mt-1">
        Líneas que ve el ciudadano según su municipio, más las de la Gobernación y las nacionales.
      </p>

      <form className="mt-4 flex gap-2 items-end" action="/admin/contactos">
        <Field label="Ver líneas de">
          <select name="municipio" defaultValue={group} className="h-11 rounded-2xl border border-line bg-surface px-3 text-[15px]">
            {GROUPS.map((g) => (
              <option key={g} value={g}>{label(g)}</option>
            ))}
          </select>
        </Field>
        <Button variant="outline">Ver</Button>
      </form>
      <div className="flex gap-2 mt-3">
        {["Colombia", "Cundinamarca", PILOT_MUNICIPALITY].map((g) => (
          <Link
            key={g}
            href={`/admin/contactos?municipio=${encodeURIComponent(g)}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium border",
              g === group ? "bg-ink text-white border-ink" : "bg-surface border-line text-ink-soft",
            )}
          >
            {label(g)}
          </Link>
        ))}
      </div>

      <Card className="p-4 mt-4">
        <p className="text-sm font-semibold mb-3">Agregar línea · {label(group)}</p>
        <form action={createContact} className="grid sm:grid-cols-[5rem_1fr_1fr] gap-3 items-end">
          <input type="hidden" name="municipality" value={group} />
          <Field label="Ícono"><Input name="icon" placeholder="🚓" defaultValue="📞" /></Field>
          <Field label="Servicio"><Input name="name" placeholder="Ej: Bomberos" required /></Field>
          <Field label="Teléfono(s)"><Input name="phone" placeholder="601 000 0000 / 300 000 0000" /></Field>
          <div className="sm:col-span-2">
            <Field label="Detalle (opcional)"><Input name="detail" placeholder="Ej: Estación central" /></Field>
          </div>
          <Button>Agregar</Button>
        </form>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        {contacts.length === 0 && <p className="text-sm text-ink-soft">No hay líneas registradas.</p>}
        {contacts.map((c) => (
          <Card key={c.id} className="p-3 flex items-start gap-3">
            <span className="h-11 w-11 shrink-0 rounded-2xl bg-danger/12 grid place-items-center text-2xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{c.name}</p>
              {c.detail && <p className="text-xs text-ink-soft">{c.detail}</p>}
              <p className="text-sm text-ink-soft">{c.phone || "Sin teléfono"}</p>
            </div>
            <form action={deleteContact.bind(null, c.id)}>
              <Button size="sm" variant="ghost" className="text-danger">Eliminar</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
