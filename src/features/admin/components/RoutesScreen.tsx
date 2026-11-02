"use client";

import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Route as RouteIcon, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable, type DataTableColumn } from "@/components/fiscal/DataTable";
import { EmptyState } from "@/components/fiscal/StateViews";
import type { RoutePermissions } from "@/features/auth/queries";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";
import { toast } from "@/lib/toast";
import type { AdminRoute, RecordState } from "../api";
import { adminErrorMessage, applyServerErrors } from "../errors";
import { useRouteStateMutation, useRoutes, useSaveRouteMutation } from "../queries";
import { routeFormSchema, routesFiltersSchema, type RouteForm } from "../schemas";
import { matchesSearch } from "../text";
import { FormTextField } from "./fields";
import { FormModal, FormModalContent } from "./FormModal";
import { SearchInput } from "./SearchInput";
import { AdminAccessGate, QueryErrorState, StateChip, StateSwitch } from "./shared";

export function RoutesScreen() {
  return (
    <AdminAccessGate section="routes" resource="Administración · Rutas">
      {(permissions) => <RoutesView permissions={permissions} />}
    </AdminAccessGate>
  );
}

type Editing = { route: AdminRoute | null } | null;

function RoutesView({ permissions }: { permissions: RoutePermissions }) {
  const { filters, setFilters } = useUrlFilters(routesFiltersSchema);
  const routes = useRoutes();
  const stateMutation = useRouteStateMutation();
  const [editing, setEditing] = useState<Editing>(null);

  const rows = useMemo(
    () => (routes.data ?? []).filter((route) => matchesSearch(filters.q, route.name, route.path)),
    [routes.data, filters.q],
  );

  function changeState(route: AdminRoute, state: RecordState) {
    stateMutation.mutate(
      { id: route.id, state },
      {
        onSuccess: () => toast.success(state === "active" ? `Ruta activada: ${route.name}` : `Ruta desactivada: ${route.name}`),
        onError: (error) => toast.error({ title: "No se pudo cambiar el estado", description: adminErrorMessage(error) }),
      },
    );
  }

  const columns: DataTableColumn<AdminRoute>[] = [
    { id: "name", header: "Nombre", isRowHeader: true, minWidth: 200, cell: (route) => <span className="font-semibold">{route.name}</span> },
    { id: "path", header: "Dirección", minWidth: 220, cell: (route) => <span className="font-mono text-[13px]">{route.path}</span> },
    { id: "state", header: "Estado", cell: (route) => <StateChip state={route.state} /> },
    {
      id: "active",
      header: "Activa",
      align: "end",
      cell: (route) => (
        <StateSwitch
          state={route.state}
          label={route.name ?? route.path ?? `Ruta ${route.id}`}
          onChange={(state) => changeState(route, state)}
          isPending={stateMutation.isPending && stateMutation.variables?.id === route.id}
          disabledReason={permissions.canUpdate ? undefined : "Solo lectura"}
        />
      ),
    },
    {
      id: "edit",
      header: <span className="sr-only">Acciones</span>,
      align: "end",
      cell: (route) => (
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={`Editar ${route.name}`}
          isDisabled={!permissions.canUpdate}
          onPress={() => setEditing({ route })}
        >
          <Pencil aria-hidden className="size-4" />
        </Button>
      ),
    },
  ];

  if (routes.isError) {
    return <QueryErrorState error={routes.error} what="las rutas" resource="Administración · Rutas" onRetry={() => void routes.refetch()} />;
  }

  return (
    <section aria-label="Rutas" className="overflow-hidden rounded-card bg-surface shadow-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
        <SearchInput
          value={filters.q}
          onChange={(q) => setFilters({ q })}
          label="Buscar ruta"
          placeholder="Buscar ruta"
          className="w-full max-w-sm"
        />
        {permissions.canCreate && (
          <Button variant="primary" onPress={() => setEditing({ route: null })}>
            <Plus aria-hidden className="size-4" />
            Nueva ruta
          </Button>
        )}
      </div>
      <DataTable
        aria-label="Rutas"
        className="rounded-none shadow-none"
        rows={rows}
        columns={columns}
        getRowId={(route) => route.id}
        getRowLabel={(route) => route.name ?? ""}
        isLoading={routes.isPending}
        loadingMessage="Cargando rutas…"
        enableShortcuts={false}
        emptyState={
          filters.q ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description={`Ninguna ruta coincide con "${filters.q}".`}
              actions={
                <Button variant="secondary" onPress={() => setFilters({ q: "" })}>
                  Buscar sin filtros
                </Button>
              }
            />
          ) : (
            <EmptyState icon={RouteIcon} title="No hay rutas" description="Crea la primera ruta para poder asignarle permisos." />
          )
        }
      />
      <FormModal isOpen={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        {editing && <RouteFormBody route={editing.route} onDone={() => setEditing(null)} />}
      </FormModal>
    </section>
  );
}

function RouteFormBody({ route, onDone }: { route: AdminRoute | null; onDone: () => void }) {
  const save = useSaveRouteMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<RouteForm>({
    resolver: zodResolver(routeFormSchema),
    // Validar al guardar: con "onTouched", el error que aparece al salir del campo mueve el botón
    // Guardar entre el mousedown y el click, y el click se pierde.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: route?.name ?? "", path: route?.path ?? "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(route ? { id: route.id, body: values } : { id: null, body: { ...values, state: "active" } }, {
      onSuccess: (saved) => {
        toast.success(route ? `Ruta guardada: ${saved.name}` : `Ruta creada: ${saved.name}`);
        onDone();
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError, ["name", "path"])) setFormError(adminErrorMessage(error));
      },
    });
  });

  return (
    <FormModalContent
      title={route ? `Editar ruta · ${route.name}` : "Nueva ruta"}
      description={route ? undefined : "La ruta es la clave con la que se asignan permisos a cada rol."}
      onSubmit={onSubmit}
      submitLabel={route ? "Guardar ruta" : "Crear ruta"}
      isPending={save.isPending}
      formError={formError}
    >
      <FormTextField control={control} name="name" label="Nombre" maxLength={50} autoFocus />
      <FormTextField
        control={control}
        name="path"
        label="Dirección"
        mono
        maxLength={50}
        placeholder="settings/routes"
        description={
          route
            ? "Cambiarla deja sin acceso a los endpoints que exigen la dirección anterior."
            : 'Minúsculas, números, "_" y "-", con "/" entre segmentos.'
        }
      />
    </FormModalContent>
  );
}
