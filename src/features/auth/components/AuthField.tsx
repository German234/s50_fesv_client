"use client";

import { Button, FieldError, Input, InputGroup, Label, TextField } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form";

interface AuthFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: "email" | "password" | "text";
  autoComplete?: string;
  inputMode?: "numeric" | "email" | "text";
  maxLength?: number;
  isReadOnly?: boolean;
  /** Ids de textos externos que describen el campo (p. ej. las reglas de la contraseña). */
  describedBy?: string;
  inputClassName?: string;
  /** Mostrar el error de Zod debajo del campo; si las reglas ya lo dicen (chips), false. */
  showError?: boolean;
}

/**
 * Campo de texto de HeroUI controlado por react-hook-form. React Aria pone `aria-invalid` y
 * enlaza el FieldError en `aria-describedby`; `describedBy` agrega descripciones externas.
 * El error aparece al salir del campo (mode "onTouched" en los formularios).
 */
export function AuthField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  isReadOnly,
  describedBy,
  inputClassName,
  showError = true,
}: AuthFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const isPassword = type === "password";
  const isInvalid = fieldState.invalid && (fieldState.isTouched || fieldState.isDirty);

  return (
    <TextField
      id={inputId}
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      type={isPassword && visible ? "text" : type}
      autoComplete={autoComplete}
      inputMode={inputMode}
      maxLength={maxLength}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      validationBehavior="aria"
      aria-describedby={describedBy}
      className="flex flex-col gap-2"
    >
      <Label>{label}</Label>
      {isPassword ? (
        <InputGroup className="h-12 shadow-none">
          <InputGroup.Input className={inputClassName} />
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
        <Input className={`h-12 shadow-none ${inputClassName ?? ""}`} />
      )}
      {showError && <FieldError className="text-small text-danger">{fieldState.error?.message}</FieldError>}
    </TextField>
  );
}
