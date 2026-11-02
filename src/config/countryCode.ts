// Código de país configurado (NEXT_PUBLIC_PAIS). Módulo sin dependencias: lo usan las query
// keys y config/country.ts sin crear importaciones circulares.

/** República Dominicana es "DO", igual que el backend (nunca "RD"). */
export type CountryCode = "SV" | "DO";

/** Valor crudo de NEXT_PUBLIC_PAIS (acceso literal para que Next lo incruste en el cliente). */
export function getConfiguredCountry(): string | undefined {
  return process.env.NEXT_PUBLIC_PAIS;
}

export function isCountryCode(value: string | undefined): value is CountryCode {
  return value === "SV" || value === "DO";
}

export function getCountryCode(): CountryCode {
  const value = getConfiguredCountry();
  if (isCountryCode(value)) return value;
  throw new Error(`NEXT_PUBLIC_PAIS debe ser "SV" o "DO" (valor actual: ${JSON.stringify(value)}).`);
}
