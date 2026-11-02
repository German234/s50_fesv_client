"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { LOGIN_PATH } from "@/lib/api/authRedirect";
import { endSessionAndRedirect } from "@/lib/api/client";
import { createQueryKeys } from "@/lib/api/queryKeys";
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
} from "@/lib/api/types";
import {
  confirmPasswordReset,
  getMe,
  getMyPermissions,
  login,
  requestPasswordReset,
  verifyPasswordResetCode,
} from "./api";
import {
  endSession,
  getSessionToken,
  getTokenExpiry,
  removeSessionData,
  startSession,
  subscribeSession,
} from "./session";

export const authKeys = createQueryKeys("auth");

export function useMe(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: authKeys.detail("me", "current"),
    queryFn: ({ signal }) => getMe(signal),
    staleTime: 5 * 60_000,
    enabled: options.enabled,
  });
}

/** El servidor cachea los permisos hasta 60 s; no tiene sentido pedirlos más seguido. */
export function useMyPermissions(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: authKeys.detail("permissions", "current"),
    queryFn: ({ signal }) => getMyPermissions(signal),
    staleTime: 60_000,
    enabled: options.enabled,
  });
}

export function useLoginMutation() {
  return useMutation({ mutationFn: (body: LoginRequest) => login(body) });
}

export function usePasswordResetRequestMutation() {
  return useMutation({ mutationFn: (body: PasswordResetRequest) => requestPasswordReset(body) });
}

export function usePasswordResetVerifyMutation() {
  return useMutation({ mutationFn: (body: PasswordResetVerifyRequest) => verifyPasswordResetCode(body) });
}

export function usePasswordResetConfirmMutation() {
  return useMutation({ mutationFn: (body: PasswordResetConfirmRequest) => confirmPasswordReset(body) });
}

/** Token de la cookie; en el servidor y durante la hidratación vale null. */
function useSessionToken(): string | null {
  return useSyncExternalStore(subscribeSession, getSessionToken, () => null);
}

/** Guarda el token del login; descarta antes cualquier dato de una sesión anterior. */
export function useSignIn() {
  const queryClient = useQueryClient();
  return useCallback(
    (response: LoginResponse) => {
      removeSessionData(queryClient);
      startSession(response);
    },
    [queryClient],
  );
}

/** Sesión actual: usuario y menú de `/auth/me`, y cerrar sesión. */
export function useSession() {
  const token = useSessionToken();
  const queryClient = useQueryClient();
  const router = useRouter();
  const me = useMe({ enabled: token !== null });

  // El backend no tiene logout: sin refresh token, cerrar sesión es olvidar el token.
  const signOut = useCallback(() => {
    endSession();
    removeSessionData(queryClient);
    router.replace(LOGIN_PATH);
  }, [queryClient, router]);

  return {
    isAuthenticated: token !== null,
    user: me.data?.user ?? null,
    menu: me.data?.menu ?? [],
    isLoading: token !== null && me.isPending,
    error: me.error,
    signOut,
  };
}

// setTimeout desborda por encima de ~24,8 días; el token dura 1 día, pero por si cambia.
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Cierra la sesión cuando vence el token, sin esperar a que una llamada responda 401, y vuelve
 * al login con la ruta actual. Se monta una sola vez, en el layout de (app).
 */
export function useSessionExpiry() {
  const token = useSessionToken();

  useEffect(() => {
    if (token === null) return;
    const expiry = getTokenExpiry(token);
    if (expiry === null) return;
    const timeout = setTimeout(endSessionAndRedirect, Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMEOUT));
    return () => clearTimeout(timeout);
  }, [token]);
}

export interface RoutePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

/**
 * Acciones del rol sobre una ruta del backend (`Route.path`: "documents", "settings/routes",
 * "cipsa/fc_ccf"…; ver ../s50_fesv_backend/docs/permisos.md). Sirve para ocultar o deshabilitar
 * acciones: quien decide es el servidor y su 403 se sigue mostrando. Mientras carga, todo es false.
 */
export function usePermissions(route: string): RoutePermissions {
  const token = useSessionToken();
  const query = useMyPermissions({ enabled: token !== null });
  const letters = query.data?.[route] ?? "";

  return {
    canCreate: letters.includes("C"),
    canRead: letters.includes("R"),
    canUpdate: letters.includes("U"),
    canDelete: letters.includes("D"),
    isLoading: token !== null && query.isPending,
  };
}
