import { isAxiosError, isCancel } from "axios";
import type { ProblemDetails, ValidationProblemDetails } from "./types";

/**
 * Códigos transversales del contrato (../s50_fesv_backend/docs/contrato.md, "Códigos
 * transversales"; en el backend, ProblemCodes). Los de módulo (`modulo.motivo`) llegan en
 * `code` tal cual.
 */
export const PROBLEM_CODES = {
  validationFailed: "validation.failed",
  unauthenticated: "auth.unauthenticated",
  forbidden: "auth.forbidden",
  notFound: "http.notFound",
  methodNotAllowed: "http.methodNotAllowed",
  unexpected: "server.unexpected",
} as const;

/** Códigos que solo genera el frontend: no hubo respuesta del servidor o no fue de la API. */
export const CLIENT_ERROR_CODES = {
  network: "network",
  unknown: "unknown",
} as const;

/** Mismo código por defecto que ProblemCodes.ForStatus del backend, para respuestas sin ProblemDetails. */
function codeForStatus(status: number): string {
  if (status === 400) return PROBLEM_CODES.validationFailed;
  if (status === 401) return PROBLEM_CODES.unauthenticated;
  if (status === 403) return PROBLEM_CODES.forbidden;
  if (status === 404) return PROBLEM_CODES.notFound;
  if (status === 405) return PROBLEM_CODES.methodNotAllowed;
  if (status >= 500) return PROBLEM_CODES.unexpected;
  return `http.${status}`;
}

/**
 * Error normalizado que reciben las pantallas (CLAUDE.md, Integración).
 * `code` decide el comportamiento; `message` se muestra; `details` son los errores por campo.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number | null;
  readonly details: Record<string, string[]> | null;
  readonly traceId: string | null;
  /** Segundos de la cabecera `Retry-After` (429 `http.tooManyRequests`). */
  readonly retryAfter: number | null;

  constructor(init: {
    code: string;
    message: string;
    status?: number | null;
    details?: Record<string, string[]> | null;
    traceId?: string | null;
    retryAfter?: number | null;
    cause?: unknown;
  }) {
    super(init.message, { cause: init.cause });
    this.name = "ApiError";
    this.code = init.code;
    this.status = init.status ?? null;
    this.details = init.details ?? null;
    this.traceId = init.traceId ?? null;
    this.retryAfter = init.retryAfter ?? null;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isProblemDetails(data: unknown): data is ProblemDetails & Partial<ValidationProblemDetails> {
  return typeof data === "object" && data !== null && typeof (data as { code?: unknown }).code === "string";
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: "Tu sesión terminó. Vuelve a iniciar sesión.",
  403: "No tienes acceso a esta operación.",
  404: "No encontramos lo que buscas.",
  500: "Ocurrió un error inesperado.",
  502: "Un servicio externo no respondió.",
  503: "El servicio no está disponible en este momento.",
};

/**
 * ProblemDetails → { code, message, details }: code ← code; message ← detail ?? title;
 * details ← errors. Sin respuesta → "network".
 */
export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (!isAxiosError(error)) {
    return new ApiError({
      code: CLIENT_ERROR_CODES.unknown,
      message: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      cause: error,
    });
  }

  const response = error.response;
  if (!response) {
    return new ApiError({
      code: CLIENT_ERROR_CODES.network,
      message:
        error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
          ? "El servidor tardó demasiado en responder. Revisa tu conexión e inténtalo de nuevo."
          : "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      cause: error,
    });
  }

  const { status, data } = response;
  const retryAfter = Number.parseInt(String(response.headers["retry-after"] ?? ""), 10);
  const problem = isProblemDetails(data) ? data : null;
  const message = problem?.detail ?? problem?.title ?? FALLBACK_MESSAGES[status] ?? `Error ${status}.`;

  return new ApiError({
    code: problem?.code ?? codeForStatus(status),
    message,
    status,
    details: problem?.errors ?? null,
    traceId: problem?.traceId ?? null,
    retryAfter: Number.isNaN(retryAfter) ? null : retryAfter,
    cause: error,
  });
}

/** 403: la pantalla muestra "sin acceso"; la sesión sigue abierta. */
export function isForbidden(error: unknown): boolean {
  return isApiError(error) && error.status === 403;
}

/** 401: la sesión terminó (el cliente ya redirigió a /login). */
export function isUnauthenticated(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

/** Cancelaciones (AbortSignal de React Query): no son errores que mostrar. */
export function isCancelError(error: unknown): boolean {
  return isCancel(error);
}
