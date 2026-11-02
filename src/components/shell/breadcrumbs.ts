import { type Country, findTransmitTab } from "@/config/country";

export interface Crumb {
  label: string;
  /** Sin href: el último (página actual) o un nivel sin pantalla propia. */
  href?: string;
}

const ADMIN_PAGES: Record<string, string> = {
  usuarios: "Usuarios",
  menus: "Menús",
  rutas: "Rutas",
  permisos: "Permisos por rol",
};

/** Migas de la TopBar según la ruta del frontend (CLAUDE.md §6). Ruta desconocida → []. */
export function breadcrumbsFor(pathname: string, country: Country): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const [first, second] = segments;
  const firstTab = country.transmitTabs[0];
  const transmitHref = firstTab ? `/transmitir/${firstTab.slug}` : undefined;

  switch (first) {
    case undefined:
      return [{ label: "Inicio" }];
    case "transmitir": {
      if (second === "lotes" && segments[2]) {
        return [{ label: "Transmitir", href: transmitHref }, { label: `Lote ${decodeURIComponent(segments[2])}` }];
      }
      const tab = second ? findTransmitTab(country, second) : undefined;
      return tab ? [{ label: "Transmitir", href: transmitHref }, { label: tab.label }] : [{ label: "Transmitir" }];
    }
    case "emitidos":
      return [{ label: "Emitidos" }];
    case "clientes":
      if (second === "nuevo") return [{ label: "Clientes", href: "/clientes" }, { label: "Nuevo cliente" }];
      if (second) return [{ label: "Clientes", href: "/clientes" }, { label: "Editar cliente" }];
      return [{ label: "Clientes" }];
    case "correlativos":
      return [{ label: "Correlativos" }];
    case "admin":
      return second && ADMIN_PAGES[second]
        ? [{ label: "Administración" }, { label: ADMIN_PAGES[second] }]
        : [{ label: "Administración" }];
    default:
      return [];
  }
}
