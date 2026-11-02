"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { create } from "zustand";

/** "Todas las fuentes" (CLAUDE.md §6: source=all). */
export const ALL_SOURCES = "all";
export const SOURCE_PARAM = "fuente";

interface SourceState {
  /** Código de la fuente activa (Biller.code) o ALL_SOURCES. */
  source: string;
  setSource: (source: string) => void;
}

export const useSourceStore = create<SourceState>()((set) => ({
  source: ALL_SOURCES,
  setSource: (source) => set({ source: source || ALL_SOURCES }),
}));

/** `href` con `?fuente=` de la fuente indicada; "Todas" no lleva parámetro. */
export function withSource(href: string, source: string): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  if (source === ALL_SOURCES) params.delete(SOURCE_PARAM);
  else params.set(SOURCE_PARAM, source);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function useReplaceSourceParam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(
    (source: string) => {
      const search = searchParams.toString();
      router.replace(withSource(search ? `${pathname}?${search}` : pathname, source), { scroll: false });
    },
    [pathname, router, searchParams],
  );
}

/**
 * Sincroniza la fuente con `?fuente=`. Se monta una sola vez, en el shell (usa useSearchParams:
 * va dentro de un Suspense).
 * - La URL manda: al cargar o navegar, su valor pasa al store. Un código que `isKnown` no
 *   reconoce se quita de la URL y vale "Todas".
 * - Si se navega a una URL sin `?fuente=` (un enlace o router.push de una pantalla), se le
 *   agrega la fuente activa: así sobrevive a la navegación y a la recarga.
 */
export function useSourceUrlSync(isKnown: (code: string) => boolean): void {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const storeSetSource = useSourceStore((state) => state.setSource);
  const replaceSourceParam = useReplaceSourceParam();
  const urlSource = searchParams.get(SOURCE_PARAM);

  useEffect(() => {
    const current = useSourceStore.getState().source;
    if (urlSource === null) {
      if (current !== ALL_SOURCES) replaceSourceParam(current);
    } else if (!isKnown(urlSource)) {
      storeSetSource(ALL_SOURCES);
      replaceSourceParam(ALL_SOURCES);
    } else if (urlSource !== current) {
      storeSetSource(urlSource);
    }
    // pathname: una navegación sin `?fuente=` deja urlSource en null igual que antes.
  }, [urlSource, pathname, isKnown, storeSetSource, replaceSourceParam]);
}

/** Fuente activa y cómo cambiarla (store y URL, con replace para no ensuciar el historial). */
export function useSource(): { source: string; setSource: (source: string) => void } {
  const source = useSourceStore((state) => state.source);
  const storeSetSource = useSourceStore((state) => state.setSource);
  const replaceSourceParam = useReplaceSourceParam();

  const setSource = useCallback(
    (next: string) => {
      storeSetSource(next);
      replaceSourceParam(next);
    },
    [replaceSourceParam, storeSetSource],
  );

  return { source, setSource };
}
