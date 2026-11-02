import { create } from "zustand";

export type SelectionId = string | number;

/**
 * Ámbito de una selección: bandeja (p. ej. "transmitir") + tipo de la API ("fce", "nc"…)
 * + fuente. Incluir la fuente evita transmitir documentos de una fuente que ya no se ve.
 */
export function selectionScope(inbox: string, type: string, source: string): string {
  return `${inbox}:${type}:${source}`;
}

interface SelectionState {
  byScope: Record<string, SelectionId[]>;
  toggle: (scope: string, id: SelectionId) => void;
  select: (scope: string, ids: SelectionId[]) => void;
  deselect: (scope: string, ids: SelectionId[]) => void;
  clear: (scope: string) => void;
  clearAll: () => void;
}

const EMPTY: SelectionId[] = [];

export const useSelectionStore = create<SelectionState>()((set) => ({
  byScope: {},
  toggle: (scope, id) =>
    set((state) => {
      const current = state.byScope[scope] ?? EMPTY;
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      return { byScope: { ...state.byScope, [scope]: next } };
    }),
  select: (scope, ids) =>
    set((state) => {
      const current = state.byScope[scope] ?? EMPTY;
      return { byScope: { ...state.byScope, [scope]: [...new Set([...current, ...ids])] } };
    }),
  deselect: (scope, ids) =>
    set((state) => {
      const remove = new Set(ids);
      const current = state.byScope[scope] ?? EMPTY;
      return { byScope: { ...state.byScope, [scope]: current.filter((item) => !remove.has(item)) } };
    }),
  clear: (scope) =>
    set((state) => {
      const rest = { ...state.byScope };
      delete rest[scope];
      return { byScope: rest };
    }),
  clearAll: () => set({ byScope: {} }),
}));

/** Ids seleccionados del ámbito (referencia estable si no cambia). */
export function useSelection(scope: string): SelectionId[] {
  return useSelectionStore((state) => state.byScope[scope] ?? EMPTY);
}
