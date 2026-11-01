"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { ShieldCheck } from "lucide-react";

type FiscalButtonProps = Omit<ButtonProps, "variant" | "className"> & { className?: string };

/**
 * Acción fiscal (Transmitir, Entrar): tinta con texto inverso y sello.
 * HeroUI v3 tipa `variant` como unión cerrada, así que `fiscal` se aplica con la
 * clase `button--fiscal` de styles/theme.css en vez de `<Button variant="fiscal">`.
 */
export function FiscalButton({ children, className, ...props }: FiscalButtonProps) {
  return (
    <Button {...props} className={className ? `button--fiscal ${className}` : "button--fiscal"}>
      {(renderProps) => (
        <>
          <ShieldCheck aria-hidden />
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Button>
  );
}
