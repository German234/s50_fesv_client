import { SessionGuard } from "@/features/auth/components/SessionGuard";

// El shell (Sidebar y TopBar) llega en su propio bloque.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <SessionGuard>{children}</SessionGuard>;
}
