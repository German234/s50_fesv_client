import { Skeleton, Spinner } from "@heroui/react";

export interface TableSkeletonProps {
  /** "Leyendo documentos de Sage 50 · CIPSA…". */
  message: string;
  rows?: number;
  /** Anchos relativos de las columnas (fr). Por defecto el layout de Transmitir. */
  columns?: number[];
  hint?: string;
  className?: string;
}

const DEFAULT_COLUMNS = [0.3, 1, 3, 1.4, 1, 1, 0.8, 1];
// Variación fija de anchos para que el esqueleto no parezca una rejilla (sin aleatoriedad: SSR estable).
const WIDTHS = ["70%", "55%", "85%", "60%"];

/** Carga: solo la tabla muestra esqueleto; los filtros siguen disponibles (B03). */
export function TableSkeleton({ message, rows = 4, columns = DEFAULT_COLUMNS, hint, className }: TableSkeletonProps) {
  const template = columns.map((width) => `${width}fr`).join(" ");

  return (
    <div
      aria-busy="true"
      className={["overflow-hidden rounded-card bg-surface shadow-surface", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-4 border-b border-separator px-5 py-3 text-small">
        <span role="status" className="flex items-center gap-2">
          <Spinner size="sm" aria-hidden />
          {message}
        </span>
        {hint && <span className="text-muted">{hint}</span>}
      </div>
      <div aria-hidden>
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="grid items-center gap-6 border-b border-separator px-5 py-5 last:border-0"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((_, col) => (
              <Skeleton
                key={col}
                className={col === 0 ? "size-4 rounded-sm" : "h-3 rounded-full"}
                style={col === 0 ? undefined : { width: WIDTHS[(row + col) % WIDTHS.length] }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
