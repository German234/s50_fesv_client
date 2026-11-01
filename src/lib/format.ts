// Formatos de presentación. Los montos llegan de la API como número (decimal) y las
// fechas fiscales como "yyyy-MM-dd"; las fechas con hora, como ISO 8601.

const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * 12480 → "12,480.00"; -1250 → "-1,250.00". La moneda va en la cabecera de la
 * columna (§7), así que el símbolo es opcional: formatMoney(5, { symbol: "$" }) → "$ 5.00".
 */
export function formatMoney(value: number | string, options: { symbol?: string } = {}): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "";
  // Evita "-0.00" en montos que redondean a cero.
  const formatted = moneyFormatter.format(Object.is(amount, -0) ? 0 : amount).replace(/^-(0\.00)$/, "$1");
  return options.symbol ? `${options.symbol} ${formatted}` : formatted;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Fecha en dd/mm/aaaa. "2026-10-30" se toma tal cual, sin zona horaria; un ISO con
 * hora o un Date se muestran en la fecha local. Vacío o inválido → "".
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const match = DATE_ONLY.exec(value);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** "3f2a9c1e-…-6d6a1b8b2e17" → "3f2a9c1e…8b2e17". No trunca si no ahorra espacio. */
export function truncateMiddle(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
