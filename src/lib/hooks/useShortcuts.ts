"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { create } from "zustand";

/**
 * Registro central de atajos de teclado (CLAUDE.md §9). Cada pantalla declara los suyos con
 * `useShortcut`; un único listener (`useShortcutListener`, montado en el shell) los despacha y la
 * hoja "?" los lista desde este mismo registro.
 */
export interface ShortcutDefinition {
  /** Único en la aplicación: "shell.palette", "transmit.refresh"… */
  id: string;
  /** "mod+k", "f", "?", "shift+r", "alt+arrowup". `mod` = ⌘ en Mac y Ctrl en el resto. */
  combo: string;
  /** Lo que muestra la hoja de atajos. */
  description: string;
  /** Sección de la hoja: "General", "Transmitir"… */
  group: string;
  /** También con el foco en un input o textarea (⌘K, Esc). Por defecto no. */
  allowInInputs?: boolean;
  /** También con un modal o drawer abierto. Por defecto no. */
  allowInModals?: boolean;
  /** Sin desmontar: un atajo que hoy no aplica (p. ej. sin selección). Por defecto true. */
  enabled?: boolean;
}

interface RegisteredShortcut extends ShortcutDefinition {
  handler: { current: (event: KeyboardEvent) => void };
}

interface ShortcutRegistry {
  shortcuts: RegisteredShortcut[];
  register: (shortcut: RegisteredShortcut) => void;
  unregister: (id: string) => void;
}

const useShortcutRegistry = create<ShortcutRegistry>()((set) => ({
  shortcuts: [],
  register: (shortcut) =>
    set((state) => ({ shortcuts: [...state.shortcuts.filter((s) => s.id !== shortcut.id), shortcut] })),
  unregister: (id) => set((state) => ({ shortcuts: state.shortcuts.filter((s) => s.id !== id) })),
}));

/** Registra un atajo mientras el componente está montado. El handler puede cambiar en cada render. */
export function useShortcut(definition: ShortcutDefinition, handler: (event: KeyboardEvent) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  const { id, combo, description, group, allowInInputs, allowInModals, enabled = true } = definition;
  useEffect(() => {
    const { register, unregister } = useShortcutRegistry.getState();
    register({ id, combo, description, group, allowInInputs, allowInModals, enabled, handler: handlerRef });
    return () => unregister(id);
  }, [id, combo, description, group, allowInInputs, allowInModals, enabled]);
}

/** Atajos registrados y habilitados, para la hoja "?". */
export function useRegisteredShortcuts(): ShortcutDefinition[] {
  return useShortcutRegistry((state) => state.shortcuts).filter((s) => s.enabled !== false);
}

const NON_TEXT_INPUTS = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"]);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

function isModalOpen(): boolean {
  return document.querySelector('[role="dialog"], [role="alertdialog"]') !== null;
}

interface ParsedCombo {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop() ?? "";
  return { key, mod: parts.includes("mod"), shift: parts.includes("shift"), alt: parts.includes("alt") };
}

export function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const parsed = parseCombo(combo);
  if (event.key.toLowerCase() !== parsed.key) return false;
  if ((event.metaKey || event.ctrlKey) !== parsed.mod) return false;
  if (event.altKey !== parsed.alt) return false;
  // "?" o "/" ya implican (o no) Shift según el teclado; solo se compara en letras y teclas con nombre.
  const isSymbol = parsed.key.length === 1 && !/[a-z0-9]/.test(parsed.key);
  return isSymbol || event.shiftKey === parsed.shift;
}

/** Listener global. Se monta una sola vez, en el shell. */
export function useShortcutListener(): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      const inInput = isEditable(event.target);
      const inModal = isModalOpen();
      // El más reciente gana: una pantalla puede redefinir una combinación del shell.
      const shortcuts = useShortcutRegistry.getState().shortcuts;
      for (let i = shortcuts.length - 1; i >= 0; i--) {
        const shortcut = shortcuts[i];
        if (shortcut.enabled === false) continue;
        if (inInput && !shortcut.allowInInputs) continue;
        if (inModal && !shortcut.allowInModals) continue;
        if (!matchesCombo(event, shortcut.combo)) continue;
        event.preventDefault();
        shortcut.handler.current(event);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

const KEY_LABELS: Record<string, string> = {
  enter: "↵",
  escape: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  alt: "Alt",
  shift: "⇧",
};

const subscribeNothing = () => () => {};

/** Mac o no, para mostrar ⌘ o Ctrl. En el servidor y al hidratar vale false. */
export function useIsMac(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => false,
  );
}

/** "mod+k" → ["⌘", "K"] en Mac y ["Ctrl", "K"] en el resto. */
export function formatCombo(combo: string, isMac: boolean): string[] {
  return combo.split("+").map((part) => {
    const key = part.toLowerCase();
    if (key === "mod") return isMac ? "⌘" : "Ctrl";
    return KEY_LABELS[key] ?? part.toUpperCase();
  });
}
