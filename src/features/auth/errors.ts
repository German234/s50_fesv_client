import { CLIENT_ERROR_CODES, normalizeError } from "@/lib/api/errors";

/** Códigos de módulo de auth (../s50_fesv_backend/docs/contrato.md, "Autenticación"). */
export const AUTH_ERROR_CODES = {
  invalidCredentials: "auth.invalidCredentials",
  userInactive: "auth.userInactive",
  userWithoutRole: "auth.userWithoutRole",
  resetCodeInvalid: "auth.resetCodeInvalid",
  tooManyRequests: "http.tooManyRequests",
} as const;

function tooManyRequests(retryAfter: number | null): string {
  if (retryAfter === null) return "Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.";
  const wait = retryAfter >= 60 ? `${Math.ceil(retryAfter / 60)} min` : `${retryAfter} s`;
  return `Hiciste demasiados intentos. Espera ${wait} y vuelve a intentarlo.`;
}

/**
 * Mensaje del Alert de los formularios de login y recuperación. El de credenciales es genérico
 * (no dice si falló el correo o la contraseña) y sin contador de intentos (§8).
 */
export function authErrorMessage(error: unknown): string {
  const apiError = normalizeError(error);
  switch (apiError.code) {
    case AUTH_ERROR_CODES.invalidCredentials:
      return "Correo o contraseña incorrectos.";
    case AUTH_ERROR_CODES.userInactive:
      return "Tu usuario está inactivo. Pide a un administrador del sistema que lo reactive.";
    case AUTH_ERROR_CODES.userWithoutRole:
      return "Tu usuario no tiene un rol asignado. Pide a un administrador del sistema que te asigne uno.";
    case AUTH_ERROR_CODES.resetCodeInvalid:
      return "El código no es válido o ya venció. Revísalo o pide uno nuevo.";
    case AUTH_ERROR_CODES.tooManyRequests:
      return tooManyRequests(apiError.retryAfter);
    case CLIENT_ERROR_CODES.network:
      return apiError.message;
    default:
      return apiError.status !== null && apiError.status >= 500
        ? "No pudimos completar la solicitud. Inténtalo de nuevo en unos minutos."
        : apiError.message;
  }
}
