import { prisma } from "@/lib/prisma";
import { signAuthToken, verifyPassword, type Role } from "@/lib/auth";
import { json, apiError } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return apiError("Correo y contraseña son requeridos.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError("Correo o contraseña incorrectos.", 401);
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    municipality: user.municipality,
  };
  const token = await signAuthToken(sessionUser);
  return json({ token, user: sessionUser });
}
