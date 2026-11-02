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

### Revisión

- 2026-11-02: las casillas de selección de `DataTable` no tenían `Checkbox.Content`. En HeroUI 3.2 el `<input>` vive ahí; sin él eran decorativas (sin `<input>`, sin foco ni Espacio) y la selección solo funcionaba por la fila. Se envolvieron la de "seleccionar todos" y la de cada fila. Probado en `/dev/componentes` (Edge headless vía CDP):
  - Las 25 casillas de la página y la del encabezado tienen `<input>`, con su nombre accesible ("Seleccionar CCF-004502"; en las bloqueadas, "CCF-004512: no se puede seleccionar").
  - Clic: selecciona.
  - Foco con teclado y Espacio: alterna.
  - Fila bloqueada: la casilla está deshabilitada y no cambia la selección; el clic abre el detalle, como antes.
  - "Seleccionar todos": de indeterminado pasa a los 22 seleccionables; otro clic los quita; con Espacio vuelve a seleccionarlos.
  - Sin errores de consola. `pnpm typecheck` y `pnpm lint` en verde.

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

### Revisión

- 2026-11-02: se quitó la recuperación de contraseña. Solo habrá usuarios específicos; el administrador cambia la contraseña desde Administración › Usuarios.
  - Borrados: `(auth)/recuperar/page.tsx`, `RecoverFlow.tsx` y `PasswordRules.tsx`.
  - En `features/auth`: las funciones de `password-reset` (`api.ts`), sus mutaciones (`queries.ts`), sus esquemas (`schemas.ts`) y el código `auth.resetCodeInvalid` (`errors.ts`). `schemas.ts` conserva `PASSWORD_MIN`, `PASSWORD_MAX` y `passwordLengthOk`, que usa Usuarios.
  - Quitados también: los alias `PasswordReset*` de `lib/api/types.ts`; el enlace "¿La olvidaste?" del login y la prop `labelAction` de `AuthField`; `/recuperar` de `PUBLIC_PATHS` y del matcher de `proxy.ts`.
  - `CLAUDE.md`: la captura "Cambiar contraseña" sale de §3, `(auth)/recuperar` sale de §6 y §8 explica que no hay recuperación.
  - Los endpoints `/auth/password-reset/*` siguen en el backend; ver el bloque Administración, punto 5.

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

## Administración · Usuarios, menús, rutas y permisos por rol · 2026-11-02

1. **Archivos creados y modificados.**
   - Creados:
     - `app/(app)/admin/layout.tsx`: título, subtítulo y segmentado de navegación Usuarios / Menús / Rutas / Permisos por rol.
     - `features/admin/api.ts`: funciones tipadas con `schema.d.ts` para usuarios, roles y matriz, rutas, menús y submenús.
     - `features/admin/queries.ts`: `adminKeys`, hooks y mutaciones. Guardar menús, orden o permisos invalida `/auth/me` y `/auth/me/permissions`.
     - `features/admin/schemas.ts`: Zod con las reglas copiadas de los contratos del backend y los filtros de URL.
     - `features/admin/errors.ts`: el 409 de correo y de path, el 422 de referencias y los `errors` del 400 van a su campo, con foco.
     - `features/admin/menuOrder.ts` (orden local, reconciliación y conteo de movidos) y `features/admin/text.ts` (búsqueda sin acentos).
     - En `features/admin/components/`:
       - las pantallas `UsersScreen`, `RoutesScreen`, `MenusScreen` y `PermissionsScreen`;
       - `IconPicker` y `FormIconField`;
       - `SearchInput`, con debounce de 300 ms y "/";
       - `FormModal`;
       - `fields`, con texto, select y switch controlados por react-hook-form;
       - `shared`: AdminHeader, AdminAccessGate, StateChip, StateSwitch, UnsavedBar y QueryErrorState.
   - Modificados:
     - Las cuatro páginas de `admin/*`, que dejan `PendingScreen` por su pantalla.
     - `features/menu/icons.ts`: unos 40 íconos Material más, `MATERIAL_ICON_NAMES` y `hasMenuIcon`.
     - `features/menu/index.ts` y `package.json`.
