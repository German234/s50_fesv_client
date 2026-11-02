"use client";

import { Button, Description, FieldError, Input, InputGroup, Label, ListBox, Select, Switch, TextField } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { useController, type Control, type ControllerFieldState, type FieldPath, type FieldValues } from "react-hook-form";

/**
 * Campos de los formularios de administración (modales y panel de menús), controlados por
 * react-hook-form. A diferencia de AuthField, el error también aparece tras intentar guardar,
 * aunque el campo no se haya tocado, y acepta errores puestos por el servidor (409).
 */

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
  isDisabled?: boolean;
}

function showsError(fieldState: ControllerFieldState, formState: { isSubmitted: boolean }): boolean {
  return fieldState.invalid && (fieldState.isTouched || fieldState.isDirty || formState.isSubmitted);
}

interface FormTextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  /** Códigos y paths: JetBrains Mono. */
  mono?: boolean;
  autoFocus?: boolean;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isDisabled,
  type = "text",
  autoComplete,
  placeholder,
  maxLength,
  mono,
  autoFocus,
}: FormTextFieldProps<T>) {
  // `ref` por separado: el React Compiler trata como ref todo el objeto que lo contiene.
  const {
    field: { ref, name: fieldName, value, onChange, onBlur },
    fieldState,
    formState,
  } = useController({ control, name });
  const isInvalid = showsError(fieldState, formState);
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const isPassword = type === "password";
  const inputClass = mono ? "font-mono text-[13px]" : undefined;

  return (
    <TextField
      id={inputId}
      name={fieldName}
      value={(value as string | null | undefined) ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      type={isPassword && visible ? "text" : type}
      autoComplete={autoComplete}
      maxLength={maxLength}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      validationBehavior="aria"
      autoFocus={autoFocus}
      className="flex flex-col gap-1.5"
    >
      <Label>{label}</Label>
      {isPassword ? (
        <InputGroup className="h-11 shadow-none">
          <InputGroup.Input ref={ref} placeholder={placeholder} className={inputClass} />
          <InputGroup.Suffix className="pe-1.5">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="rounded-full"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-controls={inputId}
              onPress={() => setVisible((value) => !value)}
            >
              {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
      ) : (
        <Input ref={ref} placeholder={placeholder} className={`h-11 shadow-none ${inputClass ?? ""}`} />
      )}
      {description && !isInvalid && <Description className="text-small text-muted">{description}</Description>}
      <FieldError className="text-small text-danger">{fieldState.error?.message}</FieldError>
    </TextField>
  );
}

export interface SelectOption {
  id: number;
  label: string;
  /** Segunda línea en mono (p. ej. el path de una ruta). */
  detail?: string;
  isDisabled?: boolean;
}

interface FormSelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[];
  placeholder?: string;
  /** Opciones aún cargando, o un aviso si no se pudieron cargar. */
  isLoading?: boolean;
  unavailableMessage?: string;
}

/** Select de un id numérico (rol, ruta). */
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isDisabled,
  options,
  placeholder = "Elige una opción",
  isLoading,
  unavailableMessage,
}: FormSelectFieldProps<T>) {
  const {
    field: { ref, name: fieldName, value, onChange, onBlur },
    fieldState,
    formState,
  } = useController({ control, name });
  const isInvalid = showsError(fieldState, formState);
  const selected = options.find((option) => option.id === value);

  return (
    <Select
      name={fieldName}
      value={(value as number | null | undefined) ?? null}
      onChange={(key) => onChange(key === null ? null : Number(key))}
      onBlur={onBlur}
      isDisabled={isDisabled || isLoading || unavailableMessage !== undefined}
      isInvalid={isInvalid}
      validationBehavior="aria"
      placeholder={isLoading ? "Cargando…" : placeholder}
      className="flex flex-col gap-1.5"
    >
      <Label>{label}</Label>
      <Select.Trigger ref={ref} className="h-11 shadow-none">
        <Select.Value className={selected?.detail ? "font-mono text-[13px]" : undefined}>
          {({ isPlaceholder, defaultChildren }) => (isPlaceholder || !selected ? defaultChildren : (selected.detail ?? selected.label))}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      {unavailableMessage ? (
        <Description className="text-small text-muted">{unavailableMessage}</Description>
      ) : (
        description && !isInvalid && <Description className="text-small text-muted">{description}</Description>
      )}
      <FieldError className="text-small text-danger">{fieldState.error?.message}</FieldError>
      <Select.Popover className="min-w-(--trigger-width)">
        <ListBox aria-label={label} className="max-h-72 overflow-y-auto">
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.detail ? `${option.label} ${option.detail}` : option.label} isDisabled={option.isDisabled}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.detail && <span className="truncate font-mono text-[12px] text-muted">{option.detail}</span>}
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

interface SwitchRowProps {
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  label: string;
  /** Visible bajo la etiqueta; con el switch deshabilitado, el motivo. */
  description?: ReactNode;
  isDisabled?: boolean;
}

/** Switch con la etiqueta a la izquierda y el control a la derecha ("Habilitar submenús"). */
export function SwitchRow({ isSelected, onChange, label, description, isDisabled }: SwitchRowProps) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} isDisabled={isDisabled} className="w-full">
      <Switch.Content className="flex w-full items-center justify-between gap-4">
        <span className="flex flex-col">
          <Label className="text-heading">{label}</Label>
          {description && <span className="text-small text-muted">{description}</span>}
        </span>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}
