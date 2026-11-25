"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ApplicationError, saveCandidate, setJobState } from "@/lib/applications";
import { canManageListing, deleteJobListing, deletePropertyListing, deleteServiceListing } from "@/lib/listings";
import { PROPERTY_STATUSES, publishableMunicipality } from "@/lib/taxonomy";

function num(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? "").replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Solo los usuarios "Tengo un negocio" (MERCHANT) o ADMIN pueden publicar. */
function canPublish(role: string) {
  return role === "MERCHANT" || role === "ADMIN";
}

/* ---------------- CundiEspacios ---------------- */
function propertyData(formData: FormData, fallbackName: string, keepMunicipality?: string) {
  return {
    offerType: String(formData.get("offerType") || "RENT"),
    propertyType: String(formData.get("propertyType") || "Apartamento"),
    municipality: publishableMunicipality(String(formData.get("municipality") || ""), keepMunicipality),
    neighborhood: String(formData.get("neighborhood") || "") || null,
    address: String(formData.get("address") || "") || null,
    area: num(formData.get("area")),
    rooms: num(formData.get("rooms")),
    bathrooms: num(formData.get("bathrooms")),
    parking: formData.get("parking") === "on",
    stratum: num(formData.get("stratum")),
    price: num(formData.get("price")),
    description: String(formData.get("description") || ""),
    services: String(formData.get("services") || "") || null,
    ownerName: String(formData.get("ownerName") || fallbackName),
    phone: String(formData.get("phone") || ""),
    whatsapp: String(formData.get("whatsapp") || "") || null,
  };
}

async function requirePropertyManager(id: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/espacios/${id}/editar`);
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) redirect("/mis-publicaciones");
  if (!canManageListing(property!.userId, session!)) redirect(`/espacios/${id}`);
  return { session: session!, property: property! };
}

function revalidateProperty(id: string) {
  revalidatePath("/espacios");
  revalidatePath(`/espacios/${id}`);
  revalidatePath("/mis-publicaciones");
  revalidatePath("/admin/espacios");
  revalidatePath("/admin/reportes");
}

export async function createProperty(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/espacios/nuevo");
  if (!canPublish(session!.role)) redirect("/espacios/nuevo");

  const photos = formData.getAll("photos").map(String).filter(Boolean);
  const prop = await prisma.property.create({
    data: {
      userId: session!.id,
      ...propertyData(formData, session!.name),
      photos: { create: photos.map((url) => ({ url })) },
    },
  });
  revalidatePath("/espacios");
  redirect(`/espacios/${prop.id}`);
}

export async function updateProperty(formData: FormData) {
  const id = String(formData.get("id") || "");
  const { session, property } = await requirePropertyManager(id);

  const data = propertyData(formData, property.ownerName, property.municipality);
  const status = String(formData.get("status") || "");
  // Las fotos que llegan en el formulario son el conjunto final.
  const photos = formData.getAll("photos").map(String).filter(Boolean);
  // Si el anunciante cambia la ubicación de un inmueble verificado, debe volver a verificarse.
  const moved =
    data.address !== property.address ||
    data.neighborhood !== property.neighborhood ||
    data.municipality !== property.municipality;

  await prisma.$transaction([
    prisma.propertyPhoto.deleteMany({ where: { propertyId: id } }),
    prisma.property.update({
      where: { id },
      data: {
        ...data,
        status: PROPERTY_STATUSES.some((s) => s.key === status) ? status : property.status,
        ...(moved && session.role !== "ADMIN" ? { verified: false } : {}),
        photos: { create: photos.map((url) => ({ url })) },
      },
    }),
  ]);
  revalidateProperty(id);
  redirect(`/espacios/${id}`);
}

/** Cambia el estado del anuncio (disponible, reservado, cerrado) sin abrir el formulario. */
export async function setPropertyStatus(id: string, status: string) {
  await requirePropertyManager(id);
  if (!PROPERTY_STATUSES.some((s) => s.key === status)) return;
  await prisma.property.update({ where: { id }, data: { status } });
  revalidateProperty(id);
}

/** Marca o desmarca un inmueble como verificado (solo administradores). */
export async function setPropertyVerified(id: string, verified: boolean) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login?next=/admin/espacios");
  await prisma.property.update({ where: { id }, data: { verified } });
  revalidateProperty(id);
}

export async function deleteProperty(id: string, from?: DeleteReturn) {
  const { session } = await requirePropertyManager(id);
  await deletePropertyListing(id);
  revalidateProperty(id);
  redirect(afterDelete(from, session.role, "/admin/espacios"));
}

/* ---------------- CundiServicios ---------------- */
function serviceData(formData: FormData, fallbackName: string, keepMunicipality?: string) {
  return {
    providerName: String(formData.get("providerName") || fallbackName),
    category: String(formData.get("category") || "hogar"),
    serviceType: String(formData.get("serviceType") || ""),
    municipality: publishableMunicipality(String(formData.get("municipality") || ""), keepMunicipality),
    coverageZone: String(formData.get("coverageZone") || "") || null,
    description: String(formData.get("description") || ""),
    yearsExperience: num(formData.get("yearsExperience")),
    phone: String(formData.get("phone") || ""),
    whatsapp: String(formData.get("whatsapp") || "") || null,
  };
}

async function requireServiceManager(id: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/servicios/${id}/editar`);
  const service = await prisma.serviceProvider.findUnique({ where: { id } });
  if (!service) redirect("/mis-publicaciones");
  if (!canManageListing(service!.userId, session!)) redirect(`/servicios/${id}`);
  return { session: session!, service: service! };
}

