"use client";

import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/lib/api/queryKeys";
import { getCountryMeta } from "./api";

export const metaKeys = createQueryKeys("meta");

/** La configuración del país no cambia durante la sesión: se pide una vez al arrancar. */
export function useCountryMeta() {
  return useQuery({
    queryKey: metaKeys.detail("country", "current"),
    queryFn: ({ signal }) => getCountryMeta(signal),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
