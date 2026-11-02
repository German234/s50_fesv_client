"use client";

import { Breadcrumbs, Button, Kbd, Tooltip } from "@heroui/react";
import { Keyboard, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCountry } from "@/config/country";
import { formatCombo, useIsMac } from "@/lib/hooks";
import { useSource, useUiStore, withSource } from "@/stores";
import { breadcrumbsFor } from "./breadcrumbs";
import { PALETTE_COMBO } from "./CommandPalette";

export type Environment = "production" | "test";

/**
 * Ambiente de la autoridad fiscal. El backend todavía no lo expone (ni en /meta/country ni en
 * /health): es un cambio de contrato pendiente y, mientras tanto, el chip no se muestra.
 */
const ENVIRONMENT: Environment | null = null;

/** Barra superior (B · Barra superior): migas, búsqueda que abre la paleta, ambiente y atajos. */
export function TopBar({ showMenuButton }: { showMenuButton: boolean }) {
  const country = useCountry();
  const pathname = usePathname();
  const { source } = useSource();
  const isMac = useIsMac();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setPaletteOpen = useUiStore((state) => state.setPaletteOpen);
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen);
  const crumbs = breadcrumbsFor(pathname, country);
  const paletteKeys = formatCombo(PALETTE_COMBO, isMac);

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-3 px-4 xl:px-8">
      {showMenuButton && (
        <Button isIconOnly variant="ghost" aria-label="Abrir navegación" onPress={() => setSidebarOpen(true)}>
          <Menu aria-hidden className="size-5" />
        </Button>
      )}

      {crumbs.length > 0 && (
        <Breadcrumbs aria-label="Ubicación" className="min-w-0 text-body">
          {crumbs.map((crumb, index) => (
            <Breadcrumbs.Item
              key={`${index}-${crumb.label}`}
              href={crumb.href ? withSource(crumb.href, source) : undefined}
              className={index === crumbs.length - 1 ? "font-medium text-foreground" : "text-muted"}
            >
              {crumb.label}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-haspopup="dialog"
          aria-keyshortcuts="Meta+K Control+K"
          className="hidden h-11 w-[clamp(220px,28vw,340px)] items-center gap-2.5 rounded-full bg-surface pr-2 pl-4 text-left text-muted shadow-surface outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus md:flex"
        >
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Buscar documento, cliente o ir a…</span>
          <Kbd aria-hidden className={`h-6 shrink-0 px-1.5 text-[11px] ${isMac ? "" : "gap-1"}`}>
            {paletteKeys.map((key) => (
              <span key={key}>{key}</span>
            ))}
          </Kbd>
        </button>
        <Button
          isIconOnly
          variant="secondary"
          aria-label="Buscar o ir a…"
          className="rounded-full bg-surface shadow-surface md:hidden"
          onPress={() => setPaletteOpen(true)}
        >
          <Search aria-hidden className="size-4" />
        </Button>

        {ENVIRONMENT && <EnvironmentChip environment={ENVIRONMENT} />}

        <Tooltip delay={300}>
          <Button
            isIconOnly
            variant="secondary"
            aria-label="Atajos de teclado"
            aria-keyshortcuts="?"
            className="size-11 rounded-full bg-surface shadow-surface"
            onPress={() => setShortcutsOpen(true)}
          >
            <Keyboard aria-hidden className="size-5" />
          </Button>
          <Tooltip.Content>Atajos de teclado (?)</Tooltip.Content>
        </Tooltip>
      </div>
    </header>
  );
}

/** Punto verde "Producción"; en pruebas, warning. */
export function EnvironmentChip({ environment }: { environment: Environment }) {
  const production = environment === "production";
  return (
    <span
      className={[
        "hidden h-11 items-center gap-2 rounded-full px-4 text-body font-medium sm:flex",
        production ? "bg-success-soft text-success-soft-foreground" : "bg-warning-soft text-warning-soft-foreground",
      ].join(" ")}
    >
      <span aria-hidden className={`size-2 rounded-full ${production ? "bg-success" : "bg-warning"}`} />
      {production ? "Producción" : "Pruebas"}
    </span>
  );
}
