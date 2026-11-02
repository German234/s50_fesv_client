import { apiClient } from "@/lib/api/client";
import type { ApiPath, JsonResponse } from "@/lib/api/types";

const COUNTRY = "/api/v1/meta/country" satisfies ApiPath;

/** País de la instalación y sus capacidades. Anónimo: se consulta antes del login. */
export async function getCountryMeta(signal?: AbortSignal): Promise<JsonResponse<typeof COUNTRY, "get">> {
  const { data } = await apiClient.get<JsonResponse<typeof COUNTRY, "get">>(COUNTRY, { signal });
  return data;
}
