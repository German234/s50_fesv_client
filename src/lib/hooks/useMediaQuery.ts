"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Breakpoint del shell (CLAUDE.md §8): desde 1280 px la sidebar queda fija. */
export const DESKTOP_QUERY = "(min-width: 1280px)";

/** Coincidencia de una media query. En el servidor y al hidratar vale `serverValue`. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
