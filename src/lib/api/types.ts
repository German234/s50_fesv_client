// Alias legibles sobre schema.d.ts (generado con `pnpm api:types`). Aquí no se escriben
// formas de requests ni de responses: solo se nombran las del contrato.
import type { components, paths } from "./schema";

type Schemas = components["schemas"];

export type ProblemDetails = Schemas["ProblemDetails"];
export type ValidationProblemDetails = Schemas["ValidationProblemDetails"];
export type DevErrorKind = Schemas["DevErrorKind"];
export type CountryResponse = Schemas["CountryResponse"];
export type InboxType = Schemas["InboxType"];

// Utilidades para tipar las funciones de features/<dominio>/api.ts a partir de `paths`.

export type ApiPath = keyof paths;
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type Operation<P extends ApiPath, M extends HttpMethod> = NonNullable<paths[P][M]>;

/** Parámetros de ruta: PathParams<"/api/v1/dev/errors/{kind}", "get"> → { kind: DevErrorKind }. */
export type PathParams<P extends ApiPath, M extends HttpMethod> =
  Operation<P, M> extends { parameters: { path?: infer T } } ? NonNullable<T> : never;

/** Parámetros de query de la operación. */
export type QueryParams<P extends ApiPath, M extends HttpMethod> =
  Operation<P, M> extends { parameters: { query?: infer T } } ? NonNullable<T> : never;

/** Cuerpo JSON del request. */
export type JsonBody<P extends ApiPath, M extends HttpMethod> =
  Operation<P, M> extends { requestBody?: { content: { "application/json": infer B } } } ? B : never;

/** Cuerpo JSON de la respuesta con el status indicado (200 por defecto). */
export type JsonResponse<P extends ApiPath, M extends HttpMethod, S extends number = 200> =
  Operation<P, M> extends { responses: infer R }
    ? S extends keyof R
      ? R[S] extends { content: { "application/json": infer B } }
        ? B
        : never
      : never
    : never;
