import { AdminHeader } from "@/features/admin";

/** Cabecera común y segmentado Usuarios / Menús / Rutas / Permisos por rol (CLAUDE.md §8). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-6">
      <AdminHeader />
      {children}
    </div>
  );
}
