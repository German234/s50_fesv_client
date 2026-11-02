import { z } from "zod";

/** Regla del backend para las contraseñas nuevas (`CreateUserRequest.password`). */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

// La regla de HTML5 (la de <input type="email">) y no la de Zod por defecto: esa exige dominio
// con punto y rechaza cuentas existentes como admin@example.
const email = z
  .string()
  .trim()
  .min(1, "Escribe tu correo.")
  .pipe(z.email({ pattern: z.regexes.html5Email, error: "Escribe un correo válido, por ejemplo nombre@empresa.com." }));

/**
 * El login no aplica la regla de 8 a 16: el backend acepta contraseñas heredadas más cortas
 * (`LoginRequest.password`), y exigirla dejaría fuera a esos usuarios.
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Escribe tu contraseña."),
});
export type LoginForm = z.infer<typeof loginSchema>;

export function passwordLengthOk(value: string): boolean {
  return value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;
}
