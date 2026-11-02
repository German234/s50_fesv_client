"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/queries";
import { createQueryKeys } from "@/lib/api/queryKeys";
import {
  createMenu,
  createRoute,
  createSubmenu,
  createUser,
  getMenuTree,
  getRolePermissions,
  getRoles,
  getRoutes,
  getUsers,
  type MenuNode,
  type MenuOrderBody,
  type RecordState,
  saveMenuOrder,
  saveRolePermissions,
  type SaveMenuBody,
  type SavePermissionsBody,
  type SaveSubmenuBody,
  setRouteState,
  setUserState,
  updateMenu,
  updateRoute,
  updateSubmenu,
  updateUser,
  type CreateRouteBody,
  type CreateUserBody,
  type UpdateRouteBody,
  type UpdateUserBody,
  type UsersQuery,
} from "./api";

export const adminKeys = createQueryKeys("admin");

/** Menú de la sesión (/auth/me) y permisos propios: la sidebar se rehace con lo guardado. */
function invalidateSession(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: authKeys.details("me") }),
    queryClient.invalidateQueries({ queryKey: authKeys.details("permissions") }),
  ]);
}

// Usuarios

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: adminKeys.list("users", { filters: query }),
    queryFn: ({ signal }) => getUsers(query, signal),
    // La tabla no parpadea entre páginas o mientras se escribe la búsqueda.
    placeholderData: keepPreviousData,
  });
}

export function useSaveUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; body: UpdateUserBody } | { id: null; body: CreateUserBody }) =>
      input.id === null ? createUser(input.body) : updateUser(input.id, input.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.lists("users") }),
  });
}

export function useUserStateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, state }: { id: number; state: RecordState }) => setUserState(id, state),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.lists("users") }),
  });
}

// Roles y permisos

export function useRoles(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: adminKeys.list("roles"),
    queryFn: ({ signal }) => getRoles(signal),
    enabled: options.enabled,
  });
}

export function useRolePermissions(roleId: number | null) {
  return useQuery({
    queryKey: adminKeys.detail("role-permissions", roleId ?? 0),
    queryFn: ({ signal }) => getRolePermissions(roleId as number, signal),
    enabled: roleId !== null,
  });
}

export function useSaveRolePermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: number; body: SavePermissionsBody }) => saveRolePermissions(roleId, body),
    onSuccess: (data, { roleId }) => {
      queryClient.setQueryData(adminKeys.detail("role-permissions", roleId), data);
      return invalidateSession(queryClient);
    },
  });
}

// Rutas

export function useRoutes(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: adminKeys.list("routes"),
    queryFn: ({ signal }) => getRoutes({}, signal),
    enabled: options.enabled,
  });
}

/** Una ruta nueva, editada o desactivada cambia también las filas de la matriz y los selects de menús. */
function invalidateRoutes(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.lists("routes") }),
    queryClient.invalidateQueries({ queryKey: adminKeys.details("role-permissions") }),
    queryClient.invalidateQueries({ queryKey: adminKeys.lists("menu-tree") }),
    invalidateSession(queryClient),
  ]);
}

export function useSaveRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; body: UpdateRouteBody } | { id: null; body: CreateRouteBody }) =>
      input.id === null ? createRoute(input.body) : updateRoute(input.id, input.body),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

export function useRouteStateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, state }: { id: number; state: RecordState }) => setRouteState(id, state),
    onSuccess: () => invalidateRoutes(queryClient),
  });
}

// Menús

export function useMenuTree() {
  return useQuery({
    queryKey: adminKeys.list("menu-tree"),
    queryFn: ({ signal }) => getMenuTree(signal),
  });
}

function onMenuChanged(queryClient: QueryClient) {
  return Promise.all([queryClient.invalidateQueries({ queryKey: adminKeys.lists("menu-tree") }), invalidateSession(queryClient)]);
}

export function useSaveMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: SaveMenuBody }) =>
      id === null ? createMenu(body) : updateMenu(id, body),
    onSuccess: () => onMenuChanged(queryClient),
  });
}

export function useSaveSubmenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: SaveSubmenuBody }) =>
      id === null ? createSubmenu(body) : updateSubmenu(id, body),
    onSuccess: () => onMenuChanged(queryClient),
  });
}

export function useSaveMenuOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MenuOrderBody) => saveMenuOrder(body),
    onSuccess: (tree: MenuNode[]) => {
      queryClient.setQueryData(adminKeys.list("menu-tree"), tree);
      return invalidateSession(queryClient);
    },
  });
}
