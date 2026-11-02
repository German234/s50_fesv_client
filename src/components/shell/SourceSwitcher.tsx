"use client";

import { Kbd, ListBox, Select } from "@heroui/react";
import { ChevronsUpDown, Layers } from "lucide-react";
import { useState } from "react";
import { findSource, getCountryTexts } from "@/config/country";
import { useAllowedSources } from "@/features/menu";
import { initials } from "@/lib/format";
import { ALL_SOURCES, useSource, useUiStore } from "@/stores";

/** "Todas las fuentes" o el nombre de la fuente; un código desconocido se muestra tal cual. */
export function sourceLabel(code: string): string {
  if (code === ALL_SOURCES) return "Todas";
  return findSource(getCountryTexts(), code)?.name ?? code;
}

/**
 * Selector de fuente global (CLAUDE.md §7 SourceSwitcher): store + `?fuente=`. Ofrece "Todas" y
 * las fuentes que el rol puede leer. La tecla F lo abre (registrada en el shell).
 */
export function SourceSwitcher({ isActiveInstance }: { isActiveInstance: boolean }) {
  const { source, setSource } = useSource();
  const { sources, isLoading } = useAllowedSources();
  const pickerOpen = useUiStore((state) => state.sourcePickerOpen);
  const setPickerOpen = useUiStore((state) => state.setSourcePickerOpen);
  // La instancia oculta no responde a F: guarda su propio estado (siempre controlado).
  const [localOpen, setLocalOpen] = useState(false);
  const name = sourceLabel(source);

  return (
    <Select
      aria-label="Fuente"
      value={source}
      onChange={(key) => {
        if (key !== null) setSource(String(key));
      }}
      isOpen={isActiveInstance ? pickerOpen : localOpen}
      onOpenChange={isActiveInstance ? setPickerOpen : setLocalOpen}
      className="w-full"
    >
      <Select.Trigger className="flex h-auto w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-surface">
        <SourceAvatar code={source} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5 text-small text-muted">
            Fuente
            <Kbd aria-hidden className="h-4 px-1 text-[10px]">
              F
            </Kbd>
          </span>
          <Select.Value className="truncate text-heading">{() => name}</Select.Value>
        </span>
        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-muted" />
      </Select.Trigger>
      <Select.Popover className="min-w-(--trigger-width)">
        <ListBox aria-label="Fuentes" className="max-h-80 overflow-y-auto">
          <ListBox.Item id={ALL_SOURCES} textValue="Todas las fuentes">
            <SourceAvatar code={ALL_SOURCES} size="sm" />
            Todas las fuentes
            <ListBox.ItemIndicator />
          </ListBox.Item>
          {sources.map((item) => (
            <ListBox.Item key={item.code} id={item.code} textValue={item.name}>
              <SourceAvatar code={item.code} size="sm" />
              {item.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
          {isLoading && (
            <ListBox.Item id="__loading" isDisabled textValue="Cargando fuentes…">
              <span className="text-muted">Cargando fuentes…</span>
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function SourceAvatar({ code, size = "md" }: { code: string; size?: "sm" | "md" }) {
  const box = size === "md" ? "size-11 rounded-[14px] text-[13px]" : "size-7 rounded-[9px] text-[11px]";
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center bg-accent-soft font-semibold text-accent-soft-foreground ${box}`}>
      {code === ALL_SOURCES ? <Layers className={size === "md" ? "size-5" : "size-3.5"} /> : initials(sourceLabel(code))}
    </span>
  );
}
