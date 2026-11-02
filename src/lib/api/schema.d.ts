// Generado por `pnpm api:types` desde http://localhost:5116/openapi/v1.json. No editar a mano.

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
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista paginada con búsqueda y filtros.
         * @description `search` busca en nombre, apellido, correo y DUI. `pageSize` máximo 100.
         */
        get: {
            parameters: {
                query?: {
                    Page?: number;
                    PageSize?: number;
                    /** @description Busca en nombre, apellido, correo y DUI. */
                    Search?: string;
                    /** @description Sin valor: todos. Un usuario con estado NULL en la BD cuenta como inactivo. */
                    State?: components["schemas"]["RecordState"];
                    RoleId?: number;
                };
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
                        "application/json": components["schemas"]["PagedResponseOfUserAdminResponse"];
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
            };
        };
        put?: never;
        /**
         * Crea un usuario.
         * @description 409 `users.emailTaken` si el correo ya existe; 422 `users.roleNotFound` si el rol no existe.
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
                    "application/json": components["schemas"]["CreateUserRequest"];
                    "text/json": components["schemas"]["CreateUserRequest"];
                    "application/*+json": components["schemas"]["CreateUserRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserAdminResponse"];
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
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
    "/api/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["UserAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        /** Edita datos, rol y, opcionalmente, la contraseña. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateUserRequest"];
                    "text/json": components["schemas"]["UpdateUserRequest"];
                    "application/*+json": components["schemas"]["UpdateUserRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserAdminResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        post?: never;
        /**
         * Elimina un usuario sin documentos emitidos.
         * @description 409 `users.hasDocuments` si emitió documentos (desactívalo); 422 `users.cannotDeleteSelf`.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/{id}/state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Activa o desactiva.
         * @description 422 `users.cannotDeactivateSelf` si es el usuario de la sesión. Un usuario desactivado
         *     conserva su token hasta que vence; su siguiente login responde 403 `auth.userInactive`.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ChangeStateRequest"];
                    "text/json": components["schemas"]["ChangeStateRequest"];
                    "application/*+json": components["schemas"]["ChangeStateRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserAdminResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        trace?: never;
    };
    "/api/v1/routes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Todas las rutas ordenadas por path; `state` filtra. */
        get: {
            parameters: {
                query?: {
                    state?: components["schemas"]["RecordState"];
                };
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
                        "application/json": components["schemas"]["RouteAdminResponse"][];
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
        /**
         * Crea una ruta.
         * @description 409 `routes.pathTaken` si el path ya existe.
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
                    "application/json": components["schemas"]["CreateRouteRequest"];
                    "text/json": components["schemas"]["CreateRouteRequest"];
                    "application/*+json": components["schemas"]["CreateRouteRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RouteAdminResponse"];
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
                /** @description Conflict */
                409: {
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
    "/api/v1/routes/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["RouteAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        /**
         * Edita nombre y path.
         * @description 409 `routes.pathTaken`. Cambiar el path de una ruta que un endpoint exige (docs/permisos.md)
         *     deja ese endpoint sin acceso para todos los roles.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateRouteRequest"];
                    "text/json": components["schemas"]["UpdateRouteRequest"];
                    "application/*+json": components["schemas"]["UpdateRouteRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RouteAdminResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Conflict */
                409: {
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
        post?: never;
        /**
         * Elimina una ruta que no está en ningún menú, con sus permisos.
         * @description 409 `routes.inUse` si un menú o submenú la usa.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Conflict */
                409: {
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/routes/{id}/state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Activa o desactiva. Una ruta inactiva no da permisos ni aparece en el menú. */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ChangeStateRequest"];
                    "text/json": components["schemas"]["ChangeStateRequest"];
                    "application/*+json": components["schemas"]["ChangeStateRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RouteAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        trace?: never;
    };
    "/api/v1/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Todos los roles con su número de usuarios. */
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
                        "application/json": components["schemas"]["RoleAdminResponse"][];
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
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CreateRoleRequest"];
                    "text/json": components["schemas"]["CreateRoleRequest"];
                    "application/*+json": components["schemas"]["CreateRoleRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RoleAdminResponse"];
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
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["RoleAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateRoleRequest"];
                    "text/json": components["schemas"]["UpdateRoleRequest"];
                    "application/*+json": components["schemas"]["UpdateRoleRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RoleAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        post?: never;
        /**
         * Elimina un rol sin usuarios, con sus permisos.
         * @description 409 `roles.inUse` si tiene usuarios asignados.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Conflict */
                409: {
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/roles/{id}/state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ChangeStateRequest"];
                    "text/json": components["schemas"]["ChangeStateRequest"];
                    "application/*+json": components["schemas"]["ChangeStateRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RoleAdminResponse"];
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
                /** @description Not Found */
                404: {
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
        trace?: never;
    };
    "/api/v1/roles/{id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Matriz de permisos: todas las rutas activas con las acciones del rol. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["RolePermissionsResponse"];
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
                /** @description Not Found */
                404: {
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
        /**
         * Guarda la matriz completa en una transacción.
         * @description Una fila por cada ruta activa, sin faltantes, sobrantes ni repetidas: si no, 422
         *     `permissions.matrixMismatch` y no se guarda nada. Responde la matriz guardada. El cambio
         *     se aplica de inmediato en esta instancia del servidor (en otras, en hasta 60 s).
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateRolePermissionsRequest"];
                    "text/json": components["schemas"]["UpdateRolePermissionsRequest"];
                    "application/*+json": components["schemas"]["UpdateRolePermissionsRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RolePermissionsResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/menus/tree": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Árbol menú → submenús con su ruta, ordenado por `order`. Incluye inactivos. */
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
                        "application/json": components["schemas"]["MenuNodeResponse"][];
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
    "/api/v1/menus/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["MenuNodeResponse"];
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
                /** @description Not Found */
                404: {
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
        /**
         * Edita un menú.
         * @description Con `hasSubmenus: true` se elimina la ruta directa; los submenús no cambian.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SaveMenuRequest"];
                    "text/json": components["schemas"]["SaveMenuRequest"];
                    "application/*+json": components["schemas"]["SaveMenuRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MenuNodeResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        post?: never;
        /** Elimina el menú y sus submenús en una transacción. */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
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
                /** @description Not Found */
                404: {
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/menus": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Crea un menú al final del orden.
         * @description Sin submenús exige `routeId` (400 con `errors.routeId`). 422 `menus.routeNotFound`
         *     si la ruta no existe.
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
                    "application/json": components["schemas"]["SaveMenuRequest"];
                    "text/json": components["schemas"]["SaveMenuRequest"];
                    "application/*+json": components["schemas"]["SaveMenuRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MenuNodeResponse"];
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
                /** @description Unprocessable Entity */
                422: {
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
    "/api/v1/menus/order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Guarda el orden completo de menús y submenús en una transacción y responde el árbol.
         * @description Todos los menús y todos sus submenús, sin faltantes, sobrantes ni repetidos: si no, 422
         *     `menus.orderMismatch` y no se guarda nada. Poner un submenú bajo otro menú lo mueve.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ReorderMenusRequest"];
                    "text/json": components["schemas"]["ReorderMenusRequest"];
                    "application/*+json": components["schemas"]["ReorderMenusRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MenuNodeResponse"][];
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
                /** @description Unprocessable Entity */
                422: {
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
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/submenus/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
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
                        "application/json": components["schemas"]["SubmenuNodeResponse"];
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
                /** @description Not Found */
                404: {
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
        /** Edita un submenú; si cambia de menú, pasa al final del nuevo. */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SaveSubmenuRequest"];
                    "text/json": components["schemas"]["SaveSubmenuRequest"];
                    "application/*+json": components["schemas"]["SaveSubmenuRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SubmenuNodeResponse"];
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
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                        "application/json": unknown;
                    };
                };
                /** @description Unprocessable Entity */
                422: {
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
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
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
                /** @description Not Found */
                404: {
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/submenus": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Crea un submenú al final de su menú.
         * @description 422 `submenus.menuNotFound` o `menus.routeNotFound`.
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
                    "application/json": components["schemas"]["SaveSubmenuRequest"];
                    "text/json": components["schemas"]["SaveSubmenuRequest"];
                    "application/*+json": components["schemas"]["SaveSubmenuRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SubmenuNodeResponse"];
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
                /** @description Unprocessable Entity */
                422: {
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
        /** @description Cambio de estado de un usuario, rol o ruta. */
        ChangeStateRequest: {
            state: null | components["schemas"]["RecordState"];
        };
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
        CreateRoleRequest: {
            /** @description De 5 a 25 caracteres (mínimo de la legacy, máximo de la columna). */
            name: string;
            /** @description Por defecto `active`. */
            state?: components["schemas"]["RecordState"];
        };
        CreateRouteRequest: {
            name: string;
            /** @description Único (409 `routes.pathTaken`). Minúsculas, números, "_" y "-", con "/" entre segmentos. */
            path: string;
            /** @description Por defecto `active`. */
            state?: components["schemas"]["RecordState"];
        };
        CreateUserRequest: {
            firstName: string;
            lastName: string;
            /** @description 10 caracteres, como en la legacy (p. ej. "01234567-8"). */
            dui: string;
            /** @description Único entre los usuarios (409 `users.emailTaken`). */
            email: string;
            /** @description De 8 a 16 caracteres. Solo se guarda su hash bcrypt. */
            password: string;
            /** Format: int32 */
            roleId: null | number;
            /** @description Por defecto `active`. */
            state?: components["schemas"]["RecordState"];
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
        /** @description Entrada del menú lateral de la sesión. */
        MenuItemResponse: {
            /**
             * Format: int32
             * @description Id del menú (primer nivel) o del submenú (en IReadOnlyList&lt;MenuItemResponse&gt; MenuItemResponse.Children).
             */
            id: number;
            name: string;
            /** @description Nombre del ícono de Material Icons (p. ej. "receipt_long"). */
            icon: null | string;
            /** @description Ruta del frontend (Route.path); null si la entrada solo agrupa hijos. */
            path: null | string;
            children: components["schemas"]["MenuItemResponse"][];
        };
        /** @description Menú de primer nivel en el árbol de administración (incluye inactivos). */
        MenuNodeResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
            /** @description Nombre del ícono de Material Icons (p. ej. "receipt_long"). */
            icon: null | string;
            /** Format: int32 */
            order: null | number;
            state: components["schemas"]["RecordState"];
            route: null | components["schemas"]["RouteRefResponse"];
            submenus: components["schemas"]["SubmenuNodeResponse"][];
        };
        MenuOrderInput: {
            /** Format: int32 */
            id?: number;
            submenuIds?: number[];
        };
        MeResponse: {
            user: components["schemas"]["UserResponse"];
            /** @description Menú del rol: solo lo activo y con permiso de lectura (ver IMenuQuery). */
            menu: components["schemas"]["MenuItemResponse"][];
        };
        /** @description Listado paginado (docs/contrato.md): `page` empieza en 1 y `total` cuenta elementos, no páginas. */
        PagedResponseOfUserAdminResponse: {
            items: components["schemas"]["UserAdminResponse"][];
            /** Format: int32 */
            total: number;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
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
        /** @enum {unknown} */
        RecordState: "inactive" | "active";
        /**
         * @description Orden completo: todos los menús, cada uno con todos sus submenús, en el orden deseado. Un
         *     submenú puede aparecer bajo otro menú para moverlo. Faltantes, sobrantes o repetidos: 422
         *     `menus.orderMismatch` y no se guarda nada.
         */
        ReorderMenusRequest: {
            menus: null | components["schemas"]["MenuOrderInput"][];
        };
        RoleAdminResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
            state: components["schemas"]["RecordState"];
            /**
             * Format: int32
             * @description Usuarios con este rol (activos e inactivos).
             */
            userCount: number;
        };
        /** @description Matriz de permisos de un rol: una fila por ruta activa, ordenadas por path. */
        RolePermissionsResponse: {
            role: components["schemas"]["RoleAdminResponse"];
            routes: components["schemas"]["RoutePermissionResponse"][];
        };
        /** @description Referencia corta a un rol dentro de otra respuesta. */
        RoleRefResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
        };
        RoleResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
        };
        RouteAdminResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
            path: null | string;
            state: components["schemas"]["RecordState"];
        };
        RoutePermissionInput: {
            /** Format: int32 */
            routeId?: number;
            create?: boolean;
            read?: boolean;
            update?: boolean;
            delete?: boolean;
        };
        /**
         * @description Acciones efectivas del rol sobre la ruta: solo cuenta un permiso activo (si hay varias filas
         *     para la ruta, se suman). Sin permiso activo, las cuatro van en false.
         */
        RoutePermissionResponse: {
            /** Format: int32 */
            routeId: number;
            name: null | string;
            path: null | string;
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
            state: null | components["schemas"]["RecordState"];
        };
        /** @description Referencia corta a una ruta dentro de otra respuesta. */
        RouteRefResponse: {
            /** Format: int32 */
            id: number;
            name: null | string;
            path: null | string;
            state: components["schemas"]["RecordState"];
        };
        /**
         * @description Alta o edición de un menú. Sin submenús (`hasSubmenus: false`) exige `routeId`; con
         *     submenús se elimina la ruta directa. El orden lo asigna el servidor al crear (al final) y lo
         *     cambia `PUT /menus/order`.
         */
        SaveMenuRequest: {
            name: string;
            icon: string;
            /** @description Por defecto `active`. */
            state?: components["schemas"]["RecordState"];
            hasSubmenus?: boolean;
            /**
             * Format: int32
             * @description Obligatoria si `hasSubmenus` es false; se ignora si es true.
             */
            routeId?: null | number;
        };
        /** @description Alta o edición de un submenú. Si cambia de menú, pasa al final del nuevo. */
        SaveSubmenuRequest: {
            /** Format: int32 */
            menuId: null | number;
            name: string;
            icon: string;
            state?: components["schemas"]["RecordState"];
            /** Format: int32 */
            routeId: null | number;
        };
        SubmenuNodeResponse: {
            /** Format: int32 */
            id: number;
            /** Format: int32 */
            menuId: number;
            name: null | string;
            /** @description Nombre del ícono de Material Icons. */
            icon: null | string;
            /** Format: int32 */
            order: null | number;
            state: components["schemas"]["RecordState"];
            route: null | components["schemas"]["RouteRefResponse"];
        };
        /**
         * @description Matriz completa: exactamente una fila por cada ruta activa (ni más, ni menos, ni repetidas;
         *     si no, 422 `permissions.matrixMismatch`). Una fila con alguna acción deja el permiso
         *     activo con esas acciones; una fila sin acciones lo desactiva.
         */
        UpdateRolePermissionsRequest: {
            routes: null | components["schemas"]["RoutePermissionInput"][];
        };
        /** @description Renombra el rol. El estado se cambia con `PATCH /roles/{id}/state`. */
        UpdateRoleRequest: {
            name: string;
        };
        /** @description Edita nombre y path. El estado se cambia con `PATCH /routes/{id}/state`. */
        UpdateRouteRequest: {
            name: string;
            path: string;
        };
        /** @description Edición de datos. El estado se cambia con `PATCH /users/{id}/state`. */
        UpdateUserRequest: {
            firstName: string;
            lastName: string;
            dui: string;
            email: string;
            /** @description Null o ausente: no cambia. Si viene, de 8 a 16 caracteres. */
            password?: null | string;
            /** Format: int32 */
            roleId: null | number;
        };
        /** @description Usuario para la administración. Nunca lleva el hash de la contraseña. */
        UserAdminResponse: {
            /** Format: int32 */
            id: number;
            firstName: null | string;
            lastName: null | string;
            dui: null | string;
            email: null | string;
            state: components["schemas"]["RecordState"];
            role: null | components["schemas"]["RoleRefResponse"];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
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
