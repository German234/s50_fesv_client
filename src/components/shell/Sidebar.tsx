"use client";

import { Button, Skeleton } from "@heroui/react";
import { ChevronDown, RotateCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { getCountryTexts } from "@/config/country";
import { useSession } from "@/features/auth/queries";
import { type NavGroup, type NavLink, useNavigation } from "@/features/menu";
import { useSource, withSource } from "@/stores";
import { SourceSwitcher } from "./SourceSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserCard } from "./UserCard";

export interface SidebarProps {
  /**
   * La instancia visible (fija en escritorio o en el drawer). Solo ella responde a la tecla F:
   * la otra puede estar montada pero oculta.
   */
  isActiveInstance: boolean;
}

/** Sidebar del shell (B · Navegación lateral): marca, fuente, menú del backend, tema y usuario. */
export function Sidebar({ isActiveInstance }: SidebarProps) {
  const { subtitle } = getCountryTexts();

  return (
    <div className="flex h-full flex-col gap-5 px-3.5 py-4">
      <div className="flex items-center gap-3 px-1">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fiscal text-fiscal-foreground">
          <ShieldCheck aria-hidden className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-heading">Facturación</span>
          <span className="text-small text-muted">{subtitle}</span>
        </div>
      </div>

      <SourceSwitcher isActiveInstance={isActiveInstance} />

      <nav aria-label="Navegación principal" className="-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-1 [scrollbar-width:thin]">
        <NavigationTree />
      </nav>

      <div className="flex flex-col gap-3">
        <ThemeToggle />
        <UserCard />
      </div>
    </div>
  );
}

function NavigationTree() {
  const { entries, isLoading, error } = useNavigation();
  const { isFetching, refetch } = useSession();
  const pathname = usePathname();
  const { source } = useSource();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" role="status" aria-label="Cargando menú">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 rounded-[14px]" />
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {entries.map((entry) =>
        entry.kind === "link" ? (
          <li key={entry.id}>
            <NavItem link={entry} pathname={pathname} source={source} />
          </li>
        ) : (
          <NavSection key={entry.id} group={entry} pathname={pathname} source={source} />
        ),
      )}
      {error && (
        <li role="alert" className="mt-2 flex flex-col items-start gap-2 rounded-field bg-danger-soft p-3 text-small text-danger-soft-foreground">
          No pudimos cargar el menú.
          <Button size="sm" variant="secondary" isPending={isFetching} onPress={() => void refetch()}>
            <RotateCw aria-hidden className="size-3.5" />
            Reintentar
          </Button>
        </li>
      )}
    </ul>
  );
}

function isActive(link: NavLink, pathname: string, source: string): boolean {
  if (!link.href) return false;
  const matchesPath = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
  return matchesPath && (link.source === undefined || link.source === source);
}

interface NavItemProps {
  link: NavLink;
  pathname: string;
  source: string;
  /** Badge de conteo: accent (Transmitir, pendientes) u oscuro (Emitidos, rechazados). */
  badge?: { count: number; tone: "accent" | "dark"; label: string };
}

// Badges: se conectan en las etapas de bandeja (pendientes) y de emitidos (rechazados).
function NavItem({ link, pathname, source, badge }: NavItemProps) {
  const Icon = link.icon;
  const base = "flex h-10 items-center gap-3 rounded-[14px] px-3 text-body outline-none";

  if (!link.href) {
    return (
      <span aria-disabled="true" title="Sin pantalla en esta versión" className={`${base} cursor-not-allowed text-muted opacity-70`}>
        <Icon aria-hidden className="size-5 shrink-0" />
        <span className="truncate">{link.label}</span>
      </span>
    );
  }

  const active = isActive(link, pathname, source);
  return (
    <Link
      href={withSource(link.href, link.source ?? source)}
      aria-current={active ? "page" : undefined}
      className={[
        base,
        "transition-colors focus-visible:ring-2 focus-visible:ring-focus",
        active ? "bg-surface font-semibold text-foreground shadow-surface" : "text-foreground/85 hover:bg-default/70",
      ].join(" ")}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{link.label}</span>
      {badge && badge.count > 0 && (
        <span
          aria-label={`${badge.count} ${badge.label}`}
          className={[
            "min-w-7 rounded-full px-2 text-center text-[12px] leading-6 font-semibold tabular-nums",
            badge.tone === "accent" ? "bg-accent text-accent-foreground" : "bg-rejected text-rejected-foreground",
          ].join(" ")}
        >
          {badge.count}
        </span>
      )}
    </Link>
  );
}

interface NavSectionProps {
  group: NavGroup;
  pathname: string;
  source: string;
}

/** Entrada con submenús: encabezado plegable; abierto si contiene la pantalla actual. */
function NavSection({ group, pathname, source }: NavSectionProps) {
  const containsActive = group.children.some((child) => isActive(child, pathname, source));
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? containsActive;
  const listId = useId();

  return (
    <li className="mt-3 flex flex-col gap-1 first:mt-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setUserOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-[10px] px-3 text-left text-small text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <ChevronDown aria-hidden className={`size-4 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      <ul id={listId} hidden={!open} className="flex flex-col gap-1">
        {group.children.map((child) => (
          <li key={child.id}>
            <NavItem link={child} pathname={pathname} source={source} />
          </li>
        ))}
      </ul>
    </li>
  );
}