2. **Qué se probó contra el backend local.** Backend en :5116 contra NEW_FESV (DO). Edge headless vía CDP a 1440 px, con eventos reales de puntero y teclado. Todas correctas:
   - **Datos de prueba** (quedan en la base, con autorización):
     - `qa.admin@example` (rol Admin), creado por SQL para entrar.
     - `qa.consulta@example` (rol Empleado CIPSA), creado desde la pantalla.
     - La ruta "Ruta QA editada" (`qa/ruta-prueba`), inactiva.
   - **Usuarios:**
     - La búsqueda en servidor hace una sola llamada por término (`Search=cipsa`, 3 filas).
     - El filtro Inactivos llama con `State=inactive` y muestra "Sin resultados" con "Buscar sin filtros".
     - Guardar vacío marca los 6 campos con su mensaje; una contraseña de 5 caracteres dice "Usa de 8 a 16 caracteres.".
     - Un correo repetido (`ADMIN@example`) da 409 y el mensaje queda en el campo Correo, con foco.
     - Alta 201.
     - La edición precarga los datos y envía `password: null` si la contraseña queda vacía (200).
     - El switch envía PATCH `inactive` y luego `active`, y cambia el chip.
     - El switch del usuario propio está deshabilitado, con "No puedes desactivarte a ti mismo" enlazado por `aria-describedby`.
   - **Rutas:**
     - "/" enfoca la búsqueda, que es local, sin acentos y queda en `?q=`.
     - Zod rechaza un path inválido.
     - `documents` repetido da 409 en el campo Dirección.
     - Alta 201, edición 200 y PATCH `inactive` con chip "Inactiva".
   - **Permisos (rol Gerente, 0 usuarios):**
     - Cada cambio suma en la barra "N cambios sin guardar"; la fila se resalta; si se revierte a mano, la barra desaparece.
     - Cambiar de rol con cambios pendientes se bloquea con un toast.
     - Descartar restaura la matriz.
     - "Asignar ruta" agrega la fila con Leer marcado.
     - Guardar envía las 29 rutas activas (igual al GET), responde 200 y refresca `/auth/me` y `/auth/me/permissions`.
     - Gerente quedó como estaba: CRUD en las rutas tocadas.
   - **Menús:**
     - Alt+↓ y Alt+↑ funcionan en menús y submenús; el foco sigue a la fila y se anuncia "Documentos: posición 3 de 13.".
     - Los botones subir y bajar funcionan.
     - Arrastrar con el asa (dnd-kit) pone Clientes sobre Documentos.
     - "Guardar orden": PUT `/menus/order` responde 200 y la sidebar muestra el nuevo orden tras el refetch de `/auth/me`. Es el criterio de aceptación.
     - Después se restauró el orden original y la tabla Menus quedó idéntica a la inicial (orden e íconos).
     - Editor: cambiar el ícono con el selector y guardar (PUT 200, `icon: "group"`), y revertir.
     - "Nuevo menú" vacío marca nombre, ícono y ruta sin enviar nada.
     - El modal de submenú precarga nombre y ruta.
   - **Sin acceso:** `qa.consulta` (Empleado CIPSA) ve "Sin acceso" con su rol en las cuatro pantallas. No se llama a ningún endpoint de administración y la sesión sigue abierta.
   - `pnpm api:types` (desde el backend levantado, sin diferencias), `pnpm typecheck` y `pnpm lint` en verde. Sin errores de consola, salvo el aviso de HeroUI "PressResponder…" de los modales controlados, ya registrado en Shell.
3. **Partes NO verificadas.**
   - Modo oscuro, 390 px y lector de pantalla real.
   - País SV.
   - Arrastrar en pantallas táctiles: el asa usa `touch-none` y PointerSensor, pero no se probó en un dispositivo.
   - El 422 `menus.orderMismatch` y el 422 `permissions.matrixMismatch` (guardados concurrentes).
   - Crear un menú o un submenú: solo se probó la validación, para no dejar menús de prueba en la base.
   - Un rol con acceso a Usuarios pero no a Permisos por rol (el select de rol deshabilitado con su motivo).
4. **Diferencias con el diseño.**
   - Rutas no tiene la columna "Creada", porque el contrato no trae la fecha (ver 5).
   - La barra de permisos dice "se aplican en cuanto guardes" en lugar de "al próximo inicio de sesión": el backend los aplica de inmediato.
   - Usuarios no tiene captura:
     - Además de nombre, correo, rol y contraseña, el formulario pide Apellido y DUI, que el backend exige.
     - Columnas: Usuario, DUI, Rol, Estado, Creado, Activo y editar.
   - Menús:
     - Switch "Menú activo".
     - Los submenús se crean y editan en un modal.
     - El orden se guarda con su propia barra "Guardar orden".
     - Cada fila tiene botones subir y bajar.
     - Con teclado se reordena con Alt+↑/↓; el asa es solo para el puntero.
   - Un submenú se reordena dentro de su menú; para cambiarlo de menú hay que editarlo.
   - "Asignar ruta" es un select con las rutas que el rol no tiene asignadas.
   - Las filas de la matriz muestran solo las rutas asignadas, más las editadas.
   - Sin borrar menús, submenús ni usuarios: la tarea no lo pedía.
5. **Cambios de contrato para el backend.**
   - `createdAt` en `RouteAdminResponse`: la columna `Routes.createdAt` existe.
   - El select de rol de Usuarios depende de `GET /roles`, que exige `settings/permissions`. El editor de menús depende de `GET /routes`, que exige `settings/routes`. Hacen falta catálogos accesibles con `settings/users` y con `settings/menu-management`. Mientras tanto, el campo se deshabilita con el motivo.
   - Con la recuperación fuera del frontend, los endpoints `/auth/password-reset/*` y la tabla ResetPasswords podrían retirarse del backend.
6. **Dependencias.** `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0 y `@dnd-kit/utilities` 3.2.2, aprobadas.
7. **Decisiones pendientes.**
   - Si cambiar de rol desde la URL (atrás/adelante o editando `?rol=`) con cambios sin guardar debe pedir confirmación. Hoy los descarta.
   - Hallazgos de este bloque que aplican al resto:
     - En HeroUI 3 el `<input>` del Checkbox vive en `Checkbox.Content` (también corregido en `DataTable`; ver la Revisión de Datos).
     - Con `mode: "onTouched"`, el error que aparece al salir de un campo puede mover el botón Guardar y perder el click. Los formularios de administración validan al guardar (`onSubmit` + `reValidateMode: "onChange"`).
