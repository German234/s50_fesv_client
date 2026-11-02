"use client";

import { Button, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, SearchX, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable, type DataTableColumn } from "@/components/fiscal/DataTable";
import { EmptyState } from "@/components/fiscal/StateViews";
import { type RoutePermissions, usePermissions, useSession } from "@/features/auth/queries";
import { PASSWORD_MAX } from "@/features/auth/schemas";
import { formatDate, initials } from "@/lib/format";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { toast } from "@/lib/toast";
import type { AdminUser, RecordState, UsersQuery } from "../api";
import { adminErrorMessage, applyServerErrors } from "../errors";
import { useRoles, useSaveUserMutation, useUsers, useUserStateMutation } from "../queries";
import { USER_STATE_FILTERS, userFormSchema, usersFiltersSchema, type UserForm } from "../schemas";
import { FormSelectField, FormTextField, type SelectOption } from "./fields";
import { FormModal, FormModalContent } from "./FormModal";
import { SearchInput } from "./SearchInput";
import { ADMIN_ROUTE_KEYS, AdminAccessGate, QueryErrorState, StateChip, StateSwitch } from "./shared";

const PAGE_SIZE = 25;

const STATE_LABELS: Record<(typeof USER_STATE_FILTERS)[number], string> = {
  todos: "Todos",
  active: "Activos",
  inactive: "Inactivos",
};

export function UsersScreen() {
  return (
    <AdminAccessGate section="users" resource="Administración · Usuarios">
      {(permissions) => <UsersView permissions={permissions} />}
    </AdminAccessGate>
  );
}

function fullName(user: Pick<AdminUser, "firstName" | "lastName">): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

type Editing = { user: AdminUser | null } | null;

function UsersView({ permissions }: { permissions: RoutePermissions }) {
  const { filters, setFilters } = useUrlFilters(usersFiltersSchema);
  const { user: me } = useSession();
  const [editing, setEditing] = useState<Editing>(null);
  const stateMutation = useUserStateMutation();

  const query: UsersQuery = {
    Page: filters.pagina,
    PageSize: PAGE_SIZE,
    Search: filters.q || undefined,
    State: filters.estado === "todos" ? undefined : filters.estado,
  };
  const users = useUsers(query);

  function changeState(user: AdminUser, state: RecordState) {
    stateMutation.mutate(
      { id: user.id, state },
      {
        onSuccess: () => toast.success(state === "active" ? `Usuario activado: ${fullName(user)}` : `Usuario desactivado: ${fullName(user)}`),
        onError: (error) => toast.error({ title: "No se pudo cambiar el estado", description: adminErrorMessage(error) }),
      },
    );
  }

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "user",
      header: "Usuario",
      isRowHeader: true,
      minWidth: 240,
      cell: (user) => (
        <span className="flex items-center gap-3">
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-soft-foreground">
            {initials(fullName(user) || user.email || "?")}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">
              {fullName(user)}
              {user.id === me?.id && <span className="ms-1.5 font-normal text-muted">(tú)</span>}
            </span>
            <span className="truncate text-small text-muted">{user.email}</span>
          </span>
        </span>
      ),
    },
    { id: "dui", header: "DUI", cell: (user) => <span className="font-mono text-[12px]">{user.dui}</span> },
    { id: "role", header: "Rol", cell: (user) => user.role?.name ?? <span className="text-muted">Sin rol</span> },
    { id: "state", header: "Estado", cell: (user) => <StateChip state={user.state} feminine={false} /> },
    { id: "created", header: "Creado", cell: (user) => <span className="font-mono text-[12px] tabular-nums">{formatDate(user.createdAt)}</span> },
    {
      id: "active",
      header: "Activo",
      align: "end",
      cell: (user) => (
        <StateSwitch
          state={user.state}
          label={fullName(user) || (user.email ?? "")}
          onChange={(state) => changeState(user, state)}
          isPending={stateMutation.isPending && stateMutation.variables?.id === user.id}
          disabledReason={
            user.id === me?.id ? "No puedes desactivarte a ti mismo" : permissions.canUpdate ? undefined : "Solo lectura"
          }
        />
      ),
    },
    {
      id: "edit",
      header: <span className="sr-only">Acciones</span>,
      align: "end",
      cell: (user) => (
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={`Editar ${fullName(user)}`}
          isDisabled={!permissions.canUpdate}
          onPress={() => setEditing({ user })}
        >
          <Pencil aria-hidden className="size-4" />
        </Button>
      ),
    },
  ];

  if (users.isError && !users.data) {
    return <QueryErrorState error={users.error} what="los usuarios" resource="Administración · Usuarios" onRetry={() => void users.refetch()} />;
  }

  const hasFilters = filters.q !== "" || filters.estado !== "todos";

  return (
    <section aria-label="Usuarios" className="overflow-hidden rounded-card bg-surface shadow-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={filters.q}
            onChange={(q) => setFilters({ q, pagina: 1 })}
            label="Buscar usuario"
            placeholder="Nombre, correo o DUI"
            className="w-full max-w-sm sm:w-80"
          />
          <ToggleButtonGroup
            aria-label="Estado"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[filters.estado]}
            onSelectionChange={(keys) => {
              const [key] = [...keys];
              if (typeof key === "string") setFilters({ estado: key as (typeof USER_STATE_FILTERS)[number], pagina: 1 });
            }}
            className="segmented gap-1 rounded-full bg-default p-1"
          >
            {USER_STATE_FILTERS.map((state) => (
              <ToggleButton key={state} id={state} size="sm" className="rounded-full px-3">
                {STATE_LABELS[state]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        {permissions.canCreate && (
          <Button variant="primary" onPress={() => setEditing({ user: null })}>
            <Plus aria-hidden className="size-4" />
            Nuevo usuario
          </Button>
        )}
      </div>
      <DataTable
        aria-label="Usuarios"
        className="rounded-none shadow-none"
        rows={users.data?.items ?? []}
        columns={columns}
        getRowId={(user) => user.id}
        getRowLabel={(user) => fullName(user)}
        isLoading={users.isPending}
        loadingMessage="Cargando usuarios…"
        enableShortcuts={false}
        pagination={
          users.data && users.data.total > 0
            ? {
                page: users.data.page,
                pageSize: users.data.pageSize,
                total: users.data.total,
                onPageChange: (pagina) => setFilters({ pagina }),
              }
            : undefined
        }
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description={`Ningún usuario coincide con: ${[
                filters.q && `búsqueda "${filters.q}"`,
                filters.estado !== "todos" && STATE_LABELS[filters.estado].toLowerCase(),
              ]
                .filter(Boolean)
                .join(" · ")}.`}
              actions={
                <Button variant="secondary" onPress={() => setFilters({ q: "", estado: "todos", pagina: 1 })}>
                  Buscar sin filtros
                </Button>
              }
            />
          ) : (
            <EmptyState icon={Users} title="No hay usuarios" />
          )
        }
      />
      <FormModal isOpen={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && <UserFormBody user={editing.user} onDone={() => setEditing(null)} />}
      </FormModal>
    </section>
  );
}

