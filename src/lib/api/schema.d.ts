// Generado por `pnpm api:types` desde C:\Users\santo\OneDrive\Documentos\FESV\s50_fesv_backend\docs\api\openapi.json. No editar a mano.

export interface paths {
    "/api/v1/meta/country": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * País de la instalación y sus capacidades.
         * @description El frontend valida aquí su NEXT_PUBLIC_PAIS y decide pestañas y acciones.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CountryResponse"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/dev/errors/{kind}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Responde siempre con el error pedido. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description Tipo de error a provocar. */
                    kind: components["schemas"]["DevErrorKind"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ValidationProblemDetails"];
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Unprocessable Entity */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Internal Server Error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Bad Gateway */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        CountryResponse: {
            /** @description "SV" o "DO". */
            code: string;
            name: string;
            /**
             * Format: double
             * @description Tasa general como fracción: 0.13 o 0.18.
             */
            taxRate: number;
            /** @description "IVA" o "ITBIS". */
            taxLabel: string;
            currency: components["schemas"]["CurrencyResponse"];
            /** @description Zona horaria IANA. */
            timeZone: string;
            /** @description Bandejas de Transmitir disponibles, en el orden de las pestañas. */
            inboxTypes: components["schemas"]["InboxType"][];
            supportsInvalidation: boolean;
            supportsCorrelativesAdmin: boolean;
            /** @description Tipos de documento fiscal del país. */
            documentTypes: components["schemas"]["DocumentTypeResponse"][];
        };
        CurrencyResponse: {
            /** @description ISO 4217: USD o DOP. */
            code: string;
            symbol: string;
            name: string;
        };
        /** @enum {unknown} */
        DevErrorKind: "validation" | "business" | "notFound" | "conflict" | "external" | "unexpected" | "forbidden";
        DocumentTypeResponse: {
            code: string;
            name: string;
        };
        /**
         * @description Bandeja de documentos pendientes de Sage, por tipo de la API.
         * @enum {unknown}
         */
        InboxType: "fce" | "nc" | "se" | "ce" | "gm";
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
            /** @description Identificador estable del error, formato modulo.motivo. */
            code: string;
            /** @description Id de correlación con el log del servidor. */
            traceId?: string;
        };
        ValidationProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
            errors?: {
                [key: string]: string[];
            };
            /** @description Identificador estable del error, formato modulo.motivo. */
            code: string;
            /** @description Id de correlación con el log del servidor. */
            traceId?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
