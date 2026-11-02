"use client";

import { Chip } from "@heroui/react";
import { TriangleAlert } from "lucide-react";
import { findDocumentType, useCountry } from "@/config/country";

export interface DocTypeChipProps {
  /** Código fiscal: "03", "31"… El nombre sale del diccionario del país. */
  code: string;
  /** "revisar": los montos de Sage no cuadran; el chip pasa a warning con ícono de alerta. */
  variant?: "default" | "review";
  /** Solo el código, para columnas estrechas. */
  compact?: boolean;
  className?: string;
}

/** Tipo de documento fiscal: "03 Crédito fiscal" o "03 Crédito fiscal · revisar". */
export function DocTypeChip({ code, variant = "default", compact = false, className }: DocTypeChipProps) {
  const name = findDocumentType(useCountry(), code)?.name ?? "Tipo desconocido";
  const review = variant === "review";

  return (
    <Chip
      variant="soft"
      color={review ? "warning" : "default"}
      size="sm"
      className={["gap-1", className].filter(Boolean).join(" ")}
      title={compact ? `${code} ${name}` : undefined}
    >
      {review && <TriangleAlert aria-hidden className="size-3.5" />}
      <Chip.Label>
        <span className="font-mono">{code}</span>
        {!compact && <> {name}</>}
        {review && <> · revisar</>}
      </Chip.Label>
    </Chip>
  );
}
