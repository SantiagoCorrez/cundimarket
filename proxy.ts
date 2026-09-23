import { NextResponse, type NextRequest } from "next/server";

/**
 * CORS para /api/mobile/*: la app Expo la consume desde un origen distinto
 * (nativo no aplica CORS, pero la build web y el Expo Go/dev server sí).
 * Next.js 16 renombró la convención "middleware.ts" a "proxy.ts".
 */
export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return withCorsHeaders(new NextResponse(null, { status: 204 }));
  }
  return withCorsHeaders(NextResponse.next());
}

function withCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export const config = {
  matcher: "/api/mobile/:path*",
};
