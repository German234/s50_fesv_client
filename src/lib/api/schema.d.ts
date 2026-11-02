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
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Inicia sesión con correo y contraseña.
         * @description Correo inexistente o contraseña incorrecta: 401 `auth.invalidCredentials` (no se distingue).
         *     Usuario inactivo: 403 `auth.userInactive`; sin rol: 403 `auth.userWithoutRole`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                    "text/json": components["schemas"]["LoginRequest"];
                    "application/*+json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LoginResponse"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ValidationProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Forbidden */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Too Many Requests */
                429: {
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
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Usuario de la sesión y su menú.
         * @description 401 `auth.unauthenticated` si el token venció o el usuario ya no existe; 403 si se inactivó.
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
                        "application/json": components["schemas"]["MeResponse"];
                    };
                };
                /** @description Unauthorized */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Forbidden */
                403: {
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
    "/api/v1/auth/me/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Permisos del rol de la sesión: ruta de pantalla → letras de "CRUD".
         * @description Para `usePermissions(route)` del frontend, p. ej. `{ "customers": "CRUD", "cipsa/fc_ccf": "R" }`.
         *     Solo incluye permisos activos de rutas activas; una ruta ausente significa sin acceso. El
         *     servidor aplica los mismos permisos (403 `auth.forbidden`), con hasta 60 s de cache.
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
                        "application/json": {
                            [key: string]: string;
                        };
                    };
                };
                /** @description Unauthorized */
                401: {
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
    "/api/v1/auth/password-reset/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Envía un código de recuperación al correo.
         * @description Siempre responde 202, esté o no registrado el correo. El código vence a los 15 minutos (configurable).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["PasswordResetRequest"];
                    "text/json": components["schemas"]["PasswordResetRequest"];
                    "application/*+json": components["schemas"]["PasswordResetRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ValidationProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Too Many Requests */
                429: {
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
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Comprueba el código sin usarlo.
         * @description 400 `auth.resetCodeInvalid` si el código es incorrecto, venció, agotó sus intentos o el
         *     correo no está registrado (no se distingue). Cada fallo descuenta un intento.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["PasswordResetVerifyRequest"];
                    "text/json": components["schemas"]["PasswordResetVerifyRequest"];
                    "application/*+json": components["schemas"]["PasswordResetVerifyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ValidationProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Too Many Requests */
                429: {
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
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cambia la contraseña con el código.
         * @description La contraseña nueva tiene de 8 a 16 caracteres (400 `validation.failed` con `errors.newPassword`).
         *     El código queda usado. Mismo 400 `auth.resetCodeInvalid` que verify.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["PasswordResetConfirmRequest"];
                    "text/json": components["schemas"]["PasswordResetConfirmRequest"];
                    "application/*+json": components["schemas"]["PasswordResetConfirmRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": unknown;
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ValidationProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Too Many Requests */
                429: {
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
        LoginRequest: {
            email: string;
            /** @description Sin reglas de longitud mínima: las contraseñas heredadas pueden ser más cortas que la regla actual. */
            password: string;
        };
        LoginResponse: {
            /** @description JWT para la cabecera `Authorization: Bearer`. */
            accessToken: string;
            /**
             * Format: date-time
             * @description Vencimiento del token. Después, toda llamada responde 401 `auth.unauthenticated`.
             */
            expiresAt: string;
            user: components["schemas"]["UserResponse"];
        };
        /**
         * @description Entrada del menú lateral. Provisional: el Bloque 5 fija la forma definitiva (rutas y acciones
         *     permitidas por D1) a partir de Menus, Submenus, MenuRoutes y Permissions.
         */
        MenuItemResponse: {
            /** Format: int32 */
            id: number;
            name: string;
            icon: null | string;
            /** @description Ruta del frontend (Route.path); null si la entrada solo agrupa hijos. */
            path: null | string;
            children: components["schemas"]["MenuItemResponse"][];
        };
        MeResponse: {
            user: components["schemas"]["UserResponse"];
            /** @description Menú del rol. Vacío hasta el Bloque 5. */
            menu: components["schemas"]["MenuItemResponse"][];
        };
        PasswordResetConfirmRequest: {
            email: string;
            code: string;
            /** @description De 8 a 16 caracteres, igual que el frontend. */
            newPassword: string;
        };
        PasswordResetRequest: {
            email: string;
        };
        PasswordResetVerifyRequest: {
            email: string;
            /** @description Código de 6 dígitos recibido por correo. */
            code: string;
        };
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
        RoleResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
        };
        /** @description Usuario autenticado. Nunca lleva el hash de la contraseña ni datos de recuperación. */
        UserResponse: {
            /** Format: int32 */
            id: number;
            firstName: null | string;
            lastName: null | string;
            email: string;
            role: components["schemas"]["RoleResponse"];
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
