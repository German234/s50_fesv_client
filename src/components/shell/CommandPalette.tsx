"use client";

import { Kbd, Modal } from "@heroui/react";
import { Check, CornerDownLeft, FileSearch, Layers, type LucideIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useId, useMemo, useState } from "react";
import { useAllowedSources, useNavigation } from "@/features/menu";
import { ALL_SOURCES, useSource, useUiStore, withSource } from "@/stores";

export const PALETTE_COMBO = "mod+k";

interface PaletteItem {
  id: string;
  group: "Buscar" | "Ir a" | "Fuente";
  label: string;
  /** Texto secundario a la derecha: "Disponible al conectar Emitidos", "actual". */
  hint?: string;
  icon: LucideIcon;
  /** Texto extra con el que también se encuentra ("cipsa", "transmitir"…). */
  keywords?: string;
  isDisabled?: boolean;
  isCurrent?: boolean;
  run?: () => void;
}

const GROUPS: PaletteItem["group"][] = ["Buscar", "Ir a", "Fuente"];

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Paleta ⌘K (CLAUDE.md §7): ir a las pantallas del menú y cambiar de fuente. */
export function CommandPalette() {
  const open = useUiStore((state) => state.paletteOpen);
  const setOpen = useUiStore((state) => state.setPaletteOpen);

  return (
    <Modal>
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container placement="top" size="lg" className="pt-[12vh]">
          <Modal.Dialog aria-label="Buscar o ir a…" className="overflow-hidden rounded-modal p-0">
            {open && <PaletteContent onClose={() => setOpen(false)} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PaletteContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { entries } = useNavigation();
  const { sources } = useAllowedSources();
  const { source, setSource } = useSource();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();

  const items = useMemo<PaletteItem[]>(() => {
    const trimmed = query.trim();
    // Punto de extensión: al conectar Emitidos, esta entrada busca el documento por código con
    // `trimmed` (referencia, Nº de control o código de generación) y navega a su detalle.
    const search: PaletteItem = {
      id: "search-document",
      group: "Buscar",
      label: trimmed ? `Buscar documento «${trimmed}» por código` : "Buscar documento por código",
      hint: "Disponible al conectar Emitidos",
      icon: FileSearch,
      isDisabled: true,
    };

    const go: PaletteItem[] = entries.flatMap((entry) => {
      const links = entry.kind === "link" ? [{ link: entry, parent: undefined }] : entry.children.map((link) => ({ link, parent: entry.label }));
      return links.flatMap(({ link, parent }) => {
        if (!link.href) return [];
        const href = withSource(link.href, link.source ?? source);
        return [
          {
            id: `go-${link.id}`,
            group: "Ir a" as const,
            label: parent ? `${parent} · ${link.label}` : link.label,
            icon: link.icon,
            keywords: link.href,
            run: () => router.push(href),
          },
        ];
      });
    });

    const switchTo = (code: string, name: string): PaletteItem => ({
      id: `source-${code}`,
      group: "Fuente",
      label: code === ALL_SOURCES ? "Ver todas las fuentes" : `Cambiar a ${name}`,
      hint: code === source ? "actual" : undefined,
      icon: code === source ? Check : Layers,
      keywords: `fuente ${code}`,
      isCurrent: code === source,
      run: () => setSource(code),
    });

    const all = [search, ...go, switchTo(ALL_SOURCES, "Todas"), ...sources.map((s) => switchTo(s.code, s.name))];
    if (!trimmed) return all;
    const needle = normalize(trimmed);
    return all.filter((item) => item.id === search.id || normalize(`${item.label} ${item.keywords ?? ""}`).includes(needle));
  }, [entries, query, router, setSource, source, sources]);

  const enabled = items.filter((item) => !item.isDisabled);
  const active = enabled[Math.min(activeIndex, enabled.length - 1)];
  const optionId = (item: PaletteItem) => `${listId}-${item.id}`;

  function runItem(item: PaletteItem | undefined) {
    if (!item || item.isDisabled || !item.run) return;
    item.run();
    onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (enabled.length === 0) return;
      const current = active ? enabled.indexOf(active) : -1;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current + step + enabled.length) % enabled.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      runItem(active);
    }
  }

  return (
    <div className="flex max-h-[min(560px,70vh)] flex-col">
      <div className="flex items-center gap-3 border-b border-separator px-5">
        <Search aria-hidden className="size-5 shrink-0 text-muted" />
        <input
          autoFocus
          role="combobox"
          aria-label="Buscar documento, cliente o ir a…"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active) : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Buscar documento, cliente o ir a…"
          className="h-14 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted"
        />
        <Kbd aria-hidden className="h-6 px-1.5 text-[11px]">
          Esc
        </Kbd>
      </div>

      <div id={listId} role="listbox" aria-label="Resultados" className="flex-1 overflow-y-auto p-2">
        {GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          const headingId = `${listId}-${group}`;
          return (
            <div key={group} role="group" aria-labelledby={headingId} className="pb-2">
              <div id={headingId} className="px-3 pt-2 pb-1 text-small text-muted">
                {group}
              </div>
              {groupItems.map((item) => {
                const Icon = item.icon;
                const isActive = item === active;
                return (
                  <div
                    key={item.id}
                    id={optionId(item)}
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={item.isDisabled || undefined}
                    onMouseMove={() => {
                      if (!item.isDisabled && !isActive) setActiveIndex(enabled.indexOf(item));
                    }}
                    onClick={() => runItem(item)}
                    className={[
                      "flex h-11 items-center gap-3 rounded-[12px] px-3 text-body",
                      item.isDisabled ? "cursor-not-allowed text-muted" : "cursor-pointer",
                      isActive ? "bg-accent-soft text-accent-soft-foreground" : "",
                    ].join(" ")}
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint && <span className="shrink-0 text-small text-muted">{item.hint}</span>}
                    {isActive && <CornerDownLeft aria-hidden className="size-4 shrink-0" />}
                  </div>
                );
              })}
            </div>
          );
        })}
        {enabled.length === 0 && <p className="px-3 py-6 text-center text-muted">Sin resultados para «{query.trim()}».</p>}
      </div>
    </div>
  );
}
