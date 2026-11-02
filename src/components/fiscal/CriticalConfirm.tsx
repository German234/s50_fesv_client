"use client";

import { Alert, Button, Checkbox, FieldError, Input, Label, Modal, TextField } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

interface CriticalConfirmBase {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: ReactNode;
  /** Texto del Alert: consecuencias de la acción. */
  warning: ReactNode;
  /** Resumen (fuente, fecha, totales, lista de documentos). */
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export interface CriticalConfirmLevel1Props extends CriticalConfirmBase {
  /** Nivel 1 (acción fiscal): casilla obligatoria. */
  level: 1;
  checkboxLabel: string;
}

export interface CriticalConfirmLevel2Props extends CriticalConfirmBase {
  /** Nivel 2 (destructiva): escribir un texto exacto para habilitar. */
  level: 2;
  /** Texto que hay que escribir, p. ej. los últimos 3 dígitos del número de control. */
  confirmationText: string;
  /** "Escribe los últimos 3 dígitos del Nº de control (088) para confirmar". */
  confirmationPrompt: string;
}

export type CriticalConfirmProps = CriticalConfirmLevel1Props | CriticalConfirmLevel2Props;

/**
 * Confirmación crítica (B02). Nivel 1: casilla obligatoria y botón fiscal. Nivel 2: el botón
 * danger solo se habilita cuando el texto escrito coincide exactamente.
 * El estado se reinicia en cada apertura (el contenido se monta al abrir).
 */
export function CriticalConfirm(props: CriticalConfirmProps) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={props.isOpen} onOpenChange={props.onOpenChange} isDismissable={!props.isPending}>
        <Modal.Container size="lg">
          <Modal.Dialog className="rounded-modal">
            {props.isOpen && <CriticalConfirmContent {...props} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function CriticalConfirmContent(props: CriticalConfirmProps) {
  const [checked, setChecked] = useState(false);
  const [typed, setTyped] = useState("");
  const hintId = useId();
  const destructive = props.level === 2;
  const canConfirm = props.level === 1 ? checked : typed.trim() === props.confirmationText;

  return (
    <>
      <Modal.Header className="flex flex-col items-start gap-1">
        <span className={`text-[12px] font-semibold tracking-wide uppercase ${destructive ? "text-danger" : "text-warning"}`}>
          {destructive ? "Nivel 2 · Destructivo" : "Nivel 1 · Fiscal"}
        </span>
        <Modal.Heading className="text-title">{props.title}</Modal.Heading>
        <p className="text-muted">{props.description}</p>
      </Modal.Header>

      <Modal.Body className="flex flex-col gap-4">
        <Alert status={destructive ? "danger" : "warning"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{props.warning}</Alert.Description>
          </Alert.Content>
        </Alert>

        {props.children}

        {props.level === 1 ? (
          <Checkbox isSelected={checked} onChange={setChecked} isRequired className="flex-row items-start gap-3">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>{props.checkboxLabel}</Label>
            </Checkbox.Content>
          </Checkbox>
        ) : (
          <TextField
            value={typed}
            onChange={setTyped}
            isRequired
            autoComplete="off"
            className="flex flex-col gap-1.5"
            isInvalid={typed.length > 0 && !canConfirm}
          >
            <Label>{props.confirmationPrompt}</Label>
            <Input className="w-32 font-mono" aria-describedby={hintId} />
            <span id={hintId} aria-live="polite" className="text-small text-muted">
              {canConfirm ? "Coincide: ya puedes confirmar." : "Faltan dígitos: el botón se habilita al coincidir."}
            </span>
            <FieldError />
          </TextField>
        )}
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-2">
        <Button slot="close" variant="secondary" isDisabled={props.isPending}>
          Cancelar
        </Button>
        {destructive ? (
          <Button variant="danger" isDisabled={!canConfirm} isPending={props.isPending} onPress={props.onConfirm}>
            {props.confirmLabel}
          </Button>
        ) : (
          <Button className="button--fiscal" isDisabled={!canConfirm} isPending={props.isPending} onPress={props.onConfirm}>
            <ShieldCheck aria-hidden />
            {props.confirmLabel}
          </Button>
        )}
      </Modal.Footer>
    </>
  );
}
