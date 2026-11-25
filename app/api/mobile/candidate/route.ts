import { prisma } from "@/lib/prisma";
import { saveCandidate } from "@/lib/applications";
import { requireUser, isErrorResponse, json } from "@/lib/api";

/** Perfil laboral del usuario. */
export async function GET(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: session.id } });
  return json({
    candidate: {
      experience: candidate?.experience ?? "",
      skills: candidate?.skills ?? "",
      education: candidate?.education ?? "",
      hasCv: !!candidate?.cvUrl,
    },
  });
}

export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const body = await req.json().catch(() => null);
  await saveCandidate(session.id, {
    experience: String(body?.experience ?? ""),
    skills: String(body?.skills ?? ""),
    education: String(body?.education ?? ""),
  });
  return json({ ok: true });
}
