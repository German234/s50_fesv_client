// País de la instalación (CLAUDE.md §5). Dos fuentes:
// - Textos de presentación: diccionario local de este archivo, elegido con NEXT_PUBLIC_PAIS.
// - Capacidades (pestañas de bandeja, supportsInvalidation, supportsCorrelativesAdmin): backend,
//   GET /api/v1/meta/country. CountryGate valida que ambos países coincidan antes de renderizar.

import { useCountryMeta } from "@/features/meta/queries";
import type { CountryResponse, InboxType } from "@/lib/api/types";
import { type CountryCode, getCountryCode } from "./countryCode";

export { type CountryCode, getConfiguredCountry, isCountryCode } from "./countryCode";

export interface InboxTabTexts {
  /** Códigos fiscales que agrupa la pestaña, p. ej. ["01", "03"]. */
  codes: string[];
  label: string;
  /** Segmento de ruta: /transmitir/[slug]. */
  slug: string;
}

export interface DocumentTypeText {
  code: string;
  name: string;
}

export interface CountryTexts {
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
  /** Texto de cada bandeja que el país puede tener; cuáles existen lo dice el backend. */
  inboxTabs: Partial<Record<InboxType, InboxTabTexts>>;
  documentTypes: DocumentTypeText[];
  identityDocuments: string[];
}

export const COUNTRY_TEXTS: Record<CountryCode, CountryTexts> = {
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
    inboxTabs: {
      fce: { codes: ["01", "03"], label: "Facturas y créditos fiscales", slug: "facturas" },
      nc: { codes: ["05"], label: "Notas de crédito", slug: "notas-credito" },
      se: { codes: ["14"], label: "Sujeto excluido", slug: "sujeto-excluido" },
    },
    documentTypes: [
      { code: "01", name: "Factura" },
      { code: "03", name: "Crédito fiscal" },
      { code: "05", name: "Nota de crédito" },
      { code: "11", name: "Exportación" },
      { code: "14", name: "Sujeto excluido" },
    ],
    identityDocuments: ["NIT", "DUI", "NRC"],
  },
  DO: {
    code: "DO",
    locale: "es-DO",
    subtitle: "DO · DGII",
    authority: "DGII",
    authorityFull: "la DGII",
    authorityOrg: "DGII",
    docName: "e-CF",
    controlLabel: "e-NCF",
    tax: { name: "ITBIS", rate: 18, label: "ITBIS 18 %" },
    currency: { code: "DOP", symbol: "RD$" },
    emissionHint: "se estampa en el e-CF",
    fileFormat: "XML",
    inboxTabs: {
      fce: { codes: ["31", "32"], label: "Facturas y créditos fiscales", slug: "facturas" },
      nc: { codes: ["34"], label: "Notas de crédito", slug: "notas-credito" },
      ce: { codes: ["41"], label: "Compras", slug: "compras" },
      gm: { codes: ["43"], label: "Gastos menores", slug: "gastos-menores" },
    },
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

/** Textos del país configurado. Sincrónico: no espera al backend. */
export function getCountryTexts(): CountryTexts {
  return COUNTRY_TEXTS[getCountryCode()];
}

export interface TransmitTab extends InboxTabTexts {
  /** Tipo de bandeja en la API. */
  apiType: InboxType;
}

export interface Country extends CountryTexts {
  /** Respuesta del backend: fuente de las capacidades y de la tasa real. */
  meta: CountryResponse;
  /** Pestañas de Transmitir en el orden del backend, solo las disponibles. */
  transmitTabs: TransmitTab[];
  supportsInvalidation: boolean;
  supportsCorrelativesAdmin: boolean;
}

export function buildCountry(texts: CountryTexts, meta: CountryResponse): Country {
  const transmitTabs = meta.inboxTypes.flatMap((apiType) => {
    const tab = texts.inboxTabs[apiType];
    return tab ? [{ ...tab, apiType }] : [];
  });
  return {
    ...texts,
    meta,
    transmitTabs,
    supportsInvalidation: meta.supportsInvalidation,
    supportsCorrelativesAdmin: meta.supportsCorrelativesAdmin,
  };
}

/**
 * País de la instalación: textos locales + capacidades del backend. Solo se usa dentro de
 * CountryGate, que garantiza que la consulta ya respondió y que el país coincide.
 */
export function useCountry(): Country {
  const { data } = useCountryMeta();
  if (!data) {
    throw new Error("useCountry() se usó fuera de <CountryGate> o antes de cargar /api/v1/meta/country.");
  }
  return buildCountry(getCountryTexts(), data);
}

export function findTransmitTab(country: Country, slug: string): TransmitTab | undefined {
  return country.transmitTabs.find((tab) => tab.slug === slug);
}

export function findDocumentType(texts: CountryTexts, code: string): DocumentTypeText | undefined {
  return texts.documentTypes.find((type) => type.code === code);
}
