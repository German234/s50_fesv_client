// Textos y tablas por país (CLAUDE.md §5). Las capacidades (pestañas habilitadas,
// supportsInvalidation, supportsCorrelativesAdmin) vienen del backend; aquí solo
// está lo que el frontend necesita para rotular.
// TODO etapa 2: validar NEXT_PUBLIC_PAIS contra GET /api/v1/meta/country y los
// `apiType` contra schema.d.ts.

export type CountryCode = "SV" | "RD";

export interface TransmitTab {
  /** Códigos fiscales que agrupa la pestaña, p. ej. ["01", "03"]. */
  codes: string[];
  label: string;
  /** Segmento de ruta: /transmitir/[slug]. */
  slug: string;
  /** Tipo de bandeja en la API. */
  apiType: string;
}

export interface DocumentType {
  code: string;
  name: string;
}

export interface CountryConfig {
  code: CountryCode;
  /** Locale de React Aria y de Intl para fechas. */
  locale: string;
  subtitle: string;
  authority: string;
  authorityFull: string;
  authorityOrg: string;
  docName: string;
  controlLabel: string;
  tax: { name: string; rate: number; label: string };
  currency: { code: string; symbol: string };
  emissionHint: string;
  fileFormat: "JSON" | "XML";
  transmitTabs: TransmitTab[];
  documentTypes: DocumentType[];
  identityDocuments: string[];
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  SV: {
    code: "SV",
    locale: "es-SV",
    subtitle: "SV · Hacienda",
    authority: "MH",
    authorityFull: "Hacienda (MH)",
    authorityOrg: "Ministerio de Hacienda",
    docName: "DTE",
    controlLabel: "Nº de control",
    tax: { name: "IVA", rate: 13, label: "IVA 13 %" },
    currency: { code: "USD", symbol: "$" },
    emissionHint: "se estampa en el DTE",
    fileFormat: "JSON",
    transmitTabs: [
      { codes: ["01", "03"], label: "Facturas y créditos fiscales", slug: "facturas", apiType: "fce" },
      { codes: ["05"], label: "Notas de crédito", slug: "notas-credito", apiType: "nc" },
      { codes: ["14"], label: "Sujeto excluido", slug: "sujeto-excluido", apiType: "se" },
    ],
    documentTypes: [
      { code: "01", name: "Factura" },
      { code: "03", name: "Crédito fiscal" },
      { code: "05", name: "Nota de crédito" },
      { code: "11", name: "Exportación" },
      { code: "14", name: "Sujeto excluido" },
    ],
    identityDocuments: ["NIT", "DUI", "NRC"],
  },
  RD: {
    code: "RD",
    locale: "es-DO",
    subtitle: "RD · DGII",
    authority: "DGII",
    authorityFull: "la DGII",
    authorityOrg: "DGII",
    docName: "e-CF",
    controlLabel: "e-NCF",
    tax: { name: "ITBIS", rate: 18, label: "ITBIS 18 %" },
    currency: { code: "DOP", symbol: "RD$" },
    emissionHint: "se estampa en el e-CF",
    fileFormat: "XML",
    transmitTabs: [
      { codes: ["31", "32"], label: "Facturas y créditos fiscales", slug: "facturas", apiType: "fce" },
      { codes: ["34"], label: "Notas de crédito", slug: "notas-credito", apiType: "nc" },
      { codes: ["41"], label: "Compras", slug: "compras", apiType: "ce" },
      { codes: ["43"], label: "Gastos menores", slug: "gastos-menores", apiType: "gm" },
    ],
    documentTypes: [
      { code: "31", name: "Crédito fiscal" },
      { code: "32", name: "Consumo" },
      { code: "34", name: "Nota de crédito" },
      { code: "41", name: "Compras" },
      { code: "43", name: "Gastos menores" },
    ],
    // RNC: 9 dígitos · cédula: 11. Las regex se copiarán de docs/contrato.md del backend.
    identityDocuments: ["RNC", "Cédula"],
  },
};

function readCountryCode(): CountryCode {
  // Acceso literal para que Next lo incruste en el bundle del cliente.
  const value = process.env.NEXT_PUBLIC_PAIS;
  if (value === "SV" || value === "RD") return value;
  throw new Error(`NEXT_PUBLIC_PAIS debe ser "SV" o "RD" (valor actual: ${JSON.stringify(value)}).`);
}

export function getCountry(): CountryConfig {
  return COUNTRIES[readCountryCode()];
}

/** Configuración del país de esta instalación. Es fija durante toda la sesión. */
export function useCountry(): CountryConfig {
  return getCountry();
}

export function findTransmitTab(country: CountryConfig, slug: string): TransmitTab | undefined {
  return country.transmitTabs.find((tab) => tab.slug === slug);
}

export function findDocumentType(country: CountryConfig, code: string): DocumentType | undefined {
  return country.documentTypes.find((type) => type.code === code);
}
