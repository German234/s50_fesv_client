"use client";

import { Button, Chip, CloseButton, DateField, DateRangePicker, FieldError, Kbd, Label, RangeCalendar } from "@heroui/react";
import type { CalendarDate } from "@internationalized/date";
import { Plus } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

export interface FilterBarProps {
  /** Campos de filtro (FilterDateRange, FiscalDateField, presets…). */
  children: ReactNode;
  onSubmit: () => void;
  onClear?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  className?: string;
}

/** Tarjeta de filtros con Limpiar y Buscar (↵). Enter dentro de cualquier campo busca. */
export function FilterBar({ children, onSubmit, onClear, isSubmitting, submitLabel = "Buscar", className }: FilterBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={["flex flex-wrap items-end gap-4 rounded-card bg-surface p-5 shadow-surface", className].filter(Boolean).join(" ")}
    >
      {children}
      <div className="ms-auto flex items-center gap-2">
        {onClear && (
          <Button variant="ghost" onPress={onClear}>
            Limpiar
          </Button>
        )}
        <Button type="submit" variant="secondary" isPending={isSubmitting}>
          {submitLabel}
          <Kbd aria-hidden className="h-5 px-1.5 text-[11px]">
            ↵
          </Kbd>
        </Button>
      </div>
    </form>
  );
}

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export interface FilterDateRangeProps {
  label: string;
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
  /** Error de la regla cruzada ("La fecha inicial no puede ser mayor que la final"). */
  errorMessage?: string;
  className?: string;
}

/** Rango de fechas con calendario (DateRangePicker de HeroUI) y error en línea bajo el campo. */
export function FilterDateRange({ label, value, onChange, errorMessage, className }: FilterDateRangeProps) {
  return (
    <DateRangePicker
      value={value}
      onChange={(range) => onChange(range ? { start: range.start as CalendarDate, end: range.end as CalendarDate } : null)}
      isInvalid={Boolean(errorMessage)}
      granularity="day"
      shouldForceLeadingZeros
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <Label className="text-small">{label}</Label>
      <DateField.Group>
        <DateField.Input slot="start" className="font-mono">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end" className="font-mono">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger aria-label="Abrir calendario">
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <FieldError className="text-small text-danger">{errorMessage}</FieldError>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label={label}>
          <RangeCalendar.Header>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
            </RangeCalendar.YearPickerTrigger>
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>{(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}</RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

export interface FilterChipProps {
  /** "Estado", "Emisión", "Tipo". */
  label: string;
  /** "Rechazado +1", "30 sep – 30 oct". */
  value: string;
  onRemove: () => void;
}

/** Filtro activo: "Estado Rechazado +1 ×". El botón × lo quita. */
export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <Chip variant="soft" color="default" className="gap-1.5 ps-3 pe-1">
      <Chip.Label>
        <span className="text-muted">{label}</span> <b className="font-semibold">{value}</b>
      </Chip.Label>
      <CloseButton aria-label={`Quitar filtro ${label}: ${value}`} onPress={onRemove} className="size-6" />
    </Chip>
  );
}

/** "+ Filtro": abre el selector de filtros de la pantalla. */
export function AddFilterButton({ onPress, children = "Filtro" }: { onPress: () => void; children?: ReactNode }) {
  return (
    <Button size="sm" variant="tertiary" onPress={onPress}>
      <Plus aria-hidden />
      {children}
    </Button>
  );
}
