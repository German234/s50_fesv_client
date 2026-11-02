"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { z } from "zod";

type Primitive = string | number | boolean;
type UrlValue = Primitive | Primitive[] | null | undefined;

/** Lista en la URL como "a,b,c". Uso: z.object({ tipos: csv(z.enum(["01", "03"])) }). */
export function csv<T extends z.ZodType>(item: T) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.split(",").filter(Boolean) : value),
    z.array(item),
  );
}

function readParams<S extends z.ZodObject>(schema: S, searchParams: URLSearchParams): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const key of Object.keys(schema.shape)) {
    const value = searchParams.get(key);
    if (value !== null && value !== "") raw[key] = value;
  }
  return raw;
}

/**
 * Valida lo que trae la URL. Si algún parámetro es inválido (editado a mano, enlace viejo)
 * se descarta ese parámetro y se usa su valor por defecto, en vez de romper la pantalla.
 */
function parseFilters<S extends z.ZodObject>(schema: S, raw: Record<string, string>): z.output<S> {
  const first = schema.safeParse(raw);
  if (first.success) return first.data;

  const invalid = new Set(first.error.issues.map((issue) => String(issue.path[0] ?? "")));
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([key]) => !invalid.has(key)));
  const second = schema.safeParse(cleaned);
  if (second.success) return second.data;

  // El esquema debe tener valores por defecto para todos sus campos obligatorios.
  return schema.parse({});
}

function serialize(value: UrlValue): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.length ? value.join(",") : null;
  return String(value);
}

/**
 * Filtros tipados en la URL (CLAUDE.md §6). La URL es la fuente de verdad: los filtros
 * sobreviven a una recarga y se pueden compartir. Los valores iguales al de por defecto no
 * se escriben, y los parámetros ajenos al esquema (p. ej. `fuente`) se conservan.
 *
 * const schema = z.object({ desde: z.string().default(inicioDeMes), estado: z.enum([...]).optional() });
 * const { filters, setFilters, resetFilters } = useUrlFilters(schema);
 *
 * Usa useSearchParams: el componente debe estar dentro de un <Suspense>.
 */
export function useUrlFilters<S extends z.ZodObject>(schema: S) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryString = searchParams.toString();

  const filters = useMemo(
    () => parseFilters(schema, readParams(schema, new URLSearchParams(queryString))),
    [schema, queryString],
  );

  const defaults = useMemo(() => {
    const result = schema.safeParse({});
    return result.success ? (result.data as Record<string, UrlValue>) : {};
  }, [schema]);

  const write = useCallback(
    (next: Record<string, UrlValue>) => {
      const params = new URLSearchParams(queryString);
      for (const key of Object.keys(schema.shape)) {
        const value = serialize(next[key]);
        if (value === null || value === serialize(defaults[key])) params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [defaults, pathname, queryString, router, schema],
  );

  const setFilters = useCallback(
    (patch: Partial<z.input<S>>) => write({ ...(filters as Record<string, UrlValue>), ...(patch as Record<string, UrlValue>) }),
    [filters, write],
  );

  const resetFilters = useCallback(() => write({}), [write]);

  return { filters, setFilters, resetFilters };
}
