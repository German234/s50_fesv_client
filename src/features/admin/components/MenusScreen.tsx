"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Chip } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, GripVertical, ListTree, Pencil, Plus } from "lucide-react";
import { createElement, type CSSProperties, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { EmptyState } from "@/components/fiscal/StateViews";
import { type RoutePermissions, usePermissions } from "@/features/auth/queries";
import { menuIcon } from "@/features/menu/icons";
import { useShortcut } from "@/lib/hooks/useShortcuts";
import { toast } from "@/lib/toast";
import type { AdminRoute, MenuNode, SubmenuNode } from "../api";
import { adminErrorMessage, applyServerErrors } from "../errors";
import { countMoved, type MenuOrder, moveItem, orderFromTree, reconcileOrder, toOrderBody } from "../menuOrder";
import { useMenuTree, useRoutes, useSaveMenuMutation, useSaveMenuOrderMutation, useSaveSubmenuMutation } from "../queries";
import { menuFormSchema, submenuFormSchema, type MenuForm, type SubmenuForm } from "../schemas";
import { FormSelectField, FormTextField, type SelectOption, SwitchRow } from "./fields";
import { FormModal, FormModalContent } from "./FormModal";
import { FormIconField } from "./IconPicker";
import { ADMIN_ROUTE_KEYS, AdminAccessGate, LoadingBlock, QueryErrorState, UnsavedBar } from "./shared";

export function MenusScreen() {
  return (
    <AdminAccessGate section="menus" resource="Administración · Menús">
      {(permissions) => <MenusView permissions={permissions} />}
    </AdminAccessGate>
  );
}

type Selection = { kind: "menu"; id: number } | { kind: "new" } | null;

/** "menu:3" o "submenu:3:7" (menú 3, submenú 7): identifica la fila para el foco y Alt+↑/↓. */
type NodeKey = `menu:${number}` | `submenu:${number}:${number}`;
type FocusControl = "up" | "down" | "edit";

function parseNodeKey(key: string): { menuId: number; submenuId: number | null } | null {
  const [kind, menuId, submenuId] = key.split(":");
  if (kind === "menu") return { menuId: Number(menuId), submenuId: null };
  if (kind === "submenu") return { menuId: Number(menuId), submenuId: Number(submenuId) };
  return null;
}

/** Opciones de ruta para los selects: activas primero; las inactivas, marcadas. */
function useRouteOptions() {
  // GET /routes exige settings/routes (R): sin ese permiso no hay lista de rutas.
  const canReadRoutes = usePermissions(ADMIN_ROUTE_KEYS.routes).canRead;
  const routes = useRoutes({ enabled: canReadRoutes });
  const options: SelectOption[] = useMemo(
    () =>
      [...(routes.data ?? [])]
        .sort((a, b) => Number(b.state === "active") - Number(a.state === "active") || (a.path ?? "").localeCompare(b.path ?? ""))
        .map((route: AdminRoute) => ({
          id: route.id,
          label: route.state === "active" ? (route.name ?? "") : `${route.name} (inactiva)`,
          detail: route.path ?? undefined,
        })),
    [routes.data],
  );
  return {
    options,
    isLoading: canReadRoutes && routes.isPending,
    unavailableMessage: !canReadRoutes
      ? "Tu rol no puede consultar las rutas (Rutas)."
      : routes.isError
        ? "No se pudieron cargar las rutas."
        : undefined,
  };
}

function MenusView({ permissions }: { permissions: RoutePermissions }) {
  const tree = useMenuTree();
  const saveOrder = useSaveMenuOrderMutation();
  const [draftOrder, setDraftOrder] = useState<MenuOrder | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [announcement, setAnnouncement] = useState("");
  const pendingFocus = useRef<{ key: NodeKey; control: FocusControl } | null>(null);
  const routeOptions = useRouteOptions();

  const nodes = useMemo(() => tree.data ?? [], [tree.data]);
  const menusById = useMemo(() => new Map(nodes.map((menu) => [menu.id, menu])), [nodes]);
  const submenusById = useMemo(
    () => new Map(nodes.flatMap((menu) => menu.submenus.map((submenu) => [submenu.id, submenu] as const))),
    [nodes],
  );
  const order = draftOrder ? reconcileOrder(draftOrder, nodes) : orderFromTree(nodes);
  const moved = draftOrder ? countMoved(order, nodes) : 0;

  // Tras mover, el foco sigue a la fila movida (mismo control si sigue habilitado; si no, editar).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const row = document.querySelector(`[data-node="${target.key}"]`);
    const control = row?.querySelector<HTMLButtonElement>(`[data-control="${target.control}"]:not([disabled])`);
    (control ?? row?.querySelector<HTMLButtonElement>('[data-control="edit"]'))?.focus();
  });

  function move(key: NodeKey, delta: -1 | 1, control: FocusControl) {
    if (!permissions.canUpdate) return;
    const parsed = parseNodeKey(key);
    if (!parsed) return;
    const menuIndex = order.findIndex((entry) => entry.id === parsed.menuId);
    if (menuIndex < 0) return;

    let next: MenuOrder;
    let name: string;
    let position: number;
    let total: number;
    if (parsed.submenuId === null) {
      if (menuIndex + delta < 0 || menuIndex + delta >= order.length) return;
      next = moveItem(order, menuIndex, delta);
      name = menusById.get(parsed.menuId)?.name ?? "";
      position = menuIndex + delta + 1;
      total = order.length;
    } else {
      const ids = order[menuIndex].submenuIds;
      const subIndex = ids.indexOf(parsed.submenuId);
      if (subIndex < 0 || subIndex + delta < 0 || subIndex + delta >= ids.length) return;
      next = order.map((entry, i) => (i === menuIndex ? { ...entry, submenuIds: moveItem(ids, subIndex, delta) } : entry));
      name = submenusById.get(parsed.submenuId)?.name ?? "";
      position = subIndex + delta + 1;
      total = ids.length;
    }
    pendingFocus.current = { key, control };
    setDraftOrder(next);
    setAnnouncement(`${name}: posición ${position} de ${total}.`);
  }

  function moveFocused(delta: -1 | 1) {
    const row = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[data-node]");
    const key = row?.dataset.node as NodeKey | undefined;
    if (!key) return;
    const control = ((document.activeElement as HTMLElement).dataset.control as FocusControl | undefined) ?? "edit";
    move(key, delta, control);
  }

  // Arrastrar con el asa (dnd-kit, solo puntero; con teclado están Alt+↑/↓ y los botones). Un
  // submenú se reordena dentro de su menú; moverlo a otro menú se hace desde el editor.
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = parseNodeKey(String(active.id));
    const to = parseNodeKey(String(over.id));
    if (!from || !to) return;
    if (from.submenuId === null && to.submenuId === null) {
      const oldIndex = order.findIndex((entry) => entry.id === from.menuId);
      const newIndex = order.findIndex((entry) => entry.id === to.menuId);
      if (oldIndex < 0 || newIndex < 0) return;
      setDraftOrder(arrayMove(order, oldIndex, newIndex));
      setAnnouncement(`${menusById.get(from.menuId)?.name}: posición ${newIndex + 1} de ${order.length}.`);
      return;
    }
    if (from.submenuId === null || to.submenuId === null || from.menuId !== to.menuId) return;
    const menuIndex = order.findIndex((entry) => entry.id === from.menuId);
    const ids = order[menuIndex]?.submenuIds ?? [];
    const oldIndex = ids.indexOf(from.submenuId);
    const newIndex = ids.indexOf(to.submenuId);
    if (oldIndex < 0 || newIndex < 0) return;
    setDraftOrder(order.map((entry, i) => (i === menuIndex ? { ...entry, submenuIds: arrayMove(ids, oldIndex, newIndex) } : entry)));
    setAnnouncement(`${submenusById.get(from.submenuId)?.name}: posición ${newIndex + 1} de ${ids.length}.`);
  }

  const shortcutsEnabled = permissions.canUpdate && nodes.length > 0;
  useShortcut(
    { id: "admin.menus.up", combo: "alt+arrowup", description: "Subir el menú enfocado", group: "Administración", enabled: shortcutsEnabled },
    () => moveFocused(-1),
  );
  useShortcut(
    { id: "admin.menus.down", combo: "alt+arrowdown", description: "Bajar el menú enfocado", group: "Administración", enabled: shortcutsEnabled },
    () => moveFocused(1),
  );

  function onSaveOrder() {
    saveOrder.mutate(toOrderBody(order), {
      onSuccess: () => {
        setDraftOrder(null);
        toast.success("Orden guardado. El menú lateral ya lo muestra.");
      },
      onError: (error) => toast.error({ title: "No se guardó el orden", description: adminErrorMessage(error) }),
    });
  }

  if (tree.isError) {
    return <QueryErrorState error={tree.error} what="el menú" resource="Administración · Menús" onRetry={() => void tree.refetch()} />;
  }

  const selectedMenu = selection?.kind === "menu" ? (menusById.get(selection.id) ?? null) : null;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <section aria-labelledby="menu-tree-title" className="flex flex-col gap-3">
        <div className="rounded-card bg-surface p-4 shadow-surface sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="menu-tree-title" className="text-title">
                Estructura del menú
              </h2>
              <p className="text-small text-muted">
                {permissions.canUpdate ? "Arrastra para reordenar · Alt + ↑↓ con teclado" : "Solo lectura"}
              </p>
            </div>
            {permissions.canCreate && (
              <Button variant="secondary" onPress={() => setSelection({ kind: "new" })}>
                <Plus aria-hidden className="size-4" />
                Nuevo menú
              </Button>
            )}
          </div>

          {tree.isPending ? (
            <LoadingBlock label="Cargando menú…" />
          ) : order.length === 0 ? (
            <EmptyState icon={ListTree} title="No hay menús" description="Crea el primer menú de la navegación." />
          ) : (
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              accessibility={{ announcements: DRAG_ANNOUNCEMENTS, screenReaderInstructions: { draggable: DRAG_INSTRUCTIONS } }}
            >
              <SortableContext items={order.map((entry) => `menu:${entry.id}`)} strategy={verticalListSortingStrategy}>
                <ol aria-label="Menús" className="flex flex-col gap-2">
                  {order.map((entry, index) => {
                    const menu = menusById.get(entry.id);
                    if (!menu) return null;
                    const submenus = entry.submenuIds.flatMap((id) => submenusById.get(id) ?? []);
                    return (
                      <SortableItem key={menu.id} nodeKey={`menu:${menu.id}`} canDrag={permissions.canUpdate} className="flex flex-col gap-2">
                        {(handle) => (
                          <>
                            <TreeRow
                              nodeKey={`menu:${menu.id}`}
                              handle={handle}
                              name={menu.name ?? ""}
                              icon={menu.icon}
                              path={menu.route?.path ?? null}
                              isActive={menu.state === "active"}
                              submenuCount={menu.submenus.length}
                              isSelected={selection?.kind === "menu" && selection.id === menu.id}
                              isFirst={index === 0}
                              isLast={index === order.length - 1}
                              canMove={permissions.canUpdate}
                              onMove={move}
                              onEdit={() => setSelection({ kind: "menu", id: menu.id })}
                            />
                            {submenus.length > 0 && (
                              <SortableContext
                                items={submenus.map((submenu) => `submenu:${menu.id}:${submenu.id}`)}
                                strategy={verticalListSortingStrategy}
                              >
                                <ol aria-label={`Submenús de ${menu.name}`} className="flex flex-col gap-2 ps-6 sm:ps-10">
                                  {submenus.map((submenu, subIndex) => (
                                    <SortableItem key={submenu.id} nodeKey={`submenu:${menu.id}:${submenu.id}`} canDrag={permissions.canUpdate}>
                                      {(subHandle) => (
                                        <TreeRow
                                          nodeKey={`submenu:${menu.id}:${submenu.id}`}
                                          handle={subHandle}
                                          name={submenu.name ?? ""}
                                          icon={submenu.icon}
                                          path={submenu.route?.path ?? null}
                                          isActive={submenu.state === "active"}
                                          isFirst={subIndex === 0}
                                          isLast={subIndex === submenus.length - 1}
                                          canMove={permissions.canUpdate}
                                          onMove={move}
                                          onEdit={() => setSelection({ kind: "menu", id: menu.id })}
                                          editLabel={`Editar ${menu.name} (submenú ${submenu.name})`}
                                        />
                                      )}
                                    </SortableItem>
                                  ))}
                                </ol>
                              </SortableContext>
                            )}
                          </>
                        )}
                      </SortableItem>
                    );
                  })}
                </ol>
              </SortableContext>
            </DndContext>
          )}
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>

        <UnsavedBar
          count={moved}
          note="el menú lateral cambia al guardar"
          saveLabel="Guardar orden"
          onDiscard={() => {
            setDraftOrder(null);
            setAnnouncement("Orden descartado.");
          }}
          onSave={onSaveOrder}
          isSaving={saveOrder.isPending}
        />
      </section>

      <section aria-label="Editor de menú" className="rounded-card bg-surface p-4 shadow-surface sm:p-6">
        {selection === null || (selection.kind === "menu" && !selectedMenu) ? (
          <EmptyState
            icon={Pencil}
            title="Elige un menú"
            description={permissions.canUpdate ? "Usa el lápiz de una fila para editar su nombre, ruta, ícono y submenús." : "Usa el lápiz de una fila para ver su detalle."}
          />
        ) : (
          <MenuEditor
            key={selection.kind === "menu" ? selection.id : "new"}
            menu={selectedMenu}
            routeOptions={routeOptions}
            permissions={permissions}
            onSaved={(id) => setSelection({ kind: "menu", id })}
            onCancel={() => setSelection(null)}
          />
        )}
      </section>
    </div>
  );
}

