"use client";

import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const OPTIONS = [
  { id: "light", label: "Claro", Icon: Sun },
  { id: "dark", label: "Oscuro", Icon: Moon },
] as const;

const subscribe = () => () => {};

/** Selector Claro/Oscuro segmentado. Sin elección guardada sigue al sistema y marca el tema resuelto. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // El tema solo se conoce en el cliente.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <ToggleButtonGroup
      aria-label="Tema"
      selectionMode="single"
      disallowEmptySelection
      fullWidth
      selectedKeys={mounted && resolvedTheme ? [resolvedTheme] : []}
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (typeof key === "string") setTheme(key);
      }}
      className="segmented gap-1 rounded-full bg-default p-1"
    >
      {OPTIONS.map(({ id, label, Icon }) => (
        <ToggleButton key={id} id={id} size="sm" className="flex-1 rounded-full">
          <Icon aria-hidden className="size-4" />
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
