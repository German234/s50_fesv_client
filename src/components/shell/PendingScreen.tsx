import { Construction } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/fiscal/StateViews";

export interface PendingScreenProps {
  title: string;
  subtitle?: ReactNode;
  /** Etapa que conecta la pantalla: "Emitidos", "Clientes"… */
  stage: string;
}

/**
 * Pantalla del menú que todavía no está conectada. Existe para que la navegación, la fuente y el
 * "sin acceso" del shell se puedan usar; no muestra datos.
 */
export function PendingScreen({ title, subtitle, stage }: PendingScreenProps) {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="flex flex-col gap-1">
        <h1 className="text-display">{title}</h1>
        {subtitle && <p className="text-body text-muted">{subtitle}</p>}
      </header>
      <div className="rounded-card bg-surface shadow-surface">
        <EmptyState
          icon={Construction}
          title="Pantalla en construcción"
          description={`Se conecta al backend en la etapa de ${stage}.`}
        />
      </div>
    </div>
  );
}
