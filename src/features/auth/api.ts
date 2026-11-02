import { apiClient } from "@/lib/api/client";
import type {
  ApiPath,
  JsonBody,
  JsonResponse,
  LoginResponse,
  MeResponse,
} from "@/lib/api/types";

const LOGIN = "/api/v1/auth/login" satisfies ApiPath;
const ME = "/api/v1/auth/me" satisfies ApiPath;
const MY_PERMISSIONS = "/api/v1/auth/me/permissions" satisfies ApiPath;

/** `{ [routePath]: "CRUD" }`: letras en orden C, R, U, D; solo rutas con alguna acción. */
export type PermissionMap = JsonResponse<typeof MY_PERMISSIONS, "get">;

/**
 * 401 `auth.invalidCredentials` (no se distingue correo de contraseña), 403 `auth.userInactive`
 * o `auth.userWithoutRole`, 429 `http.tooManyRequests`. El 401 aquí no es sesión vencida:
 * no redirige, lo muestra el formulario.
 */
export async function login(body: JsonBody<typeof LOGIN, "post">, signal?: AbortSignal): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(LOGIN, body, { signal, skipAuthRedirect: true });
  return data;
}

/** Usuario de la sesión y su menú. 401 si el token venció; 403 si el usuario se inactivó. */
export async function getMe(signal?: AbortSignal): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>(ME, { signal });
  return data;
}

export async function getMyPermissions(signal?: AbortSignal): Promise<PermissionMap> {
  const { data } = await apiClient.get<PermissionMap>(MY_PERMISSIONS, { signal });
  return data;
}
