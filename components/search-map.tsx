import { MapPin } from "lucide-react";
import { BusinessCard } from "@/components/cards";
import { EmptyState } from "@/components/ui";

type MapBusiness = React.ComponentProps<typeof BusinessCard>["b"];

/**
 * Vista de mapa de la búsqueda: muestra un mapa centrado en el municipio y,
 * debajo, la lista de negocios registrados (verificados) que coinciden.
 * Usa OpenStreetMap embebido (sin llaves de API).
 */
export function SearchMap({
  center,
  municipality,
  businesses,
}: {
  center: { lat: number; lng: number };
  municipality: string;
  businesses: MapBusiness[];
}) {
  const dLat = 0.03;
  const dLng = 0.045;
  const bbox = [
    center.lng - dLng,
    center.lat - dLat,
    center.lng + dLng,
    center.lat + dLat,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <div className="px-4 pt-2 space-y-3">
      <div className="rounded-2xl overflow-hidden border border-line shadow-card">
        <iframe
          title={`Mapa de negocios en ${municipality}`}
          src={src}
          className="w-full h-56 block"
          loading="lazy"
        />
      </div>
      <p className="flex items-center gap-1.5 text-sm text-ink-soft">
        <MapPin size={14} className="text-brand-strong" />
        {businesses.length} {businesses.length === 1 ? "negocio registrado" : "negocios registrados"} en {municipality}
      </p>

      {businesses.length ? (
        <div className="space-y-3">
          {businesses.map((b) => (
            <BusinessCard key={b.id} b={b} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🗺️"
          title="Sin negocios en el mapa"
          subtitle="Aún no hay negocios registrados para esta búsqueda en el municipio."
        />
      )}
    </div>
  );
}
