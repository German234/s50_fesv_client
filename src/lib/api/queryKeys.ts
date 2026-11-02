import { getCountryCode } from "@/config/countryCode";

/** Fuente activa ("all" = todas) o null cuando el recurso no depende de la fuente. */
export type SourceKey = string | null;

export type Filters = Record<string, unknown>;

/**
 * Query keys de un dominio. Toda key empieza por [país, dominio] e incluye fuente y filtros,
 * así un cambio de fuente o de filtro nunca reutiliza datos de otro contexto, y
 * `invalidateQueries({ queryKey: keys.all })` alcanza todo el dominio.
 *
 * const inboxKeys = createQueryKeys("inbox");
 * inboxKeys.list("fce", { source: "DEMO", filters: { from, to } })
 *   → ["SV", "inbox", "list", "fce", { source: "DEMO", from, to }]
 */
export function createQueryKeys<const D extends string>(domain: D) {
  const all = [getCountryCode(), domain] as const;

  return {
    all,
    lists: (resource: string) => [...all, "list", resource] as const,
    list: (resource: string, scope: { source?: SourceKey; filters?: Filters } = {}) =>
      [...all, "list", resource, { source: scope.source ?? null, ...scope.filters }] as const,
    details: (resource: string) => [...all, "detail", resource] as const,
    detail: (resource: string, id: string | number, scope: { source?: SourceKey } = {}) =>
      [...all, "detail", resource, id, { source: scope.source ?? null }] as const,
  };
}
