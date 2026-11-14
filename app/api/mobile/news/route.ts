import { getSessionFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";
import { municipalityNews } from "@/lib/news-sync";
import { normalizeMunicipality } from "@/lib/taxonomy";

/** Noticias de la alcaldía del municipio pedido (?municipality=), o del de la sesión. */
export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  const requested = new URL(req.url).searchParams.get("municipality");
  const municipality = normalizeMunicipality(requested, session?.municipality);
  return json(await municipalityNews(municipality));
}
