"use client";

import { useState } from "react";
import { MapPin, Repeat, Check } from "lucide-react";
import { Card, Select, Button } from "@/components/ui";
import { ComingSoonSheet } from "@/components/coming-soon-sheet";
import { MUNICIPALITIES, PILOT_MUNICIPALITY, USER_TYPES } from "@/lib/taxonomy";
import { updateMunicipalityAction, switchUserTypeAction } from "@/lib/actions/auth";

type Role = "CITIZEN" | "MERCHANT" | "ADMIN";

export function ProfileSettings({
  role,
  municipality,
}: {
  role: Role;
  municipality: string;
}) {
  const [muni, setMuni] = useState(municipality);
  const [soonFor, setSoonFor] = useState<string | null>(null);
  const isMerchant = role === "MERCHANT";
  const target = isMerchant ? "CITIZEN" : "MERCHANT";

  return (
    <section className="p-4 space-y-3">
      <h2 className="font-bold">Ajustes de la cuenta</h2>

      {/* Cambiar municipio */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-2xl bg-bg grid place-items-center">
            <MapPin size={18} className="text-ink" />
          </span>
          <div>
            <p className="font-semibold text-ink">Municipio</p>
            <p className="text-xs text-ink-soft">Cambia el municipio de tu cuenta.</p>
          </div>
        </div>
        <form action={updateMunicipalityAction} className="flex gap-2">
          <Select
            name="municipality"
            value={muni}
            onChange={(e) => {
              const value = e.target.value;
              if (value === PILOT_MUNICIPALITY) setMuni(value);
              else setSoonFor(value);
            }}
            className="flex-1"
          >
            {MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
                {m === PILOT_MUNICIPALITY ? "" : " (próximamente)"}
              </option>
            ))}
          </Select>
          <Button size="md" disabled={muni === municipality}>
            <Check size={16} /> Guardar
          </Button>
        </form>
      </Card>

      <ComingSoonSheet municipality={soonFor} onChooseAnother={() => setSoonFor(null)}>
        <form action={updateMunicipalityAction}>
          <input type="hidden" name="municipality" value={soonFor ?? ""} />
          <Button size="lg" className="w-full">
            Avisarme cuando esté disponible
          </Button>
        </form>
      </ComingSoonSheet>

      {/* Cambiar tipo principal (no aplica a admin) */}
      {role !== "ADMIN" && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-bg grid place-items-center">
              <Repeat size={18} className="text-ink" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">Tipo de usuario</p>
              <p className="text-xs text-ink-soft">
                Actualmente:{" "}
                <b className="text-ink">
                  {USER_TYPES[isMerchant ? "MERCHANT" : "CITIZEN"].emoji}{" "}
                  {USER_TYPES[isMerchant ? "MERCHANT" : "CITIZEN"].label}
                </b>
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-soft">
            {isMerchant
              ? "Como negocio puedes publicar en todos los módulos. Si cambias a “Quiero descubrir” solo podrás explorar y comentar."
              : "Cambia a “Tengo un negocio” para poder publicar negocios, inmuebles, servicios y vacantes."}
          </p>
          <form action={switchUserTypeAction}>
            <input type="hidden" name="role" value={target} />
            <Button variant="outline" size="md" className="w-full">
              {USER_TYPES[target].emoji} Cambiar a “{USER_TYPES[target].label}”
            </Button>
          </form>
        </Card>
      )}
    </section>
  );
}
