import { prisma } from "@/lib/prisma";
import { signAuthToken, hashPassword, type Role } from "@/lib/auth";
import { json, apiError } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const phone = String(body?.phone || "").trim();
  const municipality = String(body?.municipality || "Mosquera");
  const role: Role = body?.role === "MERCHANT" ? "MERCHANT" : "CITIZEN";

  if (!name || !email || password.length < 6) {
    return apiError("Completa todos los campos. La contraseña debe tener mínimo 6 caracteres.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return apiError("Ya existe una cuenta con este correo.");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      municipality,
      role,
      passwordHash: await hashPassword(password),
    },
  });

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
