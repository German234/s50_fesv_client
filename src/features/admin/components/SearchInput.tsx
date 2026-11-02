"use client";

import { Kbd, SearchField } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { useShortcut } from "@/lib/hooks/useShortcuts";

/**
 * Búsqueda de la pantalla: avisa con debounce de 300 ms (§10) y "/" la enfoca (§9).
 * `value` es el valor confirmado (el de la URL); lo escrito se conserva mientras corre el debounce.
 */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Si el valor cambia desde afuera (atrás/adelante del navegador, "Limpiar"), manda la URL.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text.trim() === value.trim()) return;
    const timeout = setTimeout(() => onChangeRef.current(text.trim()), 300);
    return () => clearTimeout(timeout);
  }, [text, value]);

  useShortcut({ id: "admin.search", combo: "/", description: "Enfocar la búsqueda", group: "Administración" }, () =>
    inputRef.current?.focus(),
  );

  return (
    <SearchField aria-label={label} value={text} onChange={setText} className={className}>
      <SearchField.Group className="h-11 shadow-none">
        <SearchField.SearchIcon />
        <SearchField.Input ref={inputRef} placeholder={placeholder} />
        {text === "" ? (
          <Kbd aria-hidden className="me-3 h-5 px-1.5 text-[11px]">
            /
          </Kbd>
        ) : (
          <SearchField.ClearButton aria-label="Borrar búsqueda" />
        )}
      </SearchField.Group>
    </SearchField>
  );
}
