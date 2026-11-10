import { json } from "@/lib/api";

/** Ping liviano: la app lo usa para saber si volvió la conexión con el servidor. */
export async function GET() {
  return json({ ok: true });
}
