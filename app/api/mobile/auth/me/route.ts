import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { json, apiError } from "@/lib/api";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("No autenticado.", 401);

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return apiError("Usuario no encontrado.", 404);

  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      municipality: user.municipality,
      avatarUrl: user.avatarUrl,
    },
  });
}
