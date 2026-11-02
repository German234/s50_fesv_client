import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError, PROBLEM_CODES } from "@/lib/api/errors";

/** Errores de negocio que pertenecen a un campo del formulario (docs/contrato.md, Administración de accesos). */
const FIELD_CODES: Record<string, { field: string; message: string }> = {
  "users.emailTaken": { field: "email", message: "Ya hay un usuario con este correo." },
  "users.roleNotFound": { field: "roleId", message: "El rol ya no existe. Elige otro." },
  "routes.pathTaken": { field: "path", message: "Ya hay una ruta con esta dirección." },
  "menus.routeNotFound": { field: "routeId", message: "La ruta ya no existe. Elige otra." },
};

/** Mensajes de otros códigos de la administración que el detalle del backend no explica bien. */
const MESSAGES: Record<string, string> = {
  "users.cannotDeactivateSelf": "No puedes desactivar tu propio usuario.",
  "permissions.matrixMismatch": "Las rutas cambiaron mientras editabas. Recarga los permisos y vuelve a aplicar los cambios.",
  "menus.orderMismatch": "El menú cambió mientras lo ordenabas. Descarta y vuelve a ordenarlo.",
  "submenus.menuNotFound": "El menú ya no existe.",
};

export function adminErrorMessage(error: unknown): string {
  if (!isApiError(error)) return "Ocurrió un error inesperado.";
  return MESSAGES[error.code] ?? FIELD_CODES[error.code]?.message ?? error.message;
}

/**
 * Lleva un error del servidor a los campos del formulario: el 409 de correo o path, el 422 de
 * una referencia y los `errors` del 400. Devuelve true si quedó en algún campo; si no, la
 * pantalla lo muestra como alerta del formulario.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!isApiError(error)) return false;
  const known = new Set<string>(fields);

  const mapped = FIELD_CODES[error.code];
  if (mapped && known.has(mapped.field)) {
    setError(mapped.field as Path<T>, { type: "server", message: mapped.message }, { shouldFocus: true });
    return true;
  }

  if (error.code === PROBLEM_CODES.validationFailed && error.details) {
    let applied = false;
    for (const [key, messages] of Object.entries(error.details)) {
      const field = key.charAt(0).toLowerCase() + key.slice(1);
      if (!known.has(field) || messages.length === 0) continue;
      setError(field as Path<T>, { type: "server", message: messages[0] }, { shouldFocus: !applied });
      applied = true;
    }
    return applied;
  }

  return false;
}
