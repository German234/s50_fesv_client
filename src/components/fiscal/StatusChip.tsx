import { Chip } from "@heroui/react";
import { Ban, CircleCheck, CircleX, Clock, RotateCw, type LucideIcon } from "lucide-react";

/**
 * Estado del documento tal como lo expone la API (docs/contrato.md del backend).
 * TODO: reemplazar por el alias de schema.d.ts cuando un endpoint publique el enum DocumentState.
 */
export type DocumentStatus = "pending" | "inProcess" | "accepted" | "rejected" | "invalidated";

type ChipColor = "success" | "warning" | "accent" | "danger";

const STATUS: Record<DocumentStatus, { label: string; Icon: LucideIcon; color?: ChipColor }> = {
  accepted: { label: "Aceptado", Icon: CircleCheck, color: "success" },
  pending: { label: "Pendiente", Icon: Clock, color: "warning" },
  inProcess: { label: "En proceso", Icon: RotateCw, color: "accent" },
  // Rechazado es el único chip sólido y oscuro (clase chip--rejected en theme.css).
  rejected: { label: "Rechazado", Icon: CircleX },
  invalidated: { label: "Invalidado", Icon: Ban, color: "danger" },
};

export const DOCUMENT_STATUSES = Object.keys(STATUS) as DocumentStatus[];

export function statusLabel(status: DocumentStatus): string {
  return STATUS[status].label;
}

export interface StatusChipProps {
  status: DocumentStatus;
  size?: "sm" | "md";
  className?: string;
}

/** Estado del documento: chip suave con ícono; el texto lleva el significado, el ícono es decorativo. */
export function StatusChip({ status, size = "sm", className }: StatusChipProps) {
  const { label, Icon, color } = STATUS[status];
  return (
    <Chip
      variant="soft"
      color={color}
      size={size}
      className={[color ? "" : "chip--rejected", "gap-1", className].filter(Boolean).join(" ")}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}
