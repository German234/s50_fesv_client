"use client";

import { Button, Label, SearchField } from "@heroui/react";
import { createElement, useId, useState } from "react";
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { MATERIAL_ICON_NAMES, menuIcon } from "@/features/menu/icons";
import { MATERIAL_ICON_PATTERN } from "../schemas";

/**
 * Selector de ícono (B · Admin · menús): búsqueda por nombre de Material Icons y cuadrícula.
 * Guarda el nombre de Material Icons (lo que espera el backend); se dibuja con su equivalente
 * lucide. Un nombre válido sin equivalente también se puede usar: se verá con el punto genérico.
 */
export function IconPicker({
  value,
  onChange,
  error,
  isDisabled,
}: {
  value: string;
  onChange: (name: string) => void;
  error?: string;
  isDisabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const labelId = useId();
  const errorId = useId();
  const needle = search.trim().toLowerCase();
  const matches = MATERIAL_ICON_NAMES.filter((name) => name.includes(needle.replace(/\s+/g, "_")));
  // El valor actual siempre está a la vista, aunque no coincida con la búsqueda.
  const names = value && !matches.includes(value) && needle === "" ? [value, ...matches] : matches;
  const canUseCustom = needle !== "" && MATERIAL_ICON_PATTERN.test(needle) && !MATERIAL_ICON_NAMES.includes(needle);

  return (
    <div className="flex flex-col gap-2">
      <Label id={labelId}>
        Ícono <span className="font-normal text-muted">· nombre Material Icons</span>
      </Label>
      <SearchField aria-label="Buscar ícono por nombre" value={search} onChange={setSearch} isDisabled={isDisabled}>
        <SearchField.Group className="h-11 shadow-none">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Buscar ícono, por ejemplo send" />
          <SearchField.ClearButton aria-label="Borrar búsqueda" />
        </SearchField.Group>
      </SearchField>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="grid max-h-56 grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2 overflow-y-auto p-0.5"
      >
        {names.map((name) => {
          const isSelected = name === value;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              title={name}
              onClick={() => onChange(name)}
              className={[
                "flex flex-col items-center gap-1.5 rounded-[14px] px-1 py-3 outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50",
                isSelected ? "bg-accent-soft text-accent-soft-foreground ring-2 ring-accent" : "bg-surface-secondary hover:bg-default",
              ].join(" ")}
            >
              {createElement(menuIcon(name), { "aria-hidden": true, className: "size-5" })}
              <span className="w-full truncate font-mono text-[11px]">{name}</span>
            </button>
          );
        })}
        {names.length === 0 && !canUseCustom && (
          <p className="col-span-full py-4 text-center text-small text-muted">Ningún ícono coincide con “{search}”.</p>
        )}
      </div>
      {canUseCustom && (
        <Button size="sm" variant="tertiary" className="self-start" onPress={() => onChange(needle)} isDisabled={isDisabled}>
          Usar “{needle}” (sin vista previa)
        </Button>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** IconPicker controlado por react-hook-form; el error aparece al salir o tras intentar guardar. */
export function FormIconField<T extends FieldValues>({
  control,
  name,
  isDisabled,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  isDisabled?: boolean;
}) {
  const {
    field: { value, onChange },
    fieldState,
    formState,
  } = useController({ control, name });
  const showError = fieldState.invalid && (fieldState.isTouched || formState.isSubmitted);
  return (
    <IconPicker
      value={(value as string | null | undefined) ?? ""}
      onChange={onChange}
      error={showError ? fieldState.error?.message : undefined}
      isDisabled={isDisabled}
    />
  );
}
