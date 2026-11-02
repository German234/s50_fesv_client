import type { QueryClient } from "@tanstack/react-query";
import type { LoginResponse } from "@/lib/api/types";

/**
 * Sesión = el accessToken en una cookie de primera parte que vence en `expiresAt`. No es
 * HttpOnly porque el navegador llama directo al backend con `Authorization: Bearer`; la cookie
 * existe para que src/proxy.ts pueda proteger (app) en el servidor. SameSite=Lax: la cookie no
 * autentica nada en el backend (solo el header), y con Strict un enlace externo llevaría al login.
 * Sin refresh token: al vencer se vuelve al login (decisión pendiente en docs/progreso.md).
 */
export const SESSION_COOKIE = "fesv_token";

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

/** Para useSyncExternalStore: la cookie no emite eventos, así que avisan start/endSession. */
export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionToken(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${SESSION_COOKIE}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function writeCookie(value: string, expires: Date): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax${secure}`;
}

export function startSession({ accessToken, expiresAt }: Pick<LoginResponse, "accessToken" | "expiresAt">): void {
  writeCookie(accessToken, new Date(expiresAt));
  notify();
}

export function endSession(): void {
  writeCookie("", new Date(0));
  notify();
}

/**
 * Vencimiento del token (claim `exp`, en ms). La cookie guarda solo el JWT y su `Expires` no se
 * puede leer desde JS; el claim es el mismo instante que `expiresAt`. No se verifica la firma:
 * solo sirve para programar el cierre, quien valida es el backend.
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Borra de la caché todo lo del usuario; el país (`meta`) no depende de la sesión. */
export function removeSessionData(queryClient: QueryClient): void {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[1] !== "meta" });
}
