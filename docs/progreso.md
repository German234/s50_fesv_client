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

## Shell · Layout autenticado, navegación, paleta y atajos · 2026-11-01

1. **Archivos creados y modificados.**
   - Shell (`components/shell/`):
     - `AppShell.tsx`: sidebar fija desde 1280 px y en Drawer por debajo; TopBar; "sin acceso" por ruta (`RouteAccessGate`); atajos ⌘K, ? y F; enlace "Saltar al contenido".
     - `Sidebar.tsx`: marca, menú del backend con un nivel de submenú (grupos plegables, abiertos si contienen la pantalla actual), ítem activo en surface con sombra y soporte de badges, todavía sin datos.
     - `SourceSwitcher.tsx` (Select de HeroUI), `ThemeToggle.tsx` (Claro/Oscuro segmentado) y `UserCard.tsx`.
     - `TopBar.tsx`: migas, campo que abre la paleta, `EnvironmentChip` (oculto, ver 5) y botón de atajos. `breadcrumbs.ts`.
     - `CommandPalette.tsx` (Modal, combobox propio con `aria-activedescendant`) y `ShortcutsSheet.tsx`.
     - `PendingScreen.tsx`: pantalla "en construcción" para las rutas del menú que aún no se conectan.
   - Menú (`features/menu/`): `icons.ts` (Material Icons → lucide, con fallback `CircleDot`), `routes.ts` (traducción `Route.path` ↔ ruta del frontend y claves de permiso por ubicación), `queries.ts` (`useNavigation`, `useAllowedSources`, `useRouteAccess`) e `index.ts`.
   - `lib/hooks/useShortcuts.ts`: registro central (`useShortcut`, `useShortcutListener`, `useRegisteredShortcuts`, `formatCombo`, `useIsMac`). No dispara con el foco en input, textarea, select o contenteditable, ni con un modal abierto, salvo que el atajo lo permita. `lib/hooks/useMediaQuery.ts`.
   - Páginas provisionales: `/emitidos`, `/clientes`, `/correlativos` (404 si `!supportsCorrelativesAdmin`), `/admin/{menus,rutas,permisos,usuarios}` y `/transmitir/[tipo]` (404 si la pestaña no existe en el país). `(app)/page.tsx` pasa a `PendingScreen`; su botón de cerrar sesión se movió a la tarjeta de usuario.
   - Modificados:
     - `(app)/layout.tsx`: SessionGuard + Suspense + AppShell.
     - `config/country.ts`: `sources` (`SourceText`, provisional, ver 5) y `findSource`.
     - `stores/useSourceStore.ts`: `useSourceUrlSync(isKnown)` descarta códigos desconocidos y agrega la fuente a las URLs que llegan sin ella; nuevos `useSource()` y `withSource()`.
     - `stores/useUiStore.ts`: `paletteOpen`, `shortcutsOpen` y `sourcePickerOpen`, sin persistir.
     - `features/auth/queries.ts`: `useSession` expone `isFetching` y `refetch`.
     - `components/fiscal/StateViews.tsx`: `ForbiddenState`.
     - `lib/format.ts`: `initials`.
     - `styles/theme.css`: `.segmented` (opción activa en surface con sombra) y `.shell-drawer`.
     - `lib/api/schema.d.ts`: regenerado; solo agrega los endpoints de Accesos.
     - `CLAUDE.md` §6: línea de stores.
2. **Qué se probó contra el backend local.** Backend en :5116 contra NEW_FESV (país DO). Edge headless vía CDP a 1440, 1280, 1100 y 390 px. Todas correctas:
   - **Datos de prueba:** se copiaron Menus (13), Submenus (23) y MenuRoutes (28) de FESV_TEST a NEW_FESV con los mismos ids, en una transacción. Se quedan: era una tarea pendiente del backend. Los hashes de `admin@example` (Admin) y `aebustillo@cipsa.com.sv` (Empleado CIPSA) se respaldaron, se cambiaron por una contraseña temporal y se restauraron al terminar; quedaron idénticos al respaldo y la contraseña temporal da 401.
   - **Dos roles, dos menús:** Admin ve Inicio, Configuraciones › Menús, Documentos, Clientes, 7 empresas con sus bandejas y Correlativos. Empleado CIPSA ve Inicio, Documentos, Clientes y CIPSA › 3 bandejas. Su selector de fuente ofrece solo "Todas" y CIPSA.
   - **Fuente:**
     - Elegir CIPSA › Facturas lleva a `/transmitir/facturas?fuente=CIPSA`.
     - Se conserva al ir por enlace a Documentos, al recargar y con `router.push('/clientes')` sin `?fuente=`, que la agrega.
     - `?fuente=XYZ` se quita y vale "Todas".
     - F abre el selector (también por debajo de 1280 px: abre el drawer y luego el selector) y elegir con teclado actualiza la URL.
     - Tras cerrar sesión e iniciarla por el formulario, `?next=` vuelve con la fuente.
   - **Paleta:** Ctrl+K la abre con el foco en el campo. El filtro sin acentos y Enter navegan. "Cambiar a …" cambia la fuente. "Buscar documento por código" aparece deshabilitado. F escrita dentro del campo no abre el selector.
   - **Hoja "?":** lista los atajos registrados más Esc; Esc la cierra.
   - **Migas:** Inicio; Transmitir › {pestaña}; Emitidos; Administración › {página}; Correlativos.
   - **403 sin cerrar sesión:**
     - Empleado CIPSA en `/admin/rutas`, en `/correlativos` y en `/transmitir/facturas?fuente=SIAT` ve "Sin acceso" con su rol; la cookie sigue y `/auth/me` responde 200.
     - El backend responde 403 `auth.forbidden` a `GET /routes` con el mismo token.
     - `/transmitir/facturas` con "Todas" o con CIPSA sí entra.
   - **Responsive:**
     - A 1100 px la sidebar se oculta y aparece el botón de menú; el drawer se cierra al navegar (3 de 3 veces).
     - Sin scroll horizontal a 390 px.
     - A 1280 px la sidebar queda fija.
   - **Tema:** claro y oscuro por el selector, con capturas de Transmitir, la paleta y "sin acceso".
   - **Cerrar sesión:** borra la cookie y queda en `/login`. Antes quedaba en `/login?next=…`: las consultas de permisos sin condición se repetían sin token y el 401 redirigía; ahora dependen de la sesión.
   - `pnpm typecheck` y `pnpm lint` en verde. Sin errores de consola en las pruebas.
