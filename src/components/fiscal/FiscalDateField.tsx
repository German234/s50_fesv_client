"use client";

import type { CalendarDate } from "@internationalized/date";
import { DateField, FieldError, Label } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useCountry } from "@/config/country";

export interface FiscalDateFieldProps {
  value: CalendarDate | null;
  onChange: (value: CalendarDate | null) => void;
  /** Mensaje de error de validación (p. ej. de Zod). */
  errorMessage?: string;
  isDisabled?: boolean;
  label?: string;
  className?: string;
}

/**
 * Fecha de emisión fiscal: campo destacado con borde de tinta, escudo y la nota del país
 * ("se estampa en el DTE"). Es la fecha que queda en el documento ante la autoridad.
 */
export function FiscalDateField({
  value,
  onChange,
  errorMessage,
  isDisabled,
  label = "Fecha de emisión fiscal",
  className,
}: FiscalDateFieldProps) {
  const country = useCountry();
  const isInvalid = Boolean(errorMessage);

  return (
    <DateField
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      granularity="day"
      shouldForceLeadingZeros
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <Label className="flex items-center gap-1.5 text-heading">
        <ShieldCheck aria-hidden className="size-4" />
        {label}
      </Label>
      <DateField.Group className="fiscal-field">
        <DateField.Input className="font-mono">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="pe-3 text-small whitespace-nowrap text-muted">{country.emissionHint}</DateField.Suffix>
      </DateField.Group>
      <FieldError className="text-small text-danger">{errorMessage}</FieldError>
    </DateField>
  );
}
