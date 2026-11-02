# Progreso

Bitácora de cierre de bloques: cada bloque terminado agrega aquí su Resumen de cierre (§11), en orden cronológico.

## Estructura · Estructura del proyecto, tema y país · 2026-11-01 (reconstruida)

Reconstruida a partir del commit `a311ad2` y del código; el resumen original no quedó registrado.

1. **Archivos creados y modificados.** Proyecto Next.js con pnpm, ESLint y TypeScript estricto (`package.json`, `tsconfig`, `eslint.config.mjs`). `CLAUDE.md` y `AGENTS.md`. `scripts/api-types.mjs`, que genera `src/lib/api/schema.d.ts` desde el OpenAPI del backend. `src/app/layout.tsx`, `providers.tsx`, `globals.css` y la página `/dev/tema`. `config/country.ts` (SV y DO), `components/fiscal/FiscalButton.tsx`, utilidades de formato de dinero y fecha, y carpetas vacías (`.gitkeep`) para las pantallas de §8 y los features.
2. **Qué se probó contra el backend local.** No consta.
3. **Partes NO verificadas.** No consta.
4. **Diferencias con el diseño.** No consta.
5. **Cambios de contrato pedidos al backend.** No consta.
6. **Dependencias agregadas.** Las de §2: HeroUI, TanStack Query, axios, react-hook-form + zod, zustand, next-themes, lucide-react y sileo.
7. **Decisiones pendientes.** No consta.

## Datos · Capa de datos, errores y componentes fiscales · 2026-11-01 (reconstruida)

Reconstruida a partir del commit `5a34b36` y del código; el resumen original no quedó registrado.

1. **Archivos creados y modificados.**
   - Cliente axios con normalización de ProblemDetails a `{ code, message, details }`, en el que solo el 401 cierra la sesión (`lib/api/client.ts`, `errors.ts`, `queryKeys.ts`, `types.ts`).
   - `schema.d.ts` generado y toasts (`lib/toast.ts`).
   - Stores zustand (`useSelectionStore`, `useSourceStore`, `useUiStore`) y `useUrlFilters`.
   - Features `meta` (país) y `dev` (errores provocados y health).
   - `CountryGate` en el shell.
   - Componentes fiscales: DataTable, FilterBar, BulkActionBar, DocumentSheet, CriticalConfirm, CopyCode, DocTypeChip, Money, FiscalDateField, StateViews y TableSkeleton.
   - Páginas `/dev/componentes` y `/dev/datos`. Se ajustó `CLAUDE.md`.
2. **Qué se probó contra el backend local.** Por el código, `/dev/datos` ejercita `GET /api/v1/dev/errors/{kind}` y `/health`. No consta el resultado.
3. **Partes NO verificadas.** No consta.
4. **Diferencias con el diseño.** No consta.
5. **Cambios de contrato pedidos al backend.** No consta.
6. **Dependencias agregadas.** Ninguna nueva respecto a §2, según `package.json`.
7. **Decisiones pendientes.** No consta.

## Autenticación · Sesión, login y recuperación de contraseña · 2026-11-01

1. **Archivos creados y modificados.**
   - Sesión:
     - `features/auth/api.ts` y `queries.ts`, con `useMe`, `useMyPermissions`, `useSignIn`, `useSession`, `useSessionExpiry`, `usePermissions(route)` y las mutaciones de login y recuperación.
     - `session.ts`: cookie `fesv_token`, `SameSite=Lax`, vence en `expiresAt`.
     - `errors.ts` (mensajes por código) y `schemas.ts` (Zod 4).
     - `src/proxy.ts`. En Next 16 `middleware.ts` pasó a llamarse `proxy.ts`.
     - `lib/api/authRedirect.ts`, con `loginHref` y `safeNextPath`, que evita redirecciones abiertas.
   - Pantallas:
     - `(auth)/layout.tsx`, `(auth)/login/page.tsx` y `(auth)/recuperar/page.tsx`.
     - Componentes en `features/auth/components/`: AuthCard, AuthField, AuthPanel, FormAlert, LoginForm, PasswordRules, RecoverFlow y SessionGuard.
     - `(app)/layout.tsx` con SessionGuard y `(app)/page.tsx`, un inicio provisional hasta el Dashboard.
   - Modificados:
     - `lib/api/client.ts`: `endSessionAndRedirect`.
     - `errors.ts`: `ApiError.retryAfter`.
     - `types.ts`: alias de auth.
     - `providers.tsx`: `configureAuth` se registra al crear el QueryClient, para que la primera query ya lleve token.
     - `theme.css`: error en `.input-group` y títulos de sileo sin `capitalize`.
     - `schema.d.ts`, regenerado.
