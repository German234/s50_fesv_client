import { apiClient, buildPath } from "@/lib/api/client";
import type { ApiPath, JsonBody, JsonResponse, PathParams, QueryParams } from "@/lib/api/types";

// Administración de accesos (../s50_fesv_backend/docs/contrato.md, "Administración de accesos").
// Permisos por endpoint en docs/permisos.md: usuarios → settings/users, roles y matriz →
// settings/permissions, rutas → settings/routes, menús y submenús → settings/menu-management.

const USERS = "/api/v1/users" satisfies ApiPath;
const USER = "/api/v1/users/{id}" satisfies ApiPath;
const USER_STATE = "/api/v1/users/{id}/state" satisfies ApiPath;
const ROLES = "/api/v1/roles" satisfies ApiPath;
const ROLE_PERMISSIONS = "/api/v1/roles/{id}/permissions" satisfies ApiPath;
const ROUTES = "/api/v1/routes" satisfies ApiPath;
const ROUTE = "/api/v1/routes/{id}" satisfies ApiPath;
const ROUTE_STATE = "/api/v1/routes/{id}/state" satisfies ApiPath;
const MENU_TREE = "/api/v1/menus/tree" satisfies ApiPath;
const MENUS = "/api/v1/menus" satisfies ApiPath;
const MENU = "/api/v1/menus/{id}" satisfies ApiPath;
const MENU_ORDER = "/api/v1/menus/order" satisfies ApiPath;
const SUBMENUS = "/api/v1/submenus" satisfies ApiPath;
const SUBMENU = "/api/v1/submenus/{id}" satisfies ApiPath;

export type UsersQuery = QueryParams<typeof USERS, "get">;
export type UsersPage = JsonResponse<typeof USERS, "get">;
export type AdminUser = JsonResponse<typeof USER, "get">;
export type CreateUserBody = JsonBody<typeof USERS, "post">;
export type UpdateUserBody = JsonBody<typeof USER, "put">;
export type StateBody = JsonBody<typeof USER_STATE, "patch">;
export type RecordState = NonNullable<StateBody["state"]>;

export type AdminRole = JsonResponse<typeof ROLES, "get">[number];
export type RolePermissions = JsonResponse<typeof ROLE_PERMISSIONS, "get">;
export type RoutePermission = RolePermissions["routes"][number];
export type SavePermissionsBody = JsonBody<typeof ROLE_PERMISSIONS, "put">;

export type RoutesQuery = QueryParams<typeof ROUTES, "get">;
export type AdminRoute = JsonResponse<typeof ROUTE, "get">;
export type CreateRouteBody = JsonBody<typeof ROUTES, "post">;
export type UpdateRouteBody = JsonBody<typeof ROUTE, "put">;

export type MenuNode = JsonResponse<typeof MENU_TREE, "get">[number];
export type SubmenuNode = MenuNode["submenus"][number];
export type SaveMenuBody = JsonBody<typeof MENUS, "post">;
export type SaveSubmenuBody = JsonBody<typeof SUBMENUS, "post">;
export type MenuOrderBody = JsonBody<typeof MENU_ORDER, "put">;

type Id = PathParams<typeof USER, "get">["id"];

// Usuarios

/** Paginado: `Search` busca en nombre, apellido, correo y DUI; `PageSize` máximo 100. */
export async function getUsers(query: UsersQuery, signal?: AbortSignal): Promise<UsersPage> {
  const { data } = await apiClient.get<UsersPage>(USERS, { params: query, signal });
  return data;
}

/** 409 `users.emailTaken`; 422 `users.roleNotFound`. */
export async function createUser(body: CreateUserBody): Promise<AdminUser> {
  const { data } = await apiClient.post<AdminUser>(USERS, body);
  return data;
}

/** `password` null: no cambia. 409 `users.emailTaken`. */
export async function updateUser(id: Id, body: UpdateUserBody): Promise<AdminUser> {
  const { data } = await apiClient.put<AdminUser>(buildPath(USER, { id }), body);
  return data;
}

