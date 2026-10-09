import { prisma } from "@/lib/prisma";
import { signAuthToken, type Role } from "@/lib/auth";
import { requireUser, isErrorResponse, json, apiError } from "@/lib/api";
import { MUNICIPALITIES } from "@/lib/taxonomy";

/** Cambia el municipio de la cuenta (también sirve para dejar registrado el interés en un municipio aún no habilitado). */
export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;

  const body = await req.json().catch(() => null);
  const municipality = String(body?.municipality || "");
  if (!MUNICIPALITIES.includes(municipality)) return apiError("Municipio inválido.");

  const user = await prisma.user.update({ where: { id: session.id }, data: { municipality } });
  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  };
  const token = await signAuthToken(sessionUser);
  return json({ token, user: { ...sessionUser, phone: user.phone, avatarUrl: user.avatarUrl } });
}
