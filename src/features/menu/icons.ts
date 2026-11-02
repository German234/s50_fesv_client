import {
  Banknote,
  Building2,
  ChartColumn,
  CircleDot,
  CreditCard,
  FileCheck2,
  FileText,
  Folder,
  Hash,
  House,
  Landmark,
  LayoutDashboard,
  List,
  type LucideIcon,
  Package,
  ReceiptText,
  Route,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  StickyNote,
  Store,
  Truck,
  User,
  Users,
} from "lucide-react";

/**
 * Nombres de Material Icons (los que guarda el backend en Menus.icon y Submenus.icon) → lucide.
 * Incluye todos los de la base legacy y algunos comunes que el administrador de menús puede elegir.
 */
const MATERIAL_TO_LUCIDE: Record<string, LucideIcon> = {
  // Usados por la base legacy
  tune: SlidersHorizontal,
  menu: List,
  description: FileCheck2,
  people: Users,
  receipt_long: ReceiptText,
  article: FileText,
  business: Building2,
  sticky_note_2: StickyNote,
  paid: Banknote,
  // Comunes
  home: House,
  dashboard: LayoutDashboard,
  send: Send,
  settings: Settings,
  route: Route,
  alt_route: Route,
  security: Shield,
  shield: Shield,
  admin_panel_settings: ShieldCheck,
  verified_user: ShieldCheck,
  group: Users,
  person: User,
  list: List,
  format_list_bulleted: List,
  inventory: Package,
  inventory_2: Package,
  payments: CreditCard,
  credit_card: CreditCard,
  bar_chart: ChartColumn,
  folder: Folder,
  local_shipping: Truck,
  account_balance: Landmark,
  store: Store,
  numbers: Hash,
  tag: Hash,
};

/** Ícono lucide para un nombre de Material Icons; desconocido o vacío → punto. */
export function menuIcon(name: string | null | undefined): LucideIcon {
  return (name && MATERIAL_TO_LUCIDE[name.trim().toLowerCase()]) || CircleDot;
}
