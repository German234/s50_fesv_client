"use client";

import { Button } from "@heroui/react";
import { useSession } from "@/features/auth/queries";

// Provisional: destino del login hasta que llegue el Dashboard (§8).
export default function HomePage() {
  const { user, isLoading, signOut } = useSession();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-display">Inicio</h1>
      <p className="text-muted">
        {isLoading ? "Cargando sesión…" : `Sesión iniciada como ${name ?? "—"} · ${user?.role.name ?? "sin rol"}.`}
      </p>
      <Button variant="secondary" className="w-fit" onPress={signOut}>
        Cerrar sesión
      </Button>
    </main>
  );
}
