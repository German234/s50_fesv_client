// Datos estáticos de demostración para /dev/componentes. No representan la API: son props
// de ejemplo, deterministas (sin aleatoriedad) para que el render del servidor y del cliente coincida.

export interface DemoDocument {
  id: number;
  reference: string;
  customer: string;
  customerCode: string;
  /** null = cliente no registrado (fila bloqueada). */
  registered: boolean;
  typeCode: string;
  review: boolean;
  postedOn: string;
  subtotal: number;
}

const CUSTOMERS = [
  "Distribuidora Cuscatlán, S.A. de C.V.",
  "Ferretería El Volcán, S.A. de C.V.",
  "Grupo Agroindustrial Izalco",
  "Café Las Nubes de Apaneca",
  "Constructora Los Próceres, S.A.",
  "Farmacia Santa Lucía",
  "Comercial La Libertad, S.A. de C.V.",
  "Inversiones Santa Ana, S.A.",
  "Textiles del Lempa",
  "Panadería San Martín",
  "Hotel Mirador de Suchitoto",
];

/** 120 documentos: 1 de cada 9 sin cliente registrado y 1 de cada 13 con montos por revisar. */
export function buildDemoDocuments(typeCodes: string[]): DemoDocument[] {
  return Array.from({ length: 120 }, (_, index) => {
    const n = index + 1;
    const typeCode = typeCodes[index % typeCodes.length] ?? "01";
    const day = 28 - (index % 27);
    return {
      id: n,
      reference: `${typeCode === typeCodes[0] ? "FAC" : "CCF"}-${String(4500 + n).padStart(6, "0")}`,
      customer: CUSTOMERS[index % CUSTOMERS.length] ?? "Cliente",
      customerCode: `C-${String(100 + ((index * 37) % 400)).padStart(5, "0")}`,
      registered: n % 9 !== 3,
      typeCode,
      review: n % 13 === 5,
      postedOn: `2026-10-${String(day).padStart(2, "0")}`,
      subtotal: Math.round(((n * 7919) % 1500000) + 9650) / 100,
    };
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[A-ZÁÉÍÓÚÑ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}
