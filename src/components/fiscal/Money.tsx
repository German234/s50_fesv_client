import { formatMoney } from "@/lib/format";

export interface MoneyProps {
  value: number | string | null | undefined;
  /** Símbolo delante del monto; por defecto no lleva: la moneda va en la cabecera de la columna. */
  symbol?: string;
  /** Totales: peso semibold. */
  emphasis?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/** Monto: mono, cifras tabulares, alineado a la derecha; ceros en muted y negativos con signo. */
export function Money({ value, symbol, emphasis = false, size = "md", className }: MoneyProps) {
  const amount = typeof value === "string" ? Number(value) : value;
  const isZero = amount === 0;
  const isMissing = amount === null || amount === undefined || !Number.isFinite(amount);

  return (
    <span
      className={[
        "inline-block text-right font-mono whitespace-nowrap tabular-nums",
        size === "sm" ? "text-[12px]" : "text-[13px]",
        emphasis ? "font-semibold" : "",
        isZero || isMissing ? "text-muted" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isMissing ? "—" : formatMoney(amount, { symbol })}
    </span>
  );
}
