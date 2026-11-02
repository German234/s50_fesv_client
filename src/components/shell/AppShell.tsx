"use client";

import { Drawer, Spinner } from "@heroui/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useEffect } from "react";
import { ForbiddenState } from "@/components/fiscal/StateViews";
import { findSource, getCountryTexts, useCountry } from "@/config/country";
import { useSession } from "@/features/auth/queries";
import { useRouteAccess } from "@/features/menu";
import { DESKTOP_QUERY, useMediaQuery, useShortcut, useShortcutListener } from "@/lib/hooks";
import { useSource, useSourceUrlSync, useUiStore, withSource } from "@/stores";
import { breadcrumbsFor } from "./breadcrumbs";
import { CommandPalette, PALETTE_COMBO } from "./CommandPalette";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Shell autenticado (CLAUDE.md §8): sidebar fija desde 1280 px y en drawer por debajo, TopBar,
 * paleta ⌘K y hoja de atajos. Usa useSearchParams: el layout lo envuelve en un Suspense.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isKnownSource = useCallback((code: string) => findSource(getCountryTexts(), code) !== undefined, []);
  useSourceUrlSync(isKnownSource);
  useShellShortcuts(isDesktop);

  // El drawer se cierra al navegar o al pasar a escritorio.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, searchParams, isDesktop, setSidebarOpen]);

  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-surface px-4 py-2 shadow-overlay focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>

      {/* Siempre en el HTML para que en escritorio no parpadee al hidratar; oculta por CSS debajo de 1280 px. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 xl:block">
        <Sidebar isActiveInstance={isDesktop} />
      </aside>

      {!isDesktop && (
        <Drawer>
          <Drawer.Backdrop isOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
            <Drawer.Content placement="left">
              <Drawer.Dialog aria-label="Navegación" className="shell-drawer m-3 h-[calc(100%-24px)] w-[min(288px,calc(100vw-24px))] max-w-none bg-background p-0">
                <Sidebar isActiveInstance />
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar showMenuButton={!isDesktop} />
        <main id="contenido" tabIndex={-1} className="flex min-w-0 flex-1 flex-col px-4 pb-10 outline-none xl:px-8">
          <RouteAccessGate pathname={pathname}>{children}</RouteAccessGate>
        </main>
      </div>

      <CommandPalette />
      <ShortcutsSheet />
    </div>
  );
}

/** --drawer-enter-duration de @heroui/styles (250 ms) y un margen. */
const DRAWER_ENTER_MS = 280;

function useShellShortcuts(isDesktop: boolean) {
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setSourcePickerOpen = useUiStore((state) => state.setSourcePickerOpen);

  useShortcutListener();
  useShortcut(
    { id: "shell.palette", combo: PALETTE_COMBO, description: "Buscar o ir a… (paleta)", group: "General", allowInInputs: true, allowInModals: true },
    () => {
      const { paletteOpen } = useUiStore.getState();
      setShortcutsOpen(false);
      setPaletteOpen(!paletteOpen);
    },
  );
  useShortcut({ id: "shell.shortcuts", combo: "?", description: "Ver los atajos de teclado", group: "General" }, () =>
    setShortcutsOpen(true),
  );
  useShortcut({ id: "shell.source", combo: "f", description: "Cambiar de fuente", group: "General" }, () => {
    if (isDesktop) {
      setSourcePickerOpen(true);
      return;
    }
    // Debajo de 1280 px el selector vive en el drawer: abierto durante la animación de entrada,
    // el popover se posiciona contra un trigger que todavía se mueve y queda fuera de vista.
    setSidebarOpen(true);
    setTimeout(() => setSourcePickerOpen(true), DRAWER_ENTER_MS);
  });
}

/**
 * "Sin acceso" para las pantallas que el rol no puede leer (/auth/me/permissions), sin tocar la
 * sesión. Cada pantalla además muestra el mismo estado ante un 403 de sus propias llamadas.
 */
function RouteAccessGate({ pathname, children }: { pathname: string; children: ReactNode }) {
  const country = useCountry();
  const { source } = useSource();
  const { user } = useSession();
  const access = useRouteAccess(pathname, source);

  if (access === "loading") {
    return (
      <div role="status" className="flex flex-1 items-center justify-center gap-2 text-muted">
        <Spinner size="sm" aria-hidden />
        Comprobando permisos…
      </div>
    );
  }

  if (access === "forbidden") {
    const screen = breadcrumbsFor(pathname, country).map((crumb) => crumb.label).join(" · ") || "esta pantalla";
    const sourceName = findSource(country, source)?.name;
    return (
      <div className="flex flex-1 items-center justify-center">
        <ForbiddenState
          resource={sourceName ? `${screen} de ${sourceName}` : screen}
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

  return children;
}
