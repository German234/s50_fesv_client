// Genera src/lib/api/schema.d.ts desde el OpenAPI del backend.
// 1) ${NEXT_PUBLIC_API_URL}/openapi/v1.json si el backend está levantado;
// 2) si no, el archivo de API_SCHEMA_PATH (docs/api/openapi.json del backend).
// Las variables se leen de .env.local / .env (ver script "api:types").
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const OUTPUT = resolve("src/lib/api/schema.d.ts");
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const schemaPath = process.env.API_SCHEMA_PATH;

async function fromBackend() {
  if (!apiUrl) return null;
  const url = `${apiUrl}/openapi/v1.json`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      console.warn(`${url} respondió ${response.status}.`);
      return null;
    }
    return { source: url, schema: await response.json() };
  } catch {
    console.warn(`No se pudo leer ${url} (¿backend apagado?).`);
    return null;
  }
}

function fromFile() {
  if (!schemaPath) return null;
  const path = resolve(schemaPath);
  if (!existsSync(path)) {
    console.warn(`No existe ${path}.`);
    return null;
  }
  return { source: path, schema: pathToFileURL(path) };
}

const input = (await fromBackend()) ?? fromFile();
if (!input) {
  console.error("Sin OpenAPI: levanta el backend o define API_SCHEMA_PATH (ver .env.example).");
  process.exit(1);
}

const ast = await openapiTS(input.schema);
const header = `// Generado por \`pnpm api:types\` desde ${input.source}. No editar a mano.\n\n`;
await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, header + astToString(ast));
console.log(`schema.d.ts generado desde ${input.source}`);
