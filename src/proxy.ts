import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/features/auth/session";
import { loginHref } from "@/lib/api/authRedirect";

/**
 * Protege (app): sin la cookie de sesión, al login con la ruta original en `?next=`. Es una
 * comprobación optimista (la cookie vence junto con el token); quien valida el token es el
 * backend, y un 401 posterior también vuelve al login (lib/api/client.ts).
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(new URL(loginHref(`${pathname}${search}`), request.url));
}

export const config = {
  // Todo menos las pantallas públicas, /dev, los internos de Next y los archivos estáticos.
  matcher: ["/((?!login|recuperar|dev|api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
