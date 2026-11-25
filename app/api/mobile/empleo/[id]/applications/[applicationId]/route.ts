import { getApplicant } from "@/lib/applications";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

/** Perfil de un postulante: solo para quien publicó la vacante. Lo marca como revisado. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; applicationId: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id, applicationId } = await params;
  const result = await getApplicant(id, applicationId, session.id);
  return result ? json(result) : apiError("Esta postulación ya no está disponible.", 404);
}