const DRAG_INSTRUCTIONS = "Arrastra con el puntero desde el asa. Con teclado, usa Alt + flecha arriba o abajo.";

/** Anuncios de dnd-kit en español (por defecto vienen en inglés). */
const DRAG_ANNOUNCEMENTS = {
  onDragStart: () => "Moviendo el elemento.",
  onDragOver: () => undefined,
  onDragEnd: ({ over }: { over: unknown }) => (over ? "Elemento soltado." : "Movimiento cancelado."),
  onDragCancel: () => "Movimiento cancelado.",
};

/** Asa de arrastre que el SortableItem entrega a su fila. */
interface DragHandle {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
}

/** <li> ordenable: se mueve entero (un menú arrastra también sus submenús). */
function SortableItem({
  nodeKey,
  canDrag,
  className,
  children,
}: {
  nodeKey: NodeKey;
  canDrag: boolean;
  className?: string;
  children: (handle: DragHandle | null) => ReactNode;
}) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: nodeKey,
    disabled: !canDrag,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };
  return (
    <li ref={setNodeRef} style={style} className={className}>
      {children(canDrag ? { setActivatorNodeRef, listeners, isDragging } : null)}
    </li>
  );
}

function TreeRow({
  nodeKey,
  handle,
  name,
  icon,
  path,
  isActive,
  submenuCount = 0,
  isSelected = false,
  isFirst,
  isLast,
  canMove,
  onMove,
  onEdit,
  editLabel,
}: {
  nodeKey: NodeKey;
  handle: DragHandle | null;
  name: string;
  icon: string | null;
  path: string | null;
  isActive: boolean;
  submenuCount?: number;
  isSelected?: boolean;
  isFirst: boolean;
  isLast: boolean;
  canMove: boolean;
  onMove: (key: NodeKey, delta: -1 | 1, control: FocusControl) => void;
  onEdit: () => void;
  editLabel?: string;
}) {
  return (
    <div
      data-node={nodeKey}
      className={[
        "flex items-center gap-2 rounded-[16px] px-2 py-2 sm:gap-3 sm:px-3",
        handle?.isDragging ? "bg-surface shadow-overlay" : isSelected ? "bg-accent-soft" : "bg-surface-secondary",
      ].join(" ")}
    >
      {/* Solo puntero: con teclado se reordena con Alt+↑/↓ o los botones, así que el asa no recibe foco. */}
      <span
        ref={handle?.setActivatorNodeRef}
        {...handle?.listeners}
        aria-hidden
        className={[
          "flex h-9 w-5 shrink-0 items-center justify-center rounded-md text-muted",
          handle ? (handle.isDragging ? "cursor-grabbing touch-none" : "cursor-grab touch-none hover:text-foreground") : "opacity-40",
        ].join(" ")}
      >
        <GripVertical className="size-4" />
      </span>
      <span
        aria-hidden
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          isSelected ? "bg-accent text-accent-foreground" : "bg-surface text-foreground",
        ].join(" ")}
      >
        {createElement(menuIcon(icon), { className: "size-4" })}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="truncate text-body font-semibold">{name}</span>
          {!isActive && (
            <Chip variant="soft" color="default" size="sm">
              <Chip.Label>Inactivo</Chip.Label>
            </Chip>
          )}
        </span>
        <span className="truncate font-mono text-[12px] text-muted">{path ?? "Agrupa submenús"}</span>
      </span>
      {submenuCount > 0 && (
        <span className="hidden text-small whitespace-nowrap text-muted sm:inline">
          {submenuCount} {submenuCount === 1 ? "submenú" : "submenús"}
        </span>
      )}
      {canMove && (
        <span className="flex shrink-0">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            data-control="up"
            aria-label={`Subir ${name}`}
            aria-keyshortcuts="Alt+ArrowUp"
            isDisabled={isFirst}
            onPress={() => onMove(nodeKey, -1, "up")}
          >
            <ChevronUp aria-hidden className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            data-control="down"
            aria-label={`Bajar ${name}`}
            aria-keyshortcuts="Alt+ArrowDown"
            isDisabled={isLast}
            onPress={() => onMove(nodeKey, 1, "down")}
          >
            <ChevronDown aria-hidden className="size-4" />
          </Button>
        </span>
      )}
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        data-control="edit"
        aria-label={editLabel ?? `Editar ${name}`}
        aria-keyshortcuts={canMove ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
        onPress={onEdit}
      >
        <Pencil aria-hidden className="size-4" />
      </Button>
    </div>
  );
}

