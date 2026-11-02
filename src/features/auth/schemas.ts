import { z } from "zod";

/** Regla del backend para la contraseña nueva (`PasswordResetConfirmRequest.newPassword`). */
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

export const resetRequestSchema = z.object({ email });
export type ResetRequestForm = z.infer<typeof resetRequestSchema>;

export const resetVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código tiene 6 dígitos."),
});
export type ResetVerifyForm = z.infer<typeof resetVerifySchema>;

export function passwordLengthOk(value: string): boolean {
  return value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;
}

export const resetConfirmSchema = z
  .object({
    /** Solo se muestra (solo lectura): es el correo del paso 1. */
    email: z.string(),
    newPassword: z.string().refine(passwordLengthOk, `Usa de ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres.`),
    confirmPassword: z.string().min(1, "Repite la contraseña."),
  })
  .refine((form) => form.newPassword === form.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type ResetConfirmForm = z.infer<typeof resetConfirmSchema>;
