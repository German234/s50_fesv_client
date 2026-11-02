"use client";

import { Button, Chip, Spinner, Switch } from "@heroui/react";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, type ReactNode } from "react";
import { ErrorState, ForbiddenState } from "@/components/fiscal/StateViews";
import { type RoutePermissions, usePermissions, useSession } from "@/features/auth/queries";
import { isForbidden, normalizeError } from "@/lib/api/errors";
import { useSource, withSource } from "@/stores";
import type { RecordState } from "../api";

/** Claves de permiso de cada pantalla (../s50_fesv_backend/docs/permisos.md). */
export const ADMIN_ROUTE_KEYS = {
  users: "settings/users",
  menus: "settings/menu-management",
  routes: "settings/routes",
  permissions: "settings/permissions",
} as const;

export type AdminSection = keyof typeof ADMIN_ROUTE_KEYS;

const TABS: { section: AdminSection; label: string; href: string }[] = [
  { section: "users", label: "Usuarios", href: "/admin/usuarios" },
  { section: "menus", label: "Menús", href: "/admin/menus" },
  { section: "routes", label: "Rutas", href: "/admin/rutas" },
  { section: "permissions", label: "Permisos por rol", href: "/admin/permisos" },
];

/** Título, subtítulo y segmentado de navegación entre las cuatro pantallas (§8). */
export function AdminHeader() {
  const pathname = usePathname();
  const { source } = useSource();
  const users = usePermissions(ADMIN_ROUTE_KEYS.users);
  const menus = usePermissions(ADMIN_ROUTE_KEYS.menus);
  const routes = usePermissions(ADMIN_ROUTE_KEYS.routes);
  const permissions = usePermissions(ADMIN_ROUTE_KEYS.permissions);
  const canRead: Record<AdminSection, boolean> = {
    users: users.canRead,
    menus: menus.canRead,
    routes: routes.canRead,
    permissions: permissions.canRead,
  };
  // La pestaña actual siempre se ve (aunque sea para mostrar "sin acceso"); las demás, solo con R.
  const tabs = TABS.filter((tab) => canRead[tab.section] || pathname.startsWith(tab.href));

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-display">Administración de accesos</h1>
        <p className="text-body text-muted">Qué ve cada rol en la navegación y qué puede hacer en cada ruta.</p>
      </div>
      <nav aria-label="Secciones de administración" className="max-w-full overflow-x-auto">
        <ul className="flex gap-1 rounded-full bg-default p-1">
          {tabs.map((tab) => {
            const isCurrent = pathname.startsWith(tab.href);
            return (
              <li key={tab.section}>
                <Link
                  href={withSource(tab.href, source)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={[
                    "block rounded-full px-4 py-2 text-body whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    isCurrent ? "bg-surface font-medium text-foreground shadow-surface" : "text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

/**
 * Pantalla protegida por la clave de permiso de la sección: sin R, "sin acceso". El shell ya
 * hace lo mismo por ubicación (RouteAccessGate); aquí además se entregan C/U/D a la pantalla
 * para deshabilitar acciones.
 */
export function AdminAccessGate({
  section,
  resource,
  children,
}: {
  section: AdminSection;
  resource: string;
  children: (permissions: RoutePermissions) => ReactNode;
}) {
  const permissions = usePermissions(ADMIN_ROUTE_KEYS[section]);
  if (permissions.isLoading) return <LoadingBlock label="Comprobando permisos…" />;
  if (!permissions.canRead) return <AdminForbidden resource={resource} />;
  return children(permissions);
}

export function AdminForbidden({ resource }: { resource: string }) {
  const { user } = useSession();
  const { source } = useSource();
  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <ForbiddenState
        resource={resource}
        roleName={user?.role.name ?? undefined}
        className="max-w-lg rounded-card bg-surface shadow-surface"
        actions={
          <Link href={withSource("/", source)} className="button button--secondary">
            Ir al inicio
          </Link>
        }
      />
    </div>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted">
      <Spinner size="sm" aria-hidden />
      {label}
    </div>
  );
}

/** Error de carga de una vista; el 403 de la propia llamada también es "sin acceso". */
export function QueryErrorState({ error, what, resource, onRetry }: { error: unknown; what: string; resource: string; onRetry: () => void }) {
  if (isForbidden(error)) return <AdminForbidden resource={resource} />;
  const apiError = normalizeError(error);
  return (
    <ErrorState
      icon={CircleAlert}
      title={`No pudimos cargar ${what}`}
      description={apiError.message}
      technicalDetail={
        <>
          code: {apiError.code}
          {apiError.traceId && <> · traceId: {apiError.traceId}</>}
        </>
      }
      actions={
        <Button className="button--fiscal" onPress={onRetry}>
          Reintentar
        </Button>
      }
    />
  );
}

/** Chip Activa/Inactiva (soft success / default). */
export function StateChip({ state, feminine = true }: { state: RecordState | null; feminine?: boolean }) {
  if (state === null) {
    return (
      <Chip variant="soft" color="default" size="sm">
        <Chip.Label>Sin asignar</Chip.Label>
      </Chip>
    );
  }
  const active = state === "active";
  const label = active ? (feminine ? "Activa" : "Activo") : feminine ? "Inactiva" : "Inactivo";
  return (
    <Chip variant="soft" color={active ? "success" : "default"} size="sm">
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}

/**
 * Switch de estado de una fila. Deshabilitado, muestra el motivo al lado (y lo enlaza con
 * aria-describedby): un tooltip no llega a un control deshabilitado con el teclado.
 */
export function StateSwitch({
  state,
  onChange,
  label,
  isPending,
  disabledReason,
}: {
  state: RecordState;
  onChange: (state: RecordState) => void;
  /** Nombre de la fila; el switch se anuncia como "Activo: {label}". */
  label: string;
  isPending?: boolean;
  disabledReason?: string;
}) {
  const reasonId = useId();
  return (
    <span className="inline-flex items-center justify-end gap-2">
      {disabledReason && (
        <span id={reasonId} className="text-small text-muted">
          {disabledReason}
        </span>
      )}
      <Switch
        aria-label={`Activo: ${label}`}
        aria-describedby={disabledReason ? reasonId : undefined}
        isSelected={state === "active"}
        isDisabled={disabledReason !== undefined || isPending}
        onChange={(selected) => onChange(selected ? "active" : "inactive")}
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </span>
  );
}

/** Barra "N cambios sin guardar" con Descartar / Guardar (B · Admin · permisos). */
export function UnsavedBar({
  count,
  note,
  saveLabel,
  onDiscard,
  onSave,
  isSaving,
  canSave = true,
}: {
  count: number;
  note: string;
  saveLabel: string;
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave?: boolean;
}) {
  if (count === 0) return null;
  return (
    <div
      role="status"
      className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-warning-soft px-5 py-3 text-warning-soft-foreground shadow-overlay"
    >
      <p className="text-body">
        <strong className="font-semibold">
          {count} {count === 1 ? "cambio sin guardar" : "cambios sin guardar"}
        </strong>{" "}
        · {note}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" className="bg-surface" onPress={onDiscard} isDisabled={isSaving}>
          Descartar
        </Button>
        <Button variant="primary" onPress={onSave} isPending={isSaving} isDisabled={!canSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