/** 422 `users.cannotDeactivateSelf` si es el usuario de la sesión. */
export async function setUserState(id: Id, state: RecordState): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(buildPath(USER_STATE, { id }), { state } satisfies StateBody);
  return data;
}

// Roles y matriz de permisos

/** Con `userCount` (activos e inactivos). */
export async function getRoles(signal?: AbortSignal): Promise<AdminRole[]> {
  const { data } = await apiClient.get<AdminRole[]>(ROLES, { signal });
  return data;
}

/** Una fila por ruta activa, ordenadas por path; `state` null = el rol nunca tuvo permiso. */
export async function getRolePermissions(roleId: Id, signal?: AbortSignal): Promise<RolePermissions> {
  const { data } = await apiClient.get<RolePermissions>(buildPath(ROLE_PERMISSIONS, { id: roleId }), { signal });
  return data;
}

/** Matriz completa (todas las rutas activas, una vez cada una). 422 `permissions.matrixMismatch`. */
export async function saveRolePermissions(roleId: Id, body: SavePermissionsBody): Promise<RolePermissions> {
  const { data } = await apiClient.put<RolePermissions>(buildPath(ROLE_PERMISSIONS, { id: roleId }), body);
  return data;
}

// Rutas

export async function getRoutes(query: RoutesQuery = {}, signal?: AbortSignal): Promise<AdminRoute[]> {
  const { data } = await apiClient.get<AdminRoute[]>(ROUTES, { params: query, signal });
  return data;
}

/** 409 `routes.pathTaken`. */
export async function createRoute(body: CreateRouteBody): Promise<AdminRoute> {
  const { data } = await apiClient.post<AdminRoute>(ROUTES, body);
  return data;
}

/** 409 `routes.pathTaken`. */
export async function updateRoute(id: Id, body: UpdateRouteBody): Promise<AdminRoute> {
  const { data } = await apiClient.put<AdminRoute>(buildPath(ROUTE, { id }), body);
  return data;
}

export async function setRouteState(id: Id, state: RecordState): Promise<AdminRoute> {
  const { data } = await apiClient.patch<AdminRoute>(buildPath(ROUTE_STATE, { id }), { state } satisfies StateBody);
  return data;
}

// Menús y submenús

/** Árbol ordenado por `order`, con inactivos. */
export async function getMenuTree(signal?: AbortSignal): Promise<MenuNode[]> {
  const { data } = await apiClient.get<MenuNode[]>(MENU_TREE, { signal });
  return data;
}

/** Sin submenús exige `routeId` (400 `errors.routeId`); 422 `menus.routeNotFound`. */
export async function createMenu(body: SaveMenuBody): Promise<MenuNode> {
  const { data } = await apiClient.post<MenuNode>(MENUS, body);
  return data;
}

export async function updateMenu(id: Id, body: SaveMenuBody): Promise<MenuNode> {
  const { data } = await apiClient.put<MenuNode>(buildPath(MENU, { id }), body);
  return data;
}

/** Orden completo de menús y submenús; responde el árbol. 422 `menus.orderMismatch`. */
export async function saveMenuOrder(body: MenuOrderBody): Promise<MenuNode[]> {
  const { data } = await apiClient.put<MenuNode[]>(MENU_ORDER, body);
  return data;
}

/** 422 `submenus.menuNotFound` o `menus.routeNotFound`. */
export async function createSubmenu(body: SaveSubmenuBody): Promise<SubmenuNode> {
  const { data } = await apiClient.post<SubmenuNode>(SUBMENUS, body);
  return data;
}

export async function updateSubmenu(id: Id, body: SaveSubmenuBody): Promise<SubmenuNode> {
  const { data } = await apiClient.put<SubmenuNode>(buildPath(SUBMENU, { id }), body);
  return data;
}
