import { NextResponse } from "next/server";
import { getSessionFromRequest, type SessionUser } from "@/lib/auth";

// CORS para estas rutas lo agrega middleware.ts (aplica a toda /api/mobile/*).
export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function apiError(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function requireUser(req: Request): Promise<SessionUser | NextResponse> {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Inicia sesión para continuar.", 401);
  return session;
}

export function isErrorResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
