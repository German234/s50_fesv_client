import { apiClient, buildPath } from "@/lib/api/client";
import type { ApiPath, DevErrorKind, PathParams } from "@/lib/api/types";

// Endpoints de diagnóstico del backend (solo Development).

const DEV_ERRORS = "/api/v1/dev/errors/{kind}" satisfies ApiPath;

/** Lo que cada `kind` debe producir tras la normalización (ver docs/contrato.md del backend). */
export const DEV_ERROR_EXPECTATIONS: Record<DevErrorKind, { status: number; code: string }> = {
  validation: { status: 400, code: "validation.failed" },
  business: { status: 422, code: "dev.businessRule" },
  notFound: { status: 404, code: "dev.notFound" },
  conflict: { status: 409, code: "dev.conflict" },
  external: { status: 502, code: "dev.externalService" },
  unexpected: { status: 500, code: "server.unexpected" },
  forbidden: { status: 403, code: "auth.forbidden" },
};

export const DEV_ERROR_KINDS = Object.keys(DEV_ERROR_EXPECTATIONS) as DevErrorKind[];

/** GET /health → "Healthy". No está en el OpenAPI (es texto plano de MapHealthChecks). */
export async function getHealth(signal?: AbortSignal): Promise<string> {
  const { data } = await apiClient.get<string>("/health", { responseType: "text", signal });
  return data;
}

/** Siempre falla: el backend responde el error pedido. */
export async function triggerDevError(kind: DevErrorKind, signal?: AbortSignal): Promise<void> {
  const params: PathParams<typeof DEV_ERRORS, "get"> = { kind };
  await apiClient.get(buildPath(DEV_ERRORS, params), { signal });
}

/** Petición a un puerto cerrado para comprobar la normalización del error de red. */
export async function triggerNetworkError(signal?: AbortSignal): Promise<void> {
  await apiClient.get("/health", { baseURL: "http://127.0.0.1:1", timeout: 5_000, signal });
}

/** Ruta inexistente sin token: el backend responde 401 y el cliente redirige a /login. */
export async function triggerUnauthorized(): Promise<void> {
  await apiClient.get("/api/v1/dev/no-existe");
}
