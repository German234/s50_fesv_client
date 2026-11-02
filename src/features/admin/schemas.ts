import { z } from "zod";
import { PASSWORD_MAX, PASSWORD_MIN, passwordLengthOk } from "@/features/auth/schemas";

// Reglas copiadas de los contratos del backend (Features/Access/*Contracts.cs y
// AccessValidation): mismas longitudes y mismos patrones, para que el 400 no sea la primera señal.

/** AccessValidation.RoutePathPattern: segmentos en minúsculas separados por "/", sin "/" inicial. */
export const ROUTE_PATH_PATTERN = /^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/;
/** AccessValidation.MaterialIconPattern. */
export const MATERIAL_ICON_PATTERN = /^[a-z0-9_]+$/;

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `Escribe ${label}.`).max(max, `Usa hasta ${max} caracteres.`);

// Misma regla que el login: la de HTML5, que acepta cuentas existentes como admin@example.
const email = z
  .string()
  .trim()
  .min(1, "Escribe el correo.")
  .max(100, "Usa hasta 100 caracteres.")
  .pipe(z.email({ pattern: z.regexes.html5Email, error: "Escribe un correo válido, por ejemplo nombre@empresa.com." }));

const passwordRule = `Usa de ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres.`;

/** Al crear la contraseña es obligatoria; al editar, vacía = no cambia. */
export function userFormSchema(mode: "create" | "edit") {
  return z.object({
    firstName: requiredText("el nombre", 50),
    lastName: requiredText("el apellido", 50),
    // CreateUserRequest.dui: exactamente 10 caracteres, como la legacy ("01234567-8").
    dui: z.string().trim().length(10, "El DUI tiene 10 caracteres, por ejemplo 01234567-8."),
    email,
    roleId: z.number({ error: "Elige un rol." }).int().positive("Elige un rol."),
    password:
      mode === "create"
        ? z.string().refine(passwordLengthOk, passwordRule)
        : z.string().refine((value) => value === "" || passwordLengthOk(value), passwordRule),
  });
}
export type UserForm = z.infer<ReturnType<typeof userFormSchema>>;

export const routeFormSchema = z.object({
  name: z.string().trim().min(5, "Usa de 5 a 50 caracteres.").max(50, "Usa de 5 a 50 caracteres."),
  path: z
    .string()
    .trim()
    .min(2, "Usa de 2 a 50 caracteres.")
    .max(50, "Usa de 2 a 50 caracteres.")
    .regex(ROUTE_PATH_PATTERN, 'Minúsculas, números, "_" y "-", con "/" entre segmentos y sin "/" al inicio.'),
});
export type RouteForm = z.infer<typeof routeFormSchema>;

const icon = z
  .string()
  .trim()
  .min(1, "Elige un ícono.")
  .max(50, "Usa hasta 50 caracteres.")
  .regex(MATERIAL_ICON_PATTERN, "Nombre de Material Icons en minúsculas, por ejemplo receipt_long.");

export const menuFormSchema = z
  .object({
    name: requiredText("el nombre", 50),
    icon,
    isActive: z.boolean(),
    hasSubmenus: z.boolean(),
    routeId: z.number().int().positive().nullable(),
  })
  // SaveMenuRequest: sin submenús la ruta es obligatoria (400 con errors.routeId). `when`: que se
  // evalúe aunque otros campos tengan errores, para mostrar todos a la vez.
  .refine((form) => form.hasSubmenus || form.routeId !== null, {
    message: "Elige una ruta.",
    path: ["routeId"],
    when: (payload) => typeof payload.value === "object" && payload.value !== null,
  });
export type MenuForm = z.infer<typeof menuFormSchema>;

export const submenuFormSchema = z.object({
  name: requiredText("el nombre", 50),
  icon,
  isActive: z.boolean(),
  routeId: z.number({ error: "Elige una ruta." }).int().positive("Elige una ruta."),
});
export type SubmenuForm = z.infer<typeof submenuFormSchema>;

export const USER_STATE_FILTERS = ["todos", "active", "inactive"] as const;

/** Filtros de /admin/usuarios en la URL. */
export const usersFiltersSchema = z.object({
  q: z.string().default(""),
  estado: z.enum(USER_STATE_FILTERS).default("todos"),
  pagina: z.coerce.number().int().min(1).default(1),
});

/** Filtros de /admin/rutas en la URL (la lista no es paginada: la búsqueda es local). */
export const routesFiltersSchema = z.object({
  q: z.string().default(""),
});
