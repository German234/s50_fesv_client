/** Minúsculas y sin acentos, para comparar búsquedas locales. */
export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
}

/** true si la búsqueda está vacía o algún campo la contiene (sin acentos ni mayúsculas). */
export function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const needle = normalizeText(query.trim());
  if (needle === "") return true;
  return fields.some((field) => field != null && normalizeText(field).includes(needle));
}
