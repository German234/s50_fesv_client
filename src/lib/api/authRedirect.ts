// Rutas del login y de `?next=`. Sin dependencias: lo importa también src/proxy.ts.

export const LOGIN_PATH = "/login";
export const PUBLIC_PATHS = [LOGIN_PATH, "/recuperar"];

/** "/emitidos?estado=x" → "/login?next=%2Femitidos%3Festado%3Dx". */
export function loginHref(next: string): string {
  return next === "/" ? LOGIN_PATH : `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}

/** Destino de `?next=` solo si es una ruta interna; evita redirigir a otro sitio (`//x.com`). */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