export async function createService(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/servicios/nuevo");
  if (!canPublish(session!.role)) redirect("/servicios/nuevo");

  const photos = formData.getAll("photos").map(String).filter(Boolean);
  const sp = await prisma.serviceProvider.create({
    data: {
      userId: session!.id,
      ...serviceData(formData, session!.name),
      photoUrl: photos[0] || null,
      photos: { create: photos.slice(1).map((url) => ({ url })) },
    },
  });
  revalidatePath("/servicios");
  redirect(`/servicios/${sp.id}`);
}

export async function updateService(formData: FormData) {
  const id = String(formData.get("id") || "");
  const { service } = await requireServiceManager(id);

  // Las fotos que llegan en el formulario son el conjunto final: la primera es la principal.
  const photos = formData.getAll("photos").map(String).filter(Boolean);
  await prisma.$transaction([
    prisma.servicePhoto.deleteMany({ where: { providerId: id } }),
    prisma.serviceProvider.update({
      where: { id },
      data: {
        ...serviceData(formData, service.providerName, service.municipality),
        photoUrl: photos[0] || null,
        photos: { create: photos.slice(1).map((url) => ({ url })) },
      },
    }),
  ]);
  revalidatePath("/servicios");
  revalidatePath(`/servicios/${id}`);
  revalidatePath("/mis-publicaciones");
  redirect(`/servicios/${id}`);
}

/** A dónde volver tras eliminar: mis publicaciones, el listado del panel de admin o los reportes (solo admin). */
export type DeleteReturn = "mine" | "admin" | "reports";

function afterDelete(from: DeleteReturn | undefined, role: string, adminList: string) {
  if (role === "ADMIN" && from === "admin") return adminList;
  if (role === "ADMIN" && from === "reports") return "/admin/reportes";
  return "/mis-publicaciones";
}

export async function deleteService(id: string, from?: DeleteReturn) {
  const { session } = await requireServiceManager(id);
  await deleteServiceListing(id);
  revalidatePath("/servicios");
  revalidatePath("/mis-publicaciones");
  revalidatePath("/admin/servicios");
  revalidatePath("/admin/reportes");
  redirect(afterDelete(from, session.role, "/admin/servicios"));
}

/* ---------------- CundiEmpleo ---------------- */
function jobData(formData: FormData, keepMunicipality?: string) {
  return {
    companyName: String(formData.get("companyName") || ""),
    sector: String(formData.get("sector") || "Comercio"),
    title: String(formData.get("title") || ""),
    contractType: String(formData.get("contractType") || "Tiempo completo"),
    workday: String(formData.get("workday") || "") || null,
    salary: num(formData.get("salary")),
    functions: String(formData.get("functions") || ""),
    requirements: String(formData.get("requirements") || ""),
    experience: String(formData.get("experience") || "") || null,
    municipality: publishableMunicipality(String(formData.get("municipality") || ""), keepMunicipality),
    address: String(formData.get("address") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
  };
}

async function requireJobManager(id: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/empleo/${id}/editar`);
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) redirect("/mis-publicaciones");
  if (!canManageListing(job!.userId, session!)) redirect(`/empleo/${id}`);
  return { session: session!, job: job! };
}

export async function createJob(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/empleo/nuevo");
  if (!canPublish(session!.role)) redirect("/empleo/nuevo");

  const job = await prisma.job.create({ data: { userId: session!.id, ...jobData(formData) } });
  revalidatePath("/empleo");
  redirect(`/empleo/${job.id}`);
}

export async function updateJob(formData: FormData) {
  const id = String(formData.get("id") || "");
  const { job } = await requireJobManager(id);

  // "active" permite pausar la vacante sin borrarla (deja de aparecer en los listados).
  await prisma.job.update({
    where: { id },
    data: { ...jobData(formData, job.municipality), active: formData.get("active") === "on" },
  });
  revalidatePath("/empleo");
  revalidatePath(`/empleo/${id}`);
  revalidatePath("/mis-publicaciones");
  redirect(`/empleo/${id}`);
}

export async function deleteJob(id: string, from?: DeleteReturn) {
  const { session } = await requireJobManager(id);
  await deleteJobListing(id);
  revalidatePath("/empleo");
  revalidatePath("/mis-publicaciones");
  revalidatePath("/admin/empleos");
  revalidatePath("/admin/reportes");
  redirect(afterDelete(from, session.role, "/admin/empleos"));
}

/** Guarda la vacante, se postula o retira la postulación (ver lib/applications.ts). */
export async function setJobStateAction(jobId: string, state: { saved: boolean; applied: boolean }) {
  const session = await getSession();
  if (!session) return { error: "Inicia sesión." };
  try {
    await setJobState(session, jobId, state);
  } catch (error) {
    if (error instanceof ApplicationError) return { error: error.message };
    throw error;
  }
  revalidatePath(`/empleo/${jobId}`);
  return { ok: true };
}

export async function saveCandidateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/empleo/perfil");
  await saveCandidate(session!.id, {
    experience: String(formData.get("experience") || ""),
    skills: String(formData.get("skills") || ""),
    education: String(formData.get("education") || ""),
    cvUrl: formData.getAll("cv").map(String).filter(Boolean)[0],
  });
  revalidatePath("/empleo/perfil");
  redirect("/empleo");
}
