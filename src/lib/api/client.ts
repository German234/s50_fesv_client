import axios, { type AxiosError } from "axios";
import { loginHref, PUBLIC_PATHS } from "./authRedirect";
import { normalizeError } from "./errors";

declare module "axios" {
  interface AxiosRequestConfig {
    /** No redirigir a /login ante un 401 (p. ej. el propio login con credenciales inválidas). */
    skipAuthRedirect?: boolean;
  }
}

/** Punto de extensión de la sesión: Providers registra la cookie de features/auth/session.ts. */
export interface AuthHandlers {
  getToken: () => string | null;
  clearSession: () => void;
  /** Navegación interna; Providers registra router.replace de Next. */
  navigate: (href: string) => void;
}

const authHandlers: AuthHandlers = {
  getToken: () => null,
  clearSession: () => {},
  navigate: () => {},
};

export function configureAuth(handlers: Partial<AuthHandlers>): void {
  Object.assign(authHandlers, handlers);
}

/** Cierra la sesión local y vuelve al login conservando la ruta actual. */
export function endSessionAndRedirect(): void {
  authHandlers.clearSession();
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return;
  authHandlers.navigate(loginHref(`${pathname}${search}`));
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: { Accept: "application/json, application/problem+json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Las cancelaciones se propagan tal cual: React Query las reconoce y no son errores.
    if (axios.isCancel(error)) return Promise.reject(error);

    const apiError = normalizeError(error);
    // Solo el 401 cierra la sesión; el 403 (auth.forbidden) llega a la pantalla, que muestra "sin acceso".
    if (apiError.status === 401 && !error.config?.skipAuthRedirect) endSessionAndRedirect();
    return Promise.reject(apiError);
  },
);

/** "/api/v1/dev/errors/{kind}" + { kind: "business" } → "/api/v1/dev/errors/business". */
export function buildPath(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined) throw new Error(`Falta el parámetro de ruta "${name}" en ${template}.`);
    return encodeURIComponent(String(value));
  });
}
