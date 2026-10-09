type Place = {
  address?: string | null;
  neighborhood?: string | null;
  municipality?: string | null;
  lat?: number | null;
  lng?: number | null;
};

/** Enlace de Google Maps con la ruta hacia el lugar (usa coordenadas si existen, si no la dirección). */
export function directionsUrl(place: Place) {
  const destination =
    place.lat != null && place.lng != null
      ? `${place.lat},${place.lng}`
      : [place.address, place.neighborhood, place.municipality, "Cundinamarca", "Colombia"]
          .filter(Boolean)
          .join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