type RouteOptions = ReturnType<typeof useRouteOptions>;

function menuDefaults(menu: MenuNode | null): MenuForm {
  return {
    name: menu?.name ?? "",
    icon: menu?.icon ?? "",
    isActive: menu ? menu.state === "active" : true,
    // El backend no guarda "tiene submenús": un menú sin ruta directa es un grupo.
    hasSubmenus: menu ? menu.route === null : false,
    routeId: menu?.route?.id ?? null,
  };
}

function MenuEditor({
  menu,
  routeOptions,
  permissions,
  onSaved,
  onCancel,
}: {
  menu: MenuNode | null;
  routeOptions: RouteOptions;
  permissions: RoutePermissions;
  onSaved: (id: number) => void;
  onCancel: () => void;
}) {
  const save = useSaveMenuMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submenuEditing, setSubmenuEditing] = useState<{ submenu: SubmenuNode | null } | null>(null);
  const canSave = menu ? permissions.canUpdate : permissions.canCreate;
  const { control, handleSubmit, setError, reset, setValue } = useForm<MenuForm>({
    resolver: zodResolver(menuFormSchema),
    // Validar al guardar: con "onTouched", el error que aparece al salir del campo mueve el botón
    // Guardar entre el mousedown y el click, y el click se pierde.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: menuDefaults(menu),
  });
  const hasSubmenus = useWatch({ control, name: "hasSubmenus" });
  const isActive = useWatch({ control, name: "isActive" });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const body = {
      name: values.name,
      icon: values.icon,
      state: values.isActive ? ("active" as const) : ("inactive" as const),
      hasSubmenus: values.hasSubmenus,
      routeId: values.hasSubmenus ? null : values.routeId,
    };
    save.mutate(
      { id: menu?.id ?? null, body },
      {
        onSuccess: (saved) => {
          toast.success(menu ? `Menú guardado: ${saved.name}` : `Menú creado: ${saved.name}`);
          reset(menuDefaults(saved));
          onSaved(saved.id);
        },
        onError: (error) => {
          if (!applyServerErrors(error, setError, ["name", "icon", "routeId"])) setFormError(adminErrorMessage(error));
        },
      },
    );
  });

  const submenus = menu?.submenus ?? [];

  return (
    <>
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <h2 className="text-title">{menu ? `Editar menú · ${menu.name}` : "Nuevo menú"}</h2>
      <fieldset disabled={!canSave} className="contents">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="name" label="Nombre" maxLength={50} isDisabled={!canSave} autoFocus={!menu} />
          <FormSelectField
            control={control}
            name="routeId"
            label="Ruta"
            placeholder="Elige una ruta"
            options={
              routeOptions.unavailableMessage && menu?.route
                ? [{ id: menu.route.id, label: menu.route.name ?? "", detail: menu.route.path ?? undefined }]
                : routeOptions.options
            }
            isLoading={routeOptions.isLoading}
            isDisabled={!canSave || hasSubmenus}
            unavailableMessage={routeOptions.unavailableMessage}
            description={hasSubmenus ? "Con submenús, cada submenú lleva su propia ruta." : undefined}
          />
        </div>

        <FormIconField control={control} name="icon" isDisabled={!canSave} />

        <div className="flex flex-col gap-4 border-t border-separator pt-4">
          <SwitchRow
            label="Habilitar submenús"
            description={hasSubmenus ? "El menú agrupa submenús y no abre una pantalla." : "El menú abre directamente su ruta."}
            isSelected={hasSubmenus}
            isDisabled={!canSave}
            onChange={(value) => setValue("hasSubmenus", value, { shouldDirty: true, shouldValidate: true })}
          />
          <SwitchRow
            label="Menú activo"
            description={isActive ? undefined : "No aparece en la navegación de ningún rol."}
            isSelected={isActive}
            isDisabled={!canSave}
            onChange={(value) => setValue("isActive", value, { shouldDirty: true })}
          />
        </div>
      </fieldset>

      {(hasSubmenus || submenus.length > 0) && (
        <div className="flex flex-col gap-2 rounded-[16px] bg-surface-secondary p-3">
          {!hasSubmenus && (
            <p className="px-2 text-small text-warning-soft-foreground">
              Con los submenús deshabilitados, estos se conservan pero el menú abre su ruta.
            </p>
          )}
          {submenus.length === 0 ? (
            <p className="px-2 py-2 text-small text-muted">Este menú todavía no tiene submenús.</p>
          ) : (
            <ul aria-label="Submenús" className="flex flex-col gap-2">
              {submenus.map((submenu) => (
                <li key={submenu.id} className="flex items-center gap-3 rounded-[12px] bg-surface px-4 py-3">
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-body">{submenu.name}</span>
                    {submenu.state === "inactive" && (
                      <Chip variant="soft" color="default" size="sm">
                        <Chip.Label>Inactivo</Chip.Label>
                      </Chip>
                    )}
                  </span>
                  <span className="hidden truncate font-mono text-[12px] text-muted sm:inline">{submenu.route?.path}</span>
                  {permissions.canUpdate && (
                    <Button isIconOnly size="sm" variant="ghost" aria-label={`Editar submenú ${submenu.name}`} onPress={() => setSubmenuEditing({ submenu })}>
                      <Pencil aria-hidden className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {permissions.canCreate &&
            (menu ? (
              <Button variant="ghost" className="self-start text-accent" onPress={() => setSubmenuEditing({ submenu: null })}>
                <Plus aria-hidden className="size-4" />
                Agregar submenú
              </Button>
            ) : (
              <p className="px-2 text-small text-muted">Guarda el menú para agregarle submenús.</p>
            ))}
        </div>
      )}

      {formError && (
        <p role="alert" className="rounded-field bg-danger-soft px-4 py-3 text-small text-danger-soft-foreground">
          {formError}
        </p>
      )}

      {canSave && (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            isDisabled={save.isPending}
            onPress={() => {
              if (menu) reset(menuDefaults(menu));
              else onCancel();
              setFormError(null);
            }}
          >
            Descartar
          </Button>
          <Button type="submit" variant="primary" isPending={save.isPending}>
            Guardar menú
          </Button>
        </div>
      )}
    </form>

    {/* Fuera del <form>: el submit del modal (en un portal) también burbujea por el árbol de React. */}
    {menu && (
      <FormModal isOpen={submenuEditing !== null} onOpenChange={(open) => !open && setSubmenuEditing(null)}>
        {submenuEditing && (
          <SubmenuFormBody menu={menu} submenu={submenuEditing.submenu} routeOptions={routeOptions} onDone={() => setSubmenuEditing(null)} />
        )}
      </FormModal>
    )}
    </>
  );
}

function SubmenuFormBody({
  menu,
  submenu,
  routeOptions,
  onDone,
}: {
  menu: MenuNode;
  submenu: SubmenuNode | null;
  routeOptions: RouteOptions;
  onDone: () => void;
}) {
  const save = useSaveSubmenuMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, setValue } = useForm<SubmenuForm>({
    resolver: zodResolver(submenuFormSchema),
    // Validar al guardar: con "onTouched", el error que aparece al salir del campo mueve el botón
    // Guardar entre el mousedown y el click, y el click se pierde.
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: submenu?.name ?? "",
      icon: submenu?.icon ?? menu.icon ?? "",
      isActive: submenu ? submenu.state === "active" : true,
      routeId: submenu?.route?.id ?? (undefined as unknown as number),
    },
  });
  const isActive = useWatch({ control, name: "isActive" });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    save.mutate(
      {
        id: submenu?.id ?? null,
        body: {
          menuId: menu.id,
          name: values.name,
          icon: values.icon,
          state: values.isActive ? "active" : "inactive",
          routeId: values.routeId,
        },
      },
      {
        onSuccess: (saved) => {
          toast.success(submenu ? `Submenú guardado: ${saved.name}` : `Submenú agregado: ${saved.name}`);
          onDone();
        },
        onError: (error) => {
          if (!applyServerErrors(error, setError, ["name", "icon", "routeId"])) setFormError(adminErrorMessage(error));
        },
      },
    );
  });

  return (
    <FormModalContent
      title={submenu ? `Editar submenú · ${submenu.name}` : `Agregar submenú a ${menu.name}`}
      onSubmit={onSubmit}
      submitLabel={submenu ? "Guardar submenú" : "Agregar submenú"}
      isPending={save.isPending}
      formError={formError}
    >
      <FormTextField control={control} name="name" label="Nombre" maxLength={50} autoFocus />
      <FormSelectField
        control={control}
        name="routeId"
        label="Ruta"
        placeholder="Elige una ruta"
        options={
          routeOptions.unavailableMessage && submenu?.route
            ? [{ id: submenu.route.id, label: submenu.route.name ?? "", detail: submenu.route.path ?? undefined }]
            : routeOptions.options
        }
        isLoading={routeOptions.isLoading}
        unavailableMessage={routeOptions.unavailableMessage}
      />
      <FormIconField control={control} name="icon" />
      <SwitchRow
        label="Submenú activo"
        isSelected={isActive}
        onChange={(value) => setValue("isActive", value, { shouldDirty: true })}
      />
    </FormModalContent>
  );
}
