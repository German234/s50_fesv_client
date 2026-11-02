import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "success" | "neutral" | "danger" | "warning";

const ICON_TONE: Record<Tone, string> = {
  success: "bg-success-soft text-success-soft-foreground",
  neutral: "bg-default text-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
};

export interface EmptyStateProps {
  icon: LucideIcon;
  /** Qué no hay: "Nada pendiente de transmitir", "Sin resultados". */
  title: string;
  /** En qué rango o con qué filtros. */
  description?: ReactNode;
  /** Botones: "Cambiar rango", "Ver emitidos", "Buscar sin filtros". */
  actions?: ReactNode;
  tone?: Exclude<Tone, "danger">;
  className?: string;
}

/** Vacío o sin resultados (B03): ícono en cuadro suave, título, explicación y acciones. */
export function EmptyState({ icon: Icon, title, description, actions, tone = "neutral", className }: EmptyStateProps) {
  return (
    <div className={["flex flex-col items-center gap-3 px-6 py-10 text-center", className].filter(Boolean).join(" ")}>
      <span className={`flex size-14 items-center justify-center rounded-[14px] ${ICON_TONE[tone]}`}>
        <Icon aria-hidden className="size-6" />
      </span>
      <h3 className="text-title">{title}</h3>
      {description && <p className="max-w-md text-muted">{description}</p>}
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  icon: LucideIcon;
  /** Qué falló: "No pudimos leer Sage 50 de DSPORTS". */
  title: string;
  /** Alcance del fallo: "Las demás fuentes no se ven afectadas." */
  description?: ReactNode;
  /** Plegable "Detalle técnico" (code, traceId, mensaje técnico). */
  technicalDetail?: ReactNode;
  /** "Reintentar" (fiscal) y una acción secundaria. */
  actions?: ReactNode;
  /** Pantalla completa: errores que impiden usar la aplicación (p. ej. país no coincide). */
  fullScreen?: boolean;
  className?: string;
}

/** Error de una vista (B03). Se anuncia con role="alert". */
export function ErrorState({
  icon: Icon,
  title,
  description,
  technicalDetail,
  actions,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const card = (
    <div
      role="alert"
      className={[
        "flex flex-col items-start gap-3 rounded-card bg-surface p-8 shadow-surface ring-1 ring-danger-soft",
        fullScreen ? "w-full max-w-xl" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={`flex size-14 items-center justify-center rounded-[14px] ${ICON_TONE.danger}`}>
        <Icon aria-hidden className="size-6" />
      </span>
      <h2 className="text-title">{title}</h2>
      {description && <div className="text-muted">{description}</div>}
      {technicalDetail && (
        <details className="group w-full text-small">
          <summary className="cursor-pointer rounded-md font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Detalle técnico
          </summary>
          <div className="mt-2 rounded-field bg-surface-secondary p-3 font-mono text-[12px] break-all">
            {technicalDetail}
          </div>
        </details>
      )}
      {actions && <div className="mt-1 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );

  if (!fullScreen) return card;
  return <main className="flex min-h-dvh items-center justify-center bg-background p-6">{card}</main>;
}