3. **Partes NO verificadas.**
   - País SV (la base local es DO): `subtitle` SV, la traducción `se` → sujeto-excluido y que Correlativos se oculte. La lógica es la misma, pero no se ejecutó.
   - Safari y Mac: el texto "⌘" y `metaKey`. Solo se probó Ctrl.
   - Lector de pantalla real en la paleta: el patrón combobox + `aria-activedescendant` solo se revisó en el DOM.
   - El "Reintentar" del menú cuando `/auth/me` falla con 5xx (no se provocó).
   - Si las 7 fuentes del diccionario son las correctas para DO: la legacy es una sola lista.
   - Una URL escrita a mano sin `?fuente=` vale "Todas" (la URL manda; no hay localStorage).
4. **Diferencias con el diseño.**
   - El menú es el del backend tal cual, agrupado por empresa (CIPSA › Facturas y CCFs…) con los nombres de la base ("Documentos", "Configuraciones"). El diseño muestra un menú plano: Transmitir, Emitidos, Clientes, Administración › Menús, Rutas, Permisos por rol. Por eso tampoco hay un ítem "Transmitir" con badge.
   - Los grupos con submenús son plegables (en la captura, "Administración" es una etiqueta fija): con 7 empresas el menú de Admin no cabe abierto.
   - Admin tiene permiso sobre `settings/routes`, `settings/permissions` y `settings/users`, pero la base no tiene entradas de menú para ellas: solo aparece "Menús". Esas pantallas solo se abren escribiendo la URL, porque la paleta también sale del menú.
   - Sin chip de ambiente (ver 5).
   - "Inicio" lo agrega el frontend: no es una ruta con permisos en el backend.
   - El avatar del usuario no lleva el check azul de la captura.
   - "Fuente" lleva un Kbd "F" que la captura no muestra.
   - El Kbd del buscador dice "Ctrl K" fuera de Mac.
   - Las migas no tienen el nivel "Operación" de la captura de la TopBar: no existe en el menú.
   - El aviso de React Aria "PressResponder was rendered without a pressable child" sale en desarrollo por cada `<Modal>` y `<Drawer>` controlado sin trigger. Es propio de la API de HeroUI v3 (la raíz es un DialogTrigger y aporta los slots de estilo), igual que en `CriticalConfirm`.
5. **Cambios de contrato para el backend.**
   - **Menú con rutas del frontend:** `menu[].path` trae claves de permiso (`documents`, `cipsa/fc_ccf`, `settings/menu-management`), y el menú legacy repite las bandejas por empresa. El frontend las traduce en `features/menu/routes.ts`; lo que no reconoce se muestra deshabilitado. Propuesta: separar "pantalla" (`/transmitir/facturas`, `/emitidos`, `/admin/menus`) de "clave de permiso", y un menú plano donde la empresa sea la fuente global. Otra opción: que `/auth/me` devuelva ya la ruta del frontend.
   - **Entradas de menú para Rutas, Permisos por rol y Usuarios** en la base, o en el seed `docs/db/seed-admin-routes.sql`.
   - **Ambiente:** exponer el ambiente de la autoridad (producción o pruebas) en `GET /meta/country`, por ejemplo `environment: "production" | "test"`, para el chip de la TopBar. Hoy no está en ningún endpoint.
   - **Fuentes:** `GET /catalogs/billers` (etapa 6). Mientras tanto, el diccionario copia `RouteKeys.SourcePrefixes`. NEW_FESV no tiene filas en Billers.
6. **Dependencias.** Ninguna.
7. **Decisiones pendientes.**
   - Si el menú se queda por empresa o pasa a plano (depende del punto 5); lo que se decida cambia `Sidebar` y la paleta.
   - Si la fuente debe recordarse en localStorage para las URLs escritas a mano.
   - Badges: `NavItem` acepta `badge`, pero hoy no hay a qué colgarlo (no existe el ítem "Transmitir"). Se resuelve junto con el menú.
   - Las páginas provisionales se reemplazan en las etapas de bandeja, emitidos, clientes, correlativos y administración. `/clientes/nuevo`, `/clientes/[id]` y `/transmitir/lotes/[id]` todavía dan 404 fuera del shell.
