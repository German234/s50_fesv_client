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

/**
 * Sincroniza la fuente con `?fuente=`. La URL manda: al cargar o navegar, su valor pasa al
 * store; `setSource` actualiza store y URL (con replace, sin ensuciar el historial).
 * Se monta una vez en el shell; usa useSearchParams, así que va dentro de un Suspense.
 */
export function useSourceUrlSync(): { source: string; setSource: (source: string) => void } {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const source = useSourceStore((state) => state.source);
  const storeSetSource = useSourceStore((state) => state.setSource);
  const urlSource = searchParams.get(SOURCE_PARAM);

  useEffect(() => {
    if (urlSource && urlSource !== useSourceStore.getState().source) storeSetSource(urlSource);
  }, [urlSource, storeSetSource]);

  const setSource = useCallback(
    (next: string) => {
      storeSetSource(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === ALL_SOURCES) params.delete(SOURCE_PARAM);
      else params.set(SOURCE_PARAM, next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, storeSetSource],
  );

  return { source, setSource };
}
