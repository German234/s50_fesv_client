"use client";

import { PendingScreen } from "@/components/shell/PendingScreen";
import { useSession } from "@/features/auth/queries";

// Provisional: destino del login hasta que llegue el Dashboard (§8).
export default function HomePage() {
  const { user, isLoading } = useSession();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email;

  return (
    <PendingScreen
      title="Inicio"
      subtitle={isLoading ? "Cargando sesión…" : `Sesión iniciada como ${name ?? "—"} · ${user?.role.name ?? "sin rol"}.`}
      stage="Dashboard"
    />
  );
}
