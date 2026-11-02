"use client";

import { House, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { type Country, type SourceText, useCountry } from "@/config/country";
import { useMyPermissions, useSession } from "@/features/auth/queries";
import type { MenuItemResponse } from "@/lib/api/types";
import { menuIcon } from "./icons";
import { readablePrefixes, resolveMenuPath, routeKeysForLocation } from "./routes";

/**
 * El menú no tiene endpoint propio: llega con /auth/me (useSession). Este módulo lo convierte en
 * la navegación del shell y no define query keys.
 */

export interface NavLink {
  kind: "link";
  id: string;
  label: string;
  icon: LucideIcon;
  /** null: la entrada no tiene pantalla en el frontend y se muestra deshabilitada. */
  href: string | null;
  /** Fuente que fija la entrada (bandejas por empresa). */
  source?: string;
}

export interface NavGroup {
  kind: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

/** Inicio no es una ruta con permisos en el backend: siempre está. */
const HOME: NavLink = { kind: "link", id: "home", label: "Inicio", icon: House, href: "/" };

function toLink(item: MenuItemResponse, idPrefix: string, country: Country): NavLink | null {
  if (!item.path) return null;
  const resolved = resolveMenuPath(item.path, country);
  if (resolved.kind === "hidden") return null;
  return {
    kind: "link",
    id: `${idPrefix}-${item.id}`,
    label: item.name,
    icon: menuIcon(item.icon),
    href: resolved.kind === "screen" ? resolved.href : null,
    source: resolved.kind === "screen" ? resolved.source : undefined,
  };
}

/** Árbol de /auth/me (un nivel de submenú) en el orden del backend, con Inicio al principio. */
export function buildNavigation(menu: MenuItemResponse[], country: Country): NavEntry[] {
  const entries: NavEntry[] = [HOME];
  for (const item of menu) {
    if (item.children.length > 0) {
      const children = item.children.flatMap((child) => toLink(child, "submenu", country) ?? []);
      if (children.length > 0) {
        entries.push({ kind: "group", id: `menu-${item.id}`, label: item.name, icon: menuIcon(item.icon), children });
      }
    } else {
      const link = toLink(item, "menu", country);
      if (link) entries.push(link);
    }
  }
  return entries;
}

export function useNavigation() {
  const country = useCountry();
  const { menu, isLoading, error } = useSession();
  const entries = useMemo(() => buildNavigation(menu, country), [menu, country]);
  return { entries, isLoading, error };
}

/** Sin sesión no consulta: tras cerrar sesión, un refetch sin token daría 401 y redirigiría con ?next=. */
function useSessionPermissions() {
  const { isAuthenticated } = useSession();
  return useMyPermissions({ enabled: isAuthenticated });
}

/** Fuentes del diccionario que el rol puede leer (alguna bandeja con "R"). */
export function useAllowedSources(): { sources: SourceText[]; isLoading: boolean } {
  const country = useCountry();
  const permissions = useSessionPermissions();
  const sources = useMemo(() => {
    if (!permissions.data) return [];
    const prefixes = readablePrefixes(permissions.data);
    return country.sources.filter((source) => prefixes.has(source.routePrefix));
  }, [country.sources, permissions.data]);
  return { sources, isLoading: permissions.isPending };
}

export type RouteAccess = "allowed" | "forbidden" | "loading";

/**
 * Si el rol puede leer la pantalla actual, según /auth/me/permissions. Solo decide qué mostrar:
 * quien autoriza es el backend, y su 403 en cada llamada también lleva a "sin acceso".
 */
export function useRouteAccess(pathname: string, source: string): RouteAccess {
  const country = useCountry();
  const permissions = useSessionPermissions();
  const keys = routeKeysForLocation(pathname, source, country);
  if (keys === null) return "allowed";
  if (permissions.isPending) return "loading";
  // Sin el mapa (error de red o 5xx) se deja pasar: la pantalla mostrará el error de su propia llamada.
  if (!permissions.data) return "allowed";
  const data = permissions.data;
  return keys.some((key) => data[key]?.includes("R")) ? "allowed" : "forbidden";
}
