"use client";

import { Button, Tooltip } from "@heroui/react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { truncateMiddle } from "@/lib/format";

type CopyStatus = "idle" | "copied" | "error";

export interface CopyCodeProps {
  value: string;
  /** Qué es, para el aria-label: "Código de generación", "Número de control". */
  label: string;
  /** Caracteres visibles al inicio y al final (por defecto 8 y 6). */
  head?: number;
  tail?: number;
  /** Sin truncar (p. ej. e-NCF cortos). */
  full?: boolean;
  className?: string;
}

const RESET_MS = 2000;

/**
 * Código truncado al centro con botón "Copiar". Valor completo en tooltip y aria-label;
 * "Copiado" se anuncia por una región aria-live.
 */
export function CopyCode({ value, label, head = 8, tail = 6, full = false, className }: CopyCodeProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  const display = full ? value : truncateMiddle(value, head, tail);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      // Sin permiso de portapapeles o contexto no seguro (http fuera de localhost).
      setStatus("error");
    }
    timer.current = window.setTimeout(() => setStatus("idle"), RESET_MS);
  }

  return (
    <div
      className={[
        "flex h-10 items-center justify-between gap-2 rounded-field bg-surface-secondary ps-3 pe-1",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* El valor completo: title al pasar el ratón por el texto, tooltip al enfocar o pasar por el botón. */}
      <span aria-hidden title={value} className="min-w-0 truncate font-mono text-[12px]">
        {display}
      </span>

      <Tooltip delay={400}>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Copiar ${label}: ${value}`}
          onPress={copy}
          className={[
            "h-8 shrink-0 bg-surface",
            status === "copied" ? "text-success-soft-foreground bg-success-soft" : "",
            status === "error" ? "text-danger-soft-foreground bg-danger-soft" : "",
          ].join(" ")}
        >
          {status === "copied" ? <Check aria-hidden /> : status === "error" ? <TriangleAlert aria-hidden /> : <Copy aria-hidden />}
          {status === "copied" ? "Copiado" : status === "error" ? "No se copió" : "Copiar"}
        </Button>
        <Tooltip.Content className="max-w-none font-mono text-[12px]">{value}</Tooltip.Content>
      </Tooltip>

      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? `${label} copiado` : status === "error" ? `No se pudo copiar ${label}` : ""}
      </span>
    </div>
  );
}
