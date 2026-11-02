"use client";

import { Checkbox, Pagination, Table, type Key, type Selection, type SortDescriptor } from "@heroui/react";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { type TableDensity, useUiStore } from "@/stores/useUiStore";
import { TableSkeleton } from "./TableSkeleton";

export type RowId = string | number;

/** true, o el motivo por el que la fila no se puede seleccionar ("Cliente no registrado"). */
export type RowSelectability = true | { reason: ReactNode };

export interface CellContext {
  isSelected: boolean;
  /** Motivo del bloqueo; la columna con `showsBlockedReason` lo pinta bajo su contenido. */
  blockedReason: ReactNode | null;
}

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, context: CellContext) => ReactNode;
  allowsSorting?: boolean;
  align?: "start" | "end";
  /** Columna que identifica la fila para lectores de pantalla (p. ej. Referencia). */
  isRowHeader?: boolean;
  /** Muestra el motivo del bloqueo bajo la celda (p. ej. Cliente). Por defecto, la primera columna. */
  showsBlockedReason?: boolean;
  /** Ancho mínimo en px. */
  minWidth?: number;
}

export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export interface DataTableProps<T> {
  /** Nombre de la tabla para lectores de pantalla. */
  "aria-label": string;
  /** Filas de la página actual (la paginación la hace quien llama, normalmente el servidor). */
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => RowId;
  /** Texto de la fila en el checkbox: "Seleccionar FAC-004512". */
  getRowLabel: (row: T) => string;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  /** Selección controlada. Se conserva entre páginas. Sin onSelectionChange no hay checkboxes. */
  selectedIds?: ReadonlySet<RowId>;
  onSelectionChange?: (ids: Set<RowId>) => void;
  isRowSelectable?: (row: T) => RowSelectability;
  /** Enter o clic en la fila: abrir el detalle. */
  onRowAction?: (row: T) => void;
  pagination?: DataTablePagination;
  /** Por defecto, la densidad guardada en useUiStore. */
  density?: TableDensity;
  isLoading?: boolean;
  loadingMessage?: string;
  /** Contenido cuando no hay filas (EmptyState). */
  emptyState?: ReactNode;
  /** J/K mueven el foco entre filas y X selecciona la fila enfocada. Por defecto activo. */
  enableShortcuts?: boolean;
  className?: string;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

/**
 * Tabla de datos sobre HeroUI Table (React Aria): orden y selección controlados, filas
 * bloqueadas con motivo, paginación, densidad y atajos J/K/X. Renderiza solo la página
 * actual, así que el número total de filas no afecta la fluidez.
 */
export function DataTable<T>({
  "aria-label": ariaLabel,
  rows,
  columns,
  getRowId,
  getRowLabel,
  sortDescriptor,
  onSortChange,
  selectedIds,
  onSelectionChange,
  isRowSelectable,
  onRowAction,
  pagination,
  density,
  isLoading = false,
  loadingMessage = "Cargando…",
  emptyState,
  enableShortcuts = true,
  className,
}: DataTableProps<T>) {
  const storedDensity = useUiStore((state) => state.density);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectable = onSelectionChange !== undefined;
  const selected = selectedIds ?? new Set<RowId>();

  const blocked = new Map<RowId, ReactNode>();
  for (const row of rows) {
    const result = isRowSelectable?.(row) ?? true;
    if (result !== true) blocked.set(getRowId(row), result.reason);
  }
  const reasonColumnId = (columns.find((c) => c.showsBlockedReason) ?? columns[0])?.id;
  const pageIds = rows.map(getRowId);
  const selectableIds = pageIds.filter((id) => !blocked.has(id));

  function handleSelectionChange(keys: Selection) {
    if (!onSelectionChange) return;
    const onPage = keys === "all" ? new Set<RowId>(selectableIds) : new Set<RowId>(keys as Set<RowId>);
    // La selección de otras páginas se conserva; en esta página manda lo que dijo la tabla.
    const next = new Set<RowId>([...selected].filter((id) => !pageIds.includes(id)));
    for (const id of onPage) if (!blocked.has(id)) next.add(id);
    onSelectionChange(next);
  }

  function toggleRow(row: T) {
    const id = getRowId(row);
    if (!onSelectionChange || blocked.has(id)) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!enableShortcuts || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key !== "j" && key !== "k" && key !== "x") return;

    const bodyRows = Array.from(containerRef.current?.querySelectorAll<HTMLElement>("tbody [role='row']") ?? []);
    if (bodyRows.length === 0) return;
    const current = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[role='row']") ?? null;
    const index = current ? bodyRows.indexOf(current) : -1;
    event.preventDefault();

    if (key === "x") {
      const row = index >= 0 ? rows[index] : undefined;
      if (row) toggleRow(row);
      return;
    }
    const nextIndex = key === "j" ? Math.min(index + 1, bodyRows.length - 1) : Math.max(index - 1, 0);
    bodyRows[nextIndex]?.focus();
  }

  if (isLoading) {
    return <TableSkeleton message={loadingMessage} className={className} />;
  }

  const rowsById = new Map(rows.map((row) => [getRowId(row), row]));

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={["data-table overflow-hidden rounded-card bg-surface shadow-surface", className].filter(Boolean).join(" ")}
      data-density={density ?? storedDensity}
    >
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={ariaLabel}
            selectionMode={selectable ? "multiple" : "none"}
            selectionBehavior="toggle"
            selectedKeys={new Set([...selected].filter((id) => pageIds.includes(id)))}
            onSelectionChange={handleSelectionChange}
            disabledKeys={[...blocked.keys()]}
            disabledBehavior="selection"
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
            onRowAction={onRowAction ? (key: Key) => {
              const row = rowsById.get(key as RowId);
              if (row) onRowAction(row);
            } : undefined}
          >
            <Table.Header>
              {[
                ...(selectable
                  ? [
                      <Table.Column key="__select" id="__select" className="w-12">
                        <Checkbox aria-label="Seleccionar todos los de esta página" slot="selection">
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </Table.Column>,
                    ]
                  : []),
                ...columns.map((column) => (
                  <Table.Column
                    key={column.id}
                    id={column.id}
                    allowsSorting={column.allowsSorting}
                    isRowHeader={column.isRowHeader}
                    style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                    className={column.align === "end" ? "text-end" : undefined}
                  >
                    {({ sortDirection }) =>
                      column.allowsSorting ? (
                        <Table.SortableColumnHeader sortDirection={sortDirection}>{column.header}</Table.SortableColumnHeader>
                      ) : (
                        column.header
                      )
                    }
                  </Table.Column>
                )),
              ]}
            </Table.Header>
            <Table.Body renderEmptyState={emptyState ? () => emptyState : undefined}>
              {rows.map((row) => {
                const id = getRowId(row);
                const reason = blocked.get(id) ?? null;
                const context: CellContext = { isSelected: selected.has(id), blockedReason: reason };
                return (
                  <Table.Row key={id} id={id} className={reason !== null ? "data-table__row--blocked" : undefined}>
                    {[
                      ...(selectable
                        ? [
                            <Table.Cell key="__select">
                              <Checkbox
                                slot="selection"
                                aria-label={
                                  reason !== null ? `${getRowLabel(row)}: no se puede seleccionar` : `Seleccionar ${getRowLabel(row)}`
                                }
                              >
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                              </Checkbox>
                            </Table.Cell>,
                          ]
                        : []),
                      ...columns.map((column) => (
                        <Table.Cell key={column.id} className={column.align === "end" ? "text-end" : undefined}>
                          {column.cell(row, context)}
                          {reason !== null && column.id === reasonColumnId && (
                            <div className="text-small text-danger-soft-foreground">{reason}</div>
                          )}
                        </Table.Cell>
                      )),
                    ]}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      {pagination && <TablePagination {...pagination} />}
    </div>
  );
}

/** Páginas visibles: primera, última y vecinas de la actual, con elipsis entre medio. */
function pageItems(page: number, pageCount: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < pageCount - 1) items.push("ellipsis-end");
  items.push(pageCount);
  return items;
}

function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [25, 50, 100],
  onPageSizeChange,
}: DataTablePagination) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-separator px-5 py-3 text-small">
      {onPageSizeChange ? (
        <label className="flex items-center gap-2 text-muted">
          Filas por página
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-field bg-surface-secondary px-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span />
      )}
      <Pagination size="sm" className="w-auto">
        <Pagination.Summary className="font-mono text-[12px] text-muted tabular-nums">
          {first}–{last} de {total}
        </Pagination.Summary>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous aria-label="Página anterior" isDisabled={page <= 1} onPress={() => onPageChange(page - 1)}>
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>
          {pageItems(page, pageCount).map((item) =>
            typeof item === "number" ? (
              <Pagination.Item key={item}>
                <Pagination.Link
                  isActive={item === page}
                  aria-label={`Página ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  onPress={() => onPageChange(item)}
                >
                  {item}
                </Pagination.Link>
              </Pagination.Item>
            ) : (
              <Pagination.Item key={item}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            ),
          )}
          <Pagination.Item>
            <Pagination.Next aria-label="Página siguiente" isDisabled={page >= pageCount} onPress={() => onPageChange(page + 1)}>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}
