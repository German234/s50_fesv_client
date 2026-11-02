"use client";

import { useQuery } from "@tanstack/react-query";
import { type ApiError, isCancelError, normalizeError } from "@/lib/api/errors";
import { createQueryKeys } from "@/lib/api/queryKeys";
import type { DevErrorKind } from "@/lib/api/types";
import { getHealth, triggerDevError, triggerNetworkError } from "./api";

export const devKeys = createQueryKeys("dev");

export function useHealth() {
  return useQuery({
    queryKey: devKeys.detail("health", "self"),
    queryFn: ({ signal }) => getHealth(signal),
    retry: false,
  });
}

/** Ejecuta una llamada que debe fallar y devuelve el error normalizado como dato. */
async function captureError(call: () => Promise<void>): Promise<ApiError | null> {
  try {
    await call();
    return null;
  } catch (error) {
    if (isCancelError(error)) throw error;
    return normalizeError(error);
  }
}

export function useDevErrorProbe(kind: DevErrorKind) {
  return useQuery({
    queryKey: devKeys.detail("errors", kind),
    queryFn: ({ signal }) => captureError(() => triggerDevError(kind, signal)),
    retry: false,
  });
}

export function useNetworkErrorProbe() {
  return useQuery({
    queryKey: devKeys.detail("errors", "network"),
    queryFn: ({ signal }) => captureError(() => triggerNetworkError(signal)),
    retry: false,
  });
}
