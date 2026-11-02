import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TableDensity = "comfortable" | "compact";

interface UiState {
  density: TableDensity;
  /** Sidebar colapsada en escritorio (≥ 1280 px). */
  sidebarCollapsed: boolean;
  /** Drawer de la sidebar abierto (< 1280 px). No se persiste. */
  sidebarOpen: boolean;
  setDensity: (density: TableDensity) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
}

/**
 * Preferencias de UI de este navegador. Densidad y sidebar colapsada se guardan en
 * localStorage; `skipHydration` evita diferencias con el HTML del servidor: Providers
 * llama a `useUiStore.persist.rehydrate()` al montar.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      density: "comfortable",
      sidebarCollapsed: false,
      sidebarOpen: false,
      setDensity: (density) => set({ density }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "fesv-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ density, sidebarCollapsed }) => ({ density, sidebarCollapsed }),
      skipHydration: true,
    },
  ),
);
