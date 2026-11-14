import { Phone } from "lucide-react";
import { BackBar } from "@/components/nav";
import { SectionTitle } from "@/components/ui";
import { EmergencyList } from "@/components/emergency-list";
import { MunicipalitySwitcher } from "@/components/municipality-switcher";
import { getSession } from "@/lib/auth";
import { emergencyDirectory } from "@/lib/emergency";
import { normalizeMunicipality } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function EmergencyPage({ searchParams }: { searchParams: Promise<{ municipio?: string }> }) {
  const { municipio } = await searchParams;
  const session = await getSession();
  const municipality = normalizeMunicipality(municipio, session?.municipality);
  const { local, departmental, national } = await emergencyDirectory(municipality);

  return (
    <div>
      <BackBar title="Canales de atención" />
      <div className="p-4 space-y-5">
        <a
          href="tel:123"
          className="flex items-center gap-3 rounded-2xl bg-danger text-white p-4 active:scale-[.99] transition"
        >
          <span className="h-12 w-12 rounded-full bg-white/20 grid place-items-center">
            <Phone size={22} />
          </span>
          <span>
            <span className="block text-lg font-extrabold">Emergencias: 123</span>
            <span className="block text-sm text-white/85">Línea única para Policía, ambulancia y bomberos</span>
          </span>
        </a>

        <MunicipalitySwitcher basePath="/emergency" current={municipality} />

        <section className="space-y-2.5">
          <SectionTitle>Líneas de {municipality}</SectionTitle>
          {local.length ? (
            <EmergencyList contacts={local} />
          ) : (
            <p className="text-sm text-ink-soft px-1">No hay líneas propias publicadas para este municipio. Usa la línea 123.</p>
          )}
        </section>

        <section className="space-y-2.5">
          <SectionTitle>Gobernación de Cundinamarca</SectionTitle>
          <EmergencyList contacts={departmental} />
        </section>

        <section className="space-y-2.5">
          <SectionTitle>Líneas nacionales</SectionTitle>
          <EmergencyList contacts={national} />
        </section>

        <p className="text-xs text-ink-faint px-1">
          Fuentes: directorios oficiales de la Policía Nacional, Bomberos, ESE, alcaldías y Gobernación de Cundinamarca
          (consulta 12 de noviembre de 2026). Si un número no responde, llama al 123.
        </p>
      </div>
    </div>
  );
}
