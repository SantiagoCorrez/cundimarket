import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

/** Error de una postulación; el mensaje se muestra al usuario. */
export class ApplicationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Clave del aviso de una postulación (ver limpieza en listings.ts y account.ts). */
const applicationKey = (jobId: string, userId: string) => `application:${jobId}:${userId}`;

/**
 * Fija el estado de una vacante para el usuario: guardada y/o postulado. Es idempotente (la app puede
 * reenviarlo tras estar sin conexión): solo avisa al empleador cuando pasa a estar postulado.
 * Quitarla de guardados también retira la postulación y el empleador deja de ver el perfil.
 */
export async function setJobState(
  user: { id: string; name: string },
  jobId: string,
  state: { saved: boolean; applied: boolean },
) {
  if (!state.saved) {
    await prisma.savedJob.deleteMany({ where: { userId: user.id, jobId } });
    return;
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new ApplicationError("Esta vacante ya no existe.", 404);
  if (state.applied && job.userId === user.id) {
    throw new ApplicationError("No puedes postularte a tu propia vacante.", 400);
  }
  if (state.applied && !job.active) {
    throw new ApplicationError("Esta vacante ya no recibe postulaciones.", 409);
  }

  const key = { userId_jobId: { userId: user.id, jobId } };
  const saved = await prisma.savedJob.upsert({ where: key, create: { userId: user.id, jobId }, update: {} });
  if (!state.applied) return;

  // Condicionado a applied=false: si llegan dos peticiones a la vez, solo una avisa.
  const { count } = await prisma.savedJob.updateMany({
    where: { id: saved.id, applied: false },
    data: { applied: true, appliedAt: new Date(), viewedAt: null },
  });
  if (!count) return;

  await notifyUser(job.userId, {
    type: "JOB_APPLICATION",
    title: "Nueva postulación",
    body: `${user.name} se postuló a «${job.title}». Revisa su perfil.`,
    pushBody: `Alguien se postuló a «${job.title}». Toca para revisar su perfil.`,
    href: `/empleo/${jobId}/postulaciones/${saved.id}`,
    dedupeKey: applicationKey(jobId, user.id),
  });
}

const applicantSelect = {
  id: true,
  appliedAt: true,
  viewedAt: true,
  user: {
    select: {
      name: true,
      email: true,
      phone: true,
      municipality: true,
      avatarUrl: true,
      candidate: { select: { experience: true, skills: true, education: true } },
    },
  },
} as const;

/** Vacante con verificación de que pertenece al usuario: solo quien la publicó ve a sus postulantes. */
async function ownedJob(jobId: string, employerId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, companyName: true, userId: true },
  });
  return job && job.userId === employerId ? { id: job.id, title: job.title, companyName: job.companyName } : null;
}

/** Postulantes de una vacante (sin la hoja de vida, que puede pesar). null si no es del empleador. */
export async function listApplicants(jobId: string, employerId: string) {
  const job = await ownedJob(jobId, employerId);
  if (!job) return null;
  const applicants = await prisma.savedJob.findMany({
    where: { jobId, applied: true },
    orderBy: { appliedAt: "desc" },
    select: applicantSelect,
  });
  return { job, applicants };
}

/** Perfil de un postulante, con su hoja de vida. Lo marca como revisado. null si no existe o no es del empleador. */
export async function getApplicant(jobId: string, applicationId: string, employerId: string) {
  const job = await ownedJob(jobId, employerId);
  if (!job) return null;
  const applicant = await prisma.savedJob.findFirst({
    where: { id: applicationId, jobId, applied: true },
    select: {
      ...applicantSelect,
      user: {
        select: {
          ...applicantSelect.user.select,
          candidate: { select: { ...applicantSelect.user.select.candidate.select, cvUrl: true } },
        },
      },
    },
  });
  if (!applicant) return null;
  if (!applicant.viewedAt) {
    await prisma.savedJob.updateMany({ where: { id: applicationId, viewedAt: null }, data: { viewedAt: new Date() } });
  }
  const candidate = applicant.user.candidate;
  return {
    job,
    applicant: {
      ...applicant,
      user: {
        ...applicant.user,
        candidate: candidate && { ...candidate, cvUrl: isCvImage(candidate.cvUrl) ? candidate.cvUrl : null },
      },
    },
  };
}

/** La hoja de vida se guarda como imagen: no se acepta ni se muestra ningún otro contenido. */
export function isCvImage(value: string | null | undefined): value is string {
  return !!value && /^data:image\/(jpeg|png|webp);base64,/.test(value);
}

export type CandidateInput = { experience: string; skills: string; education: string; cvUrl?: string };

export async function saveCandidate(userId: string, input: CandidateInput) {
  const clean = (v: string, max: number) => v.trim().slice(0, max) || null;
  const data = {
    experience: clean(input.experience, 4000),
    skills: clean(input.skills, 1000),
    education: clean(input.education, 1000),
    ...(isCvImage(input.cvUrl) ? { cvUrl: input.cvUrl } : {}),
  };
  await prisma.candidateProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}
