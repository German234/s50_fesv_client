"use client";

import { Button, Kbd } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useCountry } from "@/config/country";
import { Money } from "./Money";

export interface BulkActionBarProps {
  selectedCount: number;
  /** Suma de "Total + impuesto" de la selección. */
  total: number;
  onClear: () => void;
  onPreview?: () => void;
  /** Abre la confirmación fiscal (CriticalConfirm nivel 1). Atajo ⌘↵ / Ctrl+↵ en la pantalla. */
  onTransmit: () => void;
  isTransmitting?: boolean;
  /** Si el rol no puede transmitir, el botón se deshabilita con su motivo. */
  transmitDisabledReason?: string;
  /** En la página de demostración se muestra en el flujo, no flotando. */
  inline?: boolean;
}

/** Píldora oscura flotante abajo al centro; solo aparece con selección (B02, Transmitir). */
export function BulkActionBar({
  selectedCount,
  total,
  onClear,
  onPreview,
  onTransmit,
  isTransmitting = false,
  transmitDisabledReason,
  inline = false,
}: BulkActionBarProps) {
  const country = useCountry();
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Acciones de la selección"
      className={[
        "z-40 flex items-center gap-4 rounded-full bg-fiscal py-2 ps-2 pe-2 whitespace-nowrap text-fiscal-foreground shadow-overlay",
        inline ? "w-fit max-w-full overflow-x-auto" : "fixed bottom-6 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2",
      ].join(" ")}
    >
      <span aria-live="polite" className="flex items-center gap-2 ps-1 font-medium">
        <span className="flex size-7 items-center justify-center rounded-full bg-fiscal-foreground font-mono text-small text-fiscal">
          {selectedCount}
        </span>
        {selectedCount === 1 ? "seleccionado" : "seleccionados"}
      </span>
      <span aria-hidden className="h-8 w-px bg-current opacity-20" />
      <span className="flex flex-col leading-tight">
        <span className="text-[11px] opacity-70">Total + {country.tax.name}</span>
        <Money value={total} symbol={country.currency.symbol} emphasis className="text-inherit" />
      </span>
      {/* Fondos con currentColor: funcionan sobre la píldora oscura (claro) y la clara (oscuro). */}
      <Button variant="ghost" className="text-inherit hover:bg-current/10" onPress={onClear}>
        Deseleccionar
      </Button>
      {onPreview && (
        <Button variant="ghost" className="bg-current/10 text-inherit hover:bg-current/20" onPress={onPreview}>
          Vista previa
        </Button>
      )}
      <Button
        className="button--fiscal-inverse"
        onPress={onTransmit}
        isPending={isTransmitting}
        isDisabled={Boolean(transmitDisabledReason)}
        aria-description={transmitDisabledReason}
      >
        <ShieldCheck aria-hidden />
        Transmitir a {country.authority}
        <Kbd aria-hidden className="h-5 bg-transparent px-1 text-[11px] text-current opacity-60">
          ⌘↵
        </Kbd>
      </Button>
    </div>
  );
}
