"use client";

import { Button, Checkbox, Label, ListBox, Select } from "@heroui/react";
import { Plus, SearchX, ShieldOff, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { EmptyState } from "@/components/fiscal/StateViews";
import type { RoutePermissions } from "@/features/auth/queries";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { toast } from "@/lib/toast";
import type { AdminRole, RoutePermission } from "../api";
import { adminErrorMessage } from "../errors";
import { useRolePermissions, useRoles, useSaveRolePermissionsMutation } from "../queries";
import { matchesSearch } from "../text";
import { SearchInput } from "./SearchInput";
import { AdminAccessGate, LoadingBlock, QueryErrorState, StateChip, UnsavedBar } from "./shared";

const ACTIONS = [
  { key: "create", label: "Crear" },
  { key: "read", label: "Leer" },
  { key: "update", label: "Actualizar" },
  { key: "delete", label: "Eliminar" },
] as const;

type ActionKey = (typeof ACTIONS)[number]["key"];
type Actions = Record<ActionKey, boolean>;

const NO_ACTIONS: Actions = { create: false, read: false, update: false, delete: false };

const filtersSchema = z.object({
  rol: z.coerce.number().int().positive().optional(),
  q: z.string().default(""),
});

function actionsOf(row: RoutePermission): Actions {
  return { create: row.create, read: row.read, update: row.update, delete: row.delete };
}

function sameActions(a: Actions, b: Actions): boolean {
  return ACTIONS.every(({ key }) => a[key] === b[key]);
}

function hasAny(actions: Actions): boolean {
  return ACTIONS.some(({ key }) => actions[key]);
}

/** Cambios locales de un rol: acciones editadas por ruta y rutas agregadas con "Asignar ruta". */
interface Draft {
  roleId: number | null;
  overrides: Record<number, Actions>;
  added: number[];
}

const EMPTY_DRAFT: Draft = { roleId: null, overrides: {}, added: [] };

export function PermissionsScreen() {
  return (
    <AdminAccessGate section="permissions" resource="Administración · Permisos por rol">
      {(permissions) => <PermissionsView permissions={permissions} />}
    </AdminAccessGate>
  );
}

function PermissionsView({ permissions }: { permissions: RoutePermissions }) {
  const { filters, setFilters } = useUrlFilters(filtersSchema);
  const roles = useRoles();
  const roleId = filters.rol ?? roles.data?.[0]?.id ?? null;
  const role = roles.data?.find((r) => r.id === roleId) ?? null;
  const matrix = useRolePermissions(roleId);
  const save = useSaveRolePermissionsMutation();
  const [storedDraft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  // Los cambios son de un rol: al cambiar de rol (por la URL, atrás/adelante) se descartan.
  const draft = storedDraft.roleId === roleId ? storedDraft : { ...EMPTY_DRAFT, roleId };

  const serverRows = useMemo(() => matrix.data?.routes ?? [], [matrix.data]);
  const effective = (row: RoutePermission): Actions => draft.overrides[row.routeId] ?? actionsOf(row);
  const isChanged = (row: RoutePermission) => !sameActions(effective(row), actionsOf(row));
  const changedCount = serverRows.filter(isChanged).length;

  function setActions(row: RoutePermission, actions: Actions) {
    setDraft({ ...draft, overrides: { ...draft.overrides, [row.routeId]: actions } });
  }

  function assign(routeId: number) {
    const row = serverRows.find((r) => r.routeId === routeId);
    if (!row) return;
    setDraft({
      ...draft,
      added: [...draft.added, routeId],
      overrides: { ...draft.overrides, [routeId]: { ...effective(row), read: true } },
    });
  }

  function selectRole(next: AdminRole) {
    if (next.id === roleId) return;
    if (changedCount > 0) {
      toast.warning({ title: "Tienes cambios sin guardar", description: `Guarda o descarta los permisos de ${role?.name} antes de cambiar de rol.` });
      return;
    }
    setFilters({ rol: next.id, q: "" });
  }

  function onSave() {
    if (roleId === null) return;
    save.mutate(
      { roleId, body: { routes: serverRows.map((row) => ({ routeId: row.routeId, ...effective(row) })) } },
      {
        onSuccess: () => {
          setDraft({ ...EMPTY_DRAFT, roleId });
          toast.success(`Permisos guardados · ${role?.name ?? ""}`);
        },
        onError: (error) => toast.error({ title: "No se guardaron los permisos", description: adminErrorMessage(error) }),
      },
    );
  }

  // Filas visibles: las que el rol tiene (o tuvo) asignadas, las editadas y las recién asignadas.
  const assigned = serverRows.filter(
    (row) => row.state !== null || hasAny(effective(row)) || draft.added.includes(row.routeId) || isChanged(row),
  );
  const unassigned = serverRows.filter((row) => !assigned.includes(row));
  const visible = assigned.filter((row) => matchesSearch(filters.q, row.name, row.path));

  if (roles.isError) {
    return <QueryErrorState error={roles.error} what="los roles" resource="Administración · Permisos por rol" onRetry={() => void roles.refetch()} />;
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(220px,300px)_1fr]">
      <section aria-labelledby="roles-title" className="rounded-card bg-surface p-3 shadow-surface">
        <h2 id="roles-title" className="px-3 pt-2 pb-2 text-small font-medium text-muted">
          Roles
        </h2>
        {roles.isPending ? (
          <LoadingBlock label="Cargando roles…" />
        ) : (
          <ul className="flex flex-col gap-1">
            {roles.data.map((r) => {
              const isCurrent = r.id === roleId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => selectRole(r)}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-left text-body outline-none focus-visible:ring-2 focus-visible:ring-focus",
                      isCurrent ? "bg-accent-soft font-medium text-accent-soft-foreground" : "hover:bg-surface-secondary",
                    ].join(" ")}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{r.name}</span>
                      {r.state === "inactive" && <span className="text-small font-normal text-muted">Inactivo</span>}
                    </span>
                    <span
                      aria-label={`${r.userCount} ${r.userCount === 1 ? "usuario" : "usuarios"}`}
                      className={[
                        "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-[12px] tabular-nums",
                        isCurrent ? "bg-accent text-accent-foreground" : "bg-default text-foreground",
                      ].join(" ")}
                    >
                      {r.userCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="matrix-title" className="flex min-w-0 flex-col gap-3">
        <div className="overflow-hidden rounded-card bg-surface shadow-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
            <h2 id="matrix-title" className="text-title">
              Permisos{role ? ` · ${role.name}` : ""}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={filters.q}
                onChange={(q) => setFilters({ q })}
                label="Buscar por ruta"
                placeholder="Buscar por ruta"
                className="w-full sm:w-64"
              />
              {permissions.canUpdate && (
                <AssignRoute rows={unassigned} onAssign={assign} isDisabled={!matrix.data} />
              )}
            </div>
          </div>

          {matrix.isError ? (
            <div className="p-4">
              <QueryErrorState error={matrix.error} what="los permisos del rol" resource="Administración · Permisos por rol" onRetry={() => void matrix.refetch()} />
            </div>
          ) : matrix.isPending ? (
            <LoadingBlock label={roleId === null ? "Cargando roles…" : "Cargando permisos…"} />
          ) : visible.length === 0 ? (
            filters.q ? (
              <EmptyState
                icon={SearchX}
                title="Sin resultados"
                description={`Ninguna ruta asignada coincide con "${filters.q}".`}
                actions={
                  <Button variant="secondary" onPress={() => setFilters({ q: "" })}>
                    Buscar sin filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={ShieldOff}
                title="Este rol no tiene rutas asignadas"
                description={permissions.canUpdate ? "Usa \"Asignar ruta\" para darle acceso a una pantalla." : undefined}
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-small">
                <caption className="sr-only">Permisos de {role?.name} por ruta</caption>
                <thead>
                  <tr className="border-y border-separator text-left text-muted">
                    <th scope="col" className="px-6 py-3 font-normal">
                      Ruta
                    </th>
                    {ACTIONS.map((action) => (
                      <th key={action.key} scope="col" className="px-3 py-3 text-center font-normal">
                        {action.label}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-3 font-normal">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Quitar</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const actions = effective(row);
                    const changed = isChanged(row);
                    return (
                      <tr
                        key={row.routeId}
                        data-changed={changed || undefined}
                        className={`border-b border-separator last:border-b-0 ${changed ? "bg-warning-soft/60" : ""}`}
                      >
                        <th scope="row" className="px-6 py-3 text-left font-normal">
                          <span className="block text-body font-medium">{row.name}</span>
                          <span className="block font-mono text-[12px] text-muted">{row.path}</span>
                          {changed && <span className="sr-only">(modificada)</span>}
                        </th>
                        {ACTIONS.map((action) => (
                          <td key={action.key} className="px-3 py-3 text-center">
                            {/* En HeroUI 3 el input vive en Checkbox.Content: sin él, la casilla no es interactiva. */}
                            <Checkbox
                              isSelected={actions[action.key]}
                              isDisabled={!permissions.canUpdate}
                              onChange={(selected) => setActions(row, { ...actions, [action.key]: selected })}
                              className="inline-flex"
                            >
                              <Checkbox.Content>
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Label className="sr-only">{`${action.label} · ${row.name}`}</Label>
                              </Checkbox.Content>
                            </Checkbox>
                          </td>
                        ))}
                        <td className="px-3 py-3">
                          <StateChip state={row.state} feminine={false} />
                        </td>
                        <td className="px-6 py-3 text-end">
                          {permissions.canUpdate && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="danger-soft"
                              className="rounded-full"
                              aria-label={`Quitar todos los permisos de ${row.name}`}
                              isDisabled={!hasAny(actions)}
                              onPress={() => setActions(row, NO_ACTIONS)}
                            >
                              <Trash aria-hidden className="size-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <UnsavedBar
          count={changedCount}
          note="se aplican en cuanto guardes"
          saveLabel="Guardar permisos"
          onDiscard={() => setDraft({ ...EMPTY_DRAFT, roleId })}
          onSave={onSave}
          isSaving={save.isPending}
        />
      </section>
    </div>
  );
}

/** "Asignar ruta": agrega una ruta sin permisos con Leer marcado; se guarda con el resto. */
function AssignRoute({ rows, onAssign, isDisabled }: { rows: RoutePermission[]; onAssign: (routeId: number) => void; isDisabled: boolean }) {
  return (
    <Select
      aria-label="Asignar ruta"
      value={null}
      onChange={(key) => {
        if (key !== null) onAssign(Number(key));
      }}
      isDisabled={isDisabled || rows.length === 0}
      placeholder="Asignar ruta"
    >
      <Select.Trigger className="button button--secondary h-11 gap-2 rounded-full px-4 shadow-none">
        <Plus aria-hidden className="size-4" />
        <Select.Value>{() => (rows.length === 0 ? "Todas asignadas" : "Asignar ruta")}</Select.Value>
      </Select.Trigger>
      <Select.Popover className="min-w-72">
        <ListBox aria-label="Rutas sin asignar" className="max-h-80 overflow-y-auto">
          {rows.map((row) => (
            <ListBox.Item key={row.routeId} id={row.routeId} textValue={`${row.name} ${row.path}`}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{row.name}</span>
                <span className="truncate font-mono text-[12px] text-muted">{row.path}</span>
              </span>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
