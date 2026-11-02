"use client";

import { Button, Modal } from "@heroui/react";
import type { FormEventHandler, ReactNode } from "react";
import { FormAlert } from "@/features/auth/components/FormAlert";

/**
 * Modal de crear y editar de la administración. El contenido (que lleva el useForm) se monta al
 * abrir, así cada apertura empieza con los valores del registro elegido.
 */
export function FormModal({
  isOpen,
  onOpenChange,
  isDismissable = true,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isDismissable?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={isDismissable}>
        <Modal.Container size="md">
          <Modal.Dialog className="rounded-modal">{isOpen && children}</Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

/** Formulario dentro del FormModal: título, campos, error general y Cancelar / Guardar. */
export function FormModalContent({
  title,
  description,
  onSubmit,
  submitLabel,
  isPending,
  formError,
  children,
}: {
  title: string;
  description?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  isPending: boolean;
  /** Error del servidor que no corresponde a un campo. */
  formError?: string | null;
  children: ReactNode;
}) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <Modal.Header className="flex flex-col items-start gap-1">
        <Modal.Heading className="text-title">{title}</Modal.Heading>
        {description && <p className="text-muted">{description}</p>}
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        {children}
        {formError && <FormAlert status="danger">{formError}</FormAlert>}
      </Modal.Body>
      <Modal.Footer className="flex justify-end gap-2">
        <Button slot="close" variant="secondary" isDisabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isPending={isPending}>
          {submitLabel}
        </Button>
      </Modal.Footer>
    </form>
  );
}
