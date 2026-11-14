import { prisma } from "@/lib/prisma";

/**
 * Directorio de líneas de atención de un municipio: las propias del municipio,
 * las de la Gobernación de Cundinamarca y las nacionales (ver prisma/data/emergency-lines.json).
 */
export async function emergencyDirectory(municipality: string) {
  const [local, departmental, national] = await Promise.all([
    prisma.emergencyContact.findMany({ where: { scope: "MUNICIPAL", municipality }, orderBy: { order: "asc" } }),
    prisma.emergencyContact.findMany({ where: { scope: "DEPARTAMENTAL" }, orderBy: { order: "asc" } }),
    prisma.emergencyContact.findMany({ where: { scope: "NACIONAL" }, orderBy: { order: "asc" } }),
  ]);
  return { municipality, local, departmental, national };
}

/** Ámbito de un contacto según el "municipio" con que se guarda. */
export function contactScope(municipality: string) {
  return municipality === "Colombia" ? "NACIONAL" : municipality === "Cundinamarca" ? "DEPARTAMENTAL" : "MUNICIPAL";
}
