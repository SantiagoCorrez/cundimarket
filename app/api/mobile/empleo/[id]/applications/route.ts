import { listApplicants } from "@/lib/applications";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";

/** Postulantes de una vacante: solo para quien la publicó. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const { id } = await params;
  const result = await listApplicants(id, session.id);
  return result ? json(result) : apiError("Vacante no encontrada.", 404);
}