function UserFormBody({ user, onDone }: { user: AdminUser | null; onDone: () => void }) {
  const mode = user ? "edit" : "create";
  const schema = useMemo(() => userFormSchema(mode), [mode]);
  const save = useSaveUserMutation();
  // GET /roles exige settings/permissions (R); sin ese permiso no hay lista de roles.
  const canReadRoles = usePermissions(ADMIN_ROUTE_KEYS.permissions).canRead;
  const roles = useRoles({ enabled: canReadRoles });
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, setError } = useForm<UserForm>({
    resolver: zodResolver(schema),
    // Validar al guardar: con "onTouched", el error que aparece al salir del campo mueve el botón
    // Guardar entre el mousedown y el click, y el click se pierde.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      dui: user?.dui ?? "",
      email: user?.email ?? "",
      roleId: user?.role?.id ?? (undefined as unknown as number),
      password: "",
    },
  });

  const roleOptions: SelectOption[] = roles.data
    ? roles.data.map((role) => ({
        id: role.id,
        label: role.state === "active" ? (role.name ?? `Rol ${role.id}`) : `${role.name} (inactivo)`,
      }))
    : user?.role
      ? [{ id: user.role.id, label: user.role.name ?? `Rol ${user.role.id}` }]
      : [];

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const { password, ...rest } = values;
    const input = user
      ? { id: user.id, body: { ...rest, password: password === "" ? null : password } }
      : { id: null, body: { ...rest, password, state: "active" as const } };
    save.mutate(input, {
      onSuccess: (saved) => {
        toast.success(user ? `Usuario guardado: ${fullName(saved)}` : `Usuario creado: ${fullName(saved)}`);
        onDone();
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError, ["firstName", "lastName", "dui", "email", "roleId", "password"])) {
          setFormError(adminErrorMessage(error));
        }
      },
    });
  });

  return (
    <FormModalContent
      title={user ? `Editar usuario · ${fullName(user)}` : "Nuevo usuario"}
      onSubmit={onSubmit}
      submitLabel={user ? "Guardar usuario" : "Crear usuario"}
      isPending={save.isPending}
      formError={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="firstName" label="Nombre" autoComplete="off" maxLength={50} autoFocus />
        <FormTextField control={control} name="lastName" label="Apellido" autoComplete="off" maxLength={50} />
      </div>
      <FormTextField control={control} name="email" label="Correo" type="email" autoComplete="off" maxLength={100} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormTextField control={control} name="dui" label="DUI" mono maxLength={10} placeholder="01234567-8" autoComplete="off" />
        <FormSelectField
          control={control}
          name="roleId"
          label="Rol"
          options={roleOptions}
          placeholder="Elige un rol"
          isLoading={canReadRoles && roles.isPending}
          unavailableMessage={
            !canReadRoles
              ? "Tu rol no puede consultar los roles (Permisos por rol)."
              : roles.isError
                ? "No se pudieron cargar los roles."
                : undefined
          }
        />
      </div>
      <FormTextField
        control={control}
        name="password"
        label={user ? "Contraseña nueva (opcional)" : "Contraseña"}
        type="password"
        autoComplete="new-password"
        maxLength={PASSWORD_MAX}
        description={user ? "Déjala vacía para no cambiarla. De 8 a 16 caracteres." : "De 8 a 16 caracteres."}
      />
    </FormModalContent>
  );
}
