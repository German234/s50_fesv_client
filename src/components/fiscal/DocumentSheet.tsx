"use client";

import { Button, Drawer, Kbd } from "@heroui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

export interface DocumentSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Posición del documento en la lista: "Documento 2 de 86". */
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  /** Referencia en mono, grande. */
  title: string;
  /** Chips bajo el título (DocTypeChip, StatusChip). */
  badges?: ReactNode;
  children: ReactNode;
  /** "Vista previa PDF", "Agregar a la selección". */
  footer?: ReactNode;
}

/**
 * Detalle del documento: panel flotante a la derecha con 12 px de margen; la lista queda
 * visible detrás. J/K (o ↑/↓) navegan, Esc cierra; el foco vuelve a la fila al cerrar.
 */
export function DocumentSheet({
  isOpen,
  onOpenChange,
  index,
  total,
  onPrevious,
  onNext,
  title,
  badges,
  children,
  footer,
}: DocumentSheetProps) {
  const hasPrevious = index > 1;
  const hasNext = index < total;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
    const key = event.key.toLowerCase();
    if (key === "j" && hasNext) {
      event.preventDefault();
      onNext();
    } else if (key === "k" && hasPrevious) {
      event.preventDefault();
      onPrevious();
    }
  }

  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="transparent">
        <Drawer.Content placement="right">
          <Drawer.Dialog
            aria-label={`Documento ${title}`}
            className="document-sheet m-3 h-[calc(100%-24px)] w-[min(560px,calc(100vw-24px))] max-w-none rounded-modal"
          >
            {/* Captura J/K por burbujeo desde cualquier elemento enfocado del panel. */}
            <div onKeyDown={handleKeyDown} className="flex h-full min-h-0 flex-col gap-5">
            <Drawer.Header className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 text-small text-muted">
                <span aria-live="polite">
                  Documento {index} de {total}
                </span>
                {/* pe-10: espacio para el CloseTrigger de HeroUI, que va en posición absoluta arriba a la derecha. */}
                <span className="flex items-center gap-1 pe-10">
                  <Kbd aria-hidden className="text-[11px]">
                    J/K
                  </Kbd>
                  <Button isIconOnly size="sm" variant="ghost" aria-label="Documento anterior" isDisabled={!hasPrevious} onPress={onPrevious}>
                    <ChevronUp aria-hidden />
                  </Button>
                  <Button isIconOnly size="sm" variant="ghost" aria-label="Documento siguiente" isDisabled={!hasNext} onPress={onNext}>
                    <ChevronDown aria-hidden />
                  </Button>
                </span>
                <Drawer.CloseTrigger aria-label="Cerrar detalle" />
              </div>
              <Drawer.Heading className="font-mono text-title">{title}</Drawer.Heading>
              {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4 overflow-y-auto">{children}</Drawer.Body>
            {footer ? <Drawer.Footer className="flex justify-between gap-2">{footer}</Drawer.Footer> : null}
            </div>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
