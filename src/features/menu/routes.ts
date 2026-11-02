import { type Country, findSource, findTransmitTab, type SourceText } from "@/config/country";
import type { CountryCode } from "@/config/countryCode";
import type { InboxType } from "@/lib/api/types";

/**
 * Traducción entre las claves de ruta del backend (`Route.path`, lo que trae `menu[].path` de
 * /auth/me y las llaves de /auth/me/permissions) y las rutas del frontend (CLAUDE.md §6).
 * Provisional: lo ideal es que el backend guarde las rutas del frontend (ver docs/progreso.md).
 */

interface ScreenRoute {
  key: string;
  href: string;
  /** La pantalla no existe en este país: el menú la oculta. */
  isAvailable?: (country: Country) => boolean;
}

const SCREEN_ROUTES: ScreenRoute[] = [
  { key: "documents", href: "/emitidos" },
  { key: "customers", href: "/clientes" },
  { key: "correlatives", href: "/correlativos", isAvailable: (country) => country.supportsCorrelativesAdmin },
  { key: "settings/menu-management", href: "/admin/menus" },
  { key: "settings/routes", href: "/admin/rutas" },
  { key: "settings/permissions", href: "/admin/permisos" },
  { key: "settings/users", href: "/admin/usuarios" },
];

/**
 * Bandejas por empresa ("cipsa/fc_ccf"): sufijo → tipo de bandeja de la API. En DO la ruta "se"
 * muestra Compras (e-CF 41), como en RouteKeys del backend; "gm" solo existe en DO.
 */
const INBOX_SUFFIXES: Record<string, Record<CountryCode, InboxType | null>> = {
  fc_ccf: { SV: "fce", DO: "fce" },
  nc: { SV: "nc", DO: "nc" },
  se: { SV: "se", DO: "ce" },
  gm: { SV: null, DO: "gm" },
};

export type ResolvedPath =
  /** Pantalla del frontend; `source` si la entrada fija una fuente (bandejas por empresa). */
  | { kind: "screen"; href: string; source?: string }
  /** Existe en el backend pero no en este país (Correlativos en SV): no se muestra. */
  | { kind: "hidden" }
  /** Sin pantalla conocida en el frontend: se muestra deshabilitada. */
  | { kind: "unknown" };

export function resolveMenuPath(path: string, country: Country): ResolvedPath {
  const screen = SCREEN_ROUTES.find((route) => route.key === path);
  if (screen) {
    return screen.isAvailable && !screen.isAvailable(country) ? { kind: "hidden" } : { kind: "screen", href: screen.href };
  }

  const [prefix, suffix, ...rest] = path.split("/");
  if (rest.length > 0 || !suffix) return { kind: "unknown" };
  const inboxType = INBOX_SUFFIXES[suffix]?.[country.code];
  const source = country.sources.find((s) => s.routePrefix === prefix);
  if (inboxType === null) return { kind: "hidden" };
  const tab = country.transmitTabs.find((t) => t.apiType === inboxType);
  if (!source || !tab) return { kind: "unknown" };
  return { kind: "screen", href: `/transmitir/${tab.slug}`, source: source.code };
}

/**
 * Claves del backend que dan acceso a la ubicación actual: basta con "R" en cualquiera.
 * null = pantalla sin permiso propio (Inicio, detalle de lote, /dev) o desconocida.
 */
export function routeKeysForLocation(pathname: string, source: string, country: Country): string[] | null {
  const screen = SCREEN_ROUTES.find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`));
  if (screen) return [screen.key];

  const match = /^\/transmitir\/([^/]+)$/.exec(pathname);
  if (!match || match[1] === "lotes") return null;
  const tab = findTransmitTab(country, match[1]);
  if (!tab) return null;
  const suffix = Object.keys(INBOX_SUFFIXES).find((key) => INBOX_SUFFIXES[key][country.code] === tab.apiType);
  if (!suffix) return null;

  const single = findSource(country, source);
  const sources: SourceText[] = single ? [single] : country.sources;
  return sources.map((s) => `${s.routePrefix}/${suffix}`);
}

/** Prefijos de ruta que el rol puede leer, para filtrar las fuentes del selector. */
export function readablePrefixes(permissions: Record<string, string>): Set<string> {
  const prefixes = new Set<string>();
  for (const [key, letters] of Object.entries(permissions)) {
    const slash = key.indexOf("/");
    if (slash > 0 && letters.includes("R")) prefixes.add(key.slice(0, slash));
  }
  return prefixes;
}
