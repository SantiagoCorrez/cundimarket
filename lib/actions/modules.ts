"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canManageListing, deleteJobListing, deleteServiceListing } from "@/lib/listings";
import { publishableMunicipality } from "@/lib/taxonomy";

function num(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? "").replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Solo los usuarios "Tengo un negocio" (MERCHANT) o ADMIN pueden publicar. */
function canPublish(role: string) {
  return role === "MERCHANT" || role === "ADMIN";
}

/* ---------------- CundiEspacios ---------------- */
export async function createProperty(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/espacios/nuevo");
  if (!canPublish(session!.role)) redirect("/espacios/nuevo");

  const photos = formData.getAll("photos").map(String).filter(Boolean);
  const prop = await prisma.property.create({
    data: {
      userId: session!.id,
      offerType: String(formData.get("offerType") || "RENT"),
      propertyType: String(formData.get("propertyType") || "Apartamento"),
      municipality: publishableMunicipality(String(formData.get("municipality") || "")),
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
      ownerName: String(formData.get("ownerName") || session!.name),
      phone: String(formData.get("phone") || ""),
      whatsapp: String(formData.get("whatsapp") || "") || null,
      photos: { create: photos.map((url) => ({ url })) },
    },
  });
  revalidatePath("/espacios");
  redirect(`/espacios/${prop.id}`);
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

export async function toggleSaveJob(jobId: string, applied = false) {
  const session = await getSession();
  if (!session) return { error: "Inicia sesión." };
  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.id, jobId } },
  });
  if (existing && !applied) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else if (existing && applied) {
    await prisma.savedJob.update({ where: { id: existing.id }, data: { applied: true } });
  } else {
    await prisma.savedJob.create({ data: { userId: session.id, jobId, applied } });
  }
  revalidatePath(`/empleo/${jobId}`);
  return { ok: true };
}

export async function saveCandidateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?next=/empleo/perfil");
  const cv = formData.getAll("cv").map(String).filter(Boolean)[0] || undefined;
  const data = {
    experience: String(formData.get("experience") || "") || null,
    skills: String(formData.get("skills") || "") || null,
    education: String(formData.get("education") || "") || null,
    ...(cv ? { cvUrl: cv } : {}),
  };
  await prisma.candidateProfile.upsert({
    where: { userId: session!.id },
    create: { userId: session!.id, ...data },
    update: data,
  });
  revalidatePath("/empleo/perfil");
  redirect("/empleo");
}
