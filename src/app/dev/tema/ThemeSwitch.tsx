"use client";

import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const OPTIONS = [
  { id: "light", label: "Claro", Icon: Sun },
  { id: "dark", label: "Oscuro", Icon: Moon },
  { id: "system", label: "Sistema", Icon: Monitor },
] as const;

const subscribe = () => () => {};

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  // El tema guardado solo se conoce en el cliente.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <ToggleButtonGroup
      aria-label="Tema"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={mounted && theme ? [theme] : []}
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (typeof key === "string") setTheme(key);
      }}
    >
      {OPTIONS.map(({ id, label, Icon }) => (
        <ToggleButton key={id} id={id} size="sm">
          <Icon aria-hidden />
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
