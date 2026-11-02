import type { ReactNode } from "react";
import { sileo, type SileoButton, type SileoOptions } from "sileo";
import { type ApiError, normalizeError } from "./api/errors";

// Única entrada a los toasts (CLAUDE.md §7): las pantallas no llaman a sileo directo.
// Verificado en sileo 0.1.6:
// - `duration: null` desactiva el cierre automático (el Toaster omite el temporizador);
//   `undefined` usa 6000 ms.
// - Un solo `button` por toast; al pulsarlo se ejecuta onClick (no se cierra solo).
// - Sin `id` propio todos comparten "sileo-default": cada toast reemplaza al anterior, que es
//   el comportamiento de "píldora que se expande" del diseño (B03).

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastInput {
  title: string;
  description?: ReactNode;
  /** Milisegundos; por defecto 6000. */
  duration?: number;
  action?: ToastAction;
}

function toButton(action?: ToastAction): SileoButton | undefined {
  return action ? { title: action.label, onClick: action.onClick } : undefined;
}

function options({ title, description, duration, action }: ToastInput): SileoOptions {
  return { title, description, duration, button: toButton(action) };
}

export const toast = {
  /** Éxito breve: "Guardado en ERP", "Código copiado". */
  success: (input: ToastInput | string) =>
    sileo.success(options(typeof input === "string" ? { title: input, duration: 3000 } : input)),

  /** Parcial o advertencia: "Guardado en ERP: 13 de 14". */
  warning: (input: ToastInput | string) => sileo.warning(options(typeof input === "string" ? { title: input } : input)),

  info: (input: ToastInput | string) => sileo.info(options(typeof input === "string" ? { title: input } : input)),

  /**
   * Error persistente: no se cierra solo. Acepta un ApiError (usa su message) y una acción,
   * p. ej. "Reintentar".
   */
  error: (input: (Omit<ToastInput, "duration" | "title"> & { title?: string; error?: unknown }) | string) => {
    if (typeof input === "string") return sileo.error({ title: input, duration: null });
    const apiError: ApiError | null = input.error === undefined ? null : normalizeError(input.error);
    return sileo.error({
      title: input.title ?? apiError?.message ?? "Ocurrió un error.",
      description: input.description ?? (input.title && apiError ? apiError.message : undefined),
      duration: null,
      button: toButton(input.action),
    });
  },

  /**
   * Progreso de una operación: "Transmitiendo 6 DTE…" → resultado. Devuelve la misma promesa.
   * El error queda persistente.
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: {
      loading: string;
      success: string | ((data: T) => ToastInput);
      error?: string | ((error: ApiError) => ToastInput);
    },
  ) =>
    sileo.promise(promise, {
      loading: { title: messages.loading },
      success: (data: T) =>
        typeof messages.success === "string" ? { title: messages.success } : options(messages.success(data)),
      error: (error: unknown) => {
        const apiError = normalizeError(error);
        const input: ToastInput =
          messages.error === undefined
            ? { title: apiError.message }
            : typeof messages.error === "string"
              ? { title: messages.error, description: apiError.message }
              : messages.error(apiError);
        return { ...options(input), duration: null };
      },
    }),

  dismiss: (id: string) => sileo.dismiss(id),
};