2. **Qué se probó contra el backend local.** Pruebas en Edge headless vía CDP, todas correctas:
   - **`proxy.ts`:** sin cookie, `307 /login?next=…`; con cookie deja pasar; `/login`, `/recuperar` y `/dev` son públicas.
   - **Login:**
     - 401 → "Correo o contraseña incorrectos.".
     - 403 `auth.userInactive`, probado desactivando `admin@example` un momento → su mensaje propio.
     - 429 tras 10 intentos por minuto.
     - Login correcto vuelve a `?next=`.
     - La cookie queda `SameSite=Lax`, Path=/, con vencimiento en `expiresAt`.
     - `/auth/me` y `/auth/me/permissions` salen con Bearer.
   - **Cierre de sesión:**
     - Al vencer, con el reloj del navegador adelantado, cierra a los ~4 s y conserva la ruta.
     - Un token inválido da 401 y vuelve al login.
     - "Cerrar sesión" borra la cookie.
   - **Recuperación completa:** correo → código leído en `logs/dev-mail/` → código incorrecto (400 con su mensaje) → código correcto → contraseña nueva → login con ella.
   - **Accesibilidad:** `aria-invalid` y `aria-describedby` verificados en correo, contraseña y confirmación (enlazados al error o a los chips). Botones deshabilitados mientras el formulario es inválido. Mostrar/ocultar contraseña con `aria-label` y `aria-controls`. El foco pasa al título en cada paso. Sin scroll horizontal a 390 px.
   - **Datos de prueba:** el hash de `admin@example` se respaldó antes y se restauró al terminar; `state` volvió a 1.
   - `pnpm typecheck` y `pnpm lint` en verde.
3. **Partes NO verificadas.**
   - `auth.userWithoutRole`: no hay usuarios sin rol.
   - El autocompletado del navegador con el botón deshabilitado: Chrome no expone la contraseña autocompletada hasta que el usuario interactúa, y el primer clic podría perderse.
   - El modo oscuro de estas pantallas.
   - Que `usePermissions` lo use alguna pantalla real (todavía no hay).
   - La sesión entre pestañas: cerrar sesión en una no avisa a las otras hasta su siguiente 401.
4. **Diferencias con el diseño.**
   - Sin "Te quedan N intentos" (§8).
   - La etiqueta del campo inválido se pone en danger (HeroUI); en la captura queda en tinta.
   - Se agregaron "Paso N de 3" y los pasos 1 y 2, que no tienen captura.
   - El login no aplica la regla de 8 a 16 caracteres: el backend acepta contraseñas heredadas más cortas.
   - El correo se valida con la regla de HTML5, no con la de Zod por defecto, que rechazaba `admin@example`.
5. **Cambios de contrato para el backend.** Exponer `Retry-After` en CORS (`Access-Control-Expose-Headers`). Hoy el navegador no lo puede leer y el 429 muestra "Espera un momento" en vez de los segundos.
6. **Dependencias.** Ninguna.
7. **Decisiones pendientes.**
   - Access token corto con refresh token en cookies: pospuesto. Requiere `/auth/refresh` (con rotación) y `/auth/logout` en el backend, y elegir quién pone las cookies (backend o Next como BFF).
   - Mientras tanto, la sesión dura lo que el token (1 día).
