# CLAUDE.md · s50_fesv_client

Frontend nuevo de la Plataforma de Facturación Electrónica SV/DO. Reemplaza al frontend legacy y consume el backend .NET nuevo.

Responde y documenta en español. Trabaja un bloque a la vez y detente al final de cada uno con el resumen de §11.

## Integración (prevalece sobre el resto de este archivo y sobre cualquier prompt)

- No hay mocks. Todo se consume del backend local (`NEXT_PUBLIC_API_URL`).
- Los tipos de la API salen de `src/lib/api/schema.d.ts`, generado con `pnpm api:types` desde el OpenAPI del backend. No se escriben a mano tipos de requests ni de responses.
- Si un endpoint necesario no existe o no tiene la forma necesaria, NO se simula: se detiene el trabajo y se describe el cambio que hay que pedirle al backend.
- Los errores llegan como ProblemDetails y el cliente axios los normaliza a `{ code, message, details }`. El 403 muestra "sin acceso"; solo el 401 cierra la sesión.

## §1 · Workspace

Todo lo que está fuera de este repo es de SOLO LECTURA.

| Carpeta (hermana de este repo) | Qué es |
| --- | --- |
| `../s50_fesv_client` | Este repo: frontend nuevo (Next.js) |
| `../s50_fesv_backend` | Backend nuevo (.NET). Contrato en `docs/contrato.md` y `docs/api/openapi.json` |
| `../new_design` | Capturas del diseño (ver §3) |
| `../s50_fesv_frontend` | Frontend legacy: referencia funcional, no de diseño |
| `../s50_fesv_api` | API legacy (Express): referencia funcional |

Reglas:
- La funcionalidad sale del legacy y del contrato del backend; el aspecto sale de `../new_design`. No copies código ni estilos del frontend legacy.
- No instales dependencias fuera de §2 sin pedir aprobación primero.
- Si algo de este archivo contradice la API real de una librería, verifica en su documentación o en `node_modules`, sigue la API real y repórtalo en el resumen.

## §2 · Stack y dependencias

- Next.js 16.3.6 con App Router, TypeScript estricto, carpeta `src/`, ESLint, pnpm.
- `@heroui/react` + `@heroui/styles` (HeroUI v3, 3.2): componentes y tema. No asumas la API de HeroUI v2/NextUI.
- Tailwind CSS v4.
- `react-hook-form` + `zod` (v4) + `@hookform/resolvers`: formularios y validación.
- `@tanstack/react-query`: datos y caché.
- `axios`: cliente HTTP.
- `zustand`: fuente activa, selección y UI.
- `@internationalized/date`: DateRangePicker y DateField (`CalendarDate`).
- `next-themes`: tema claro/oscuro.
- `lucide-react`: íconos.
- `sileo`: toasts.
- Dev: `openapi-typescript` (tipos de la API). `vitest` si hace falta un runner, previa aprobación.
- Con aprobación previa, solo si HeroUI v3 no lo cubre: `@tanstack/react-table` (tabla), `@dnd-kit/core` (reordenar menús).

Fuentes: Inter (texto) y JetBrains Mono (códigos y montos) con `next/font`.

## §3 · Diseño

Las capturas están en `../new_design/`. Cada pantalla se compara contra su captura en claro; el modo oscuro sale de los tokens de §4.

| Captura | Uso |
| --- | --- |
| `B01 · Fundamentos HeroUI.png` | Tokens, chips de estado, tipografía, radios, botones |
| `B02 · Componentes HeroUI.png` | Mapa y estados de los componentes de §7 |
| `B03 · Estados y toasts (Sileo).png` | Vacío, carga, error, toasts, errores en línea y bloqueos |
| `B · Navegación lateral.png` | Sidebar |
| `B · Barra superior.png` | TopBar |
| `B · Login.png` | Login |
| `B · Dashboard SV.png` / `B · Dashboard RD.png` | Inicio |
| `B · Transmitir (interactiva).png` | Bandeja SV |
| `B · Transmitir RD.png` | Bandeja DO con selección |
| `B · Transmitir · selección.png` | Selección + BulkActionBar |
| `B · Detalle (Drawer).png` | DocumentSheet |
| `B · Transmitir · confirmación.png` | CriticalConfirm nivel 1 |
| `B · Transmitir · enviando.png` | Progreso del envío |
| `B · Resultados.png` | Resultado del lote |
| `B · Emitidos.png` | Emitidos |
| `B · Emitidos · acciones.png` | Menú de acciones |
| `B · Emitidos · invalidación.png` | CriticalConfirm nivel 2 |
| `B · Clientes.png` / `B · Cliente · formulario.png` | Clientes |
| `B · Correlativos (RD).png` | Correlativos |
| `B · Admin · menús.png` / `B · Admin · rutas.png` / `B · Admin · permisos.png` | Administración de accesos |

Lema del diseño: "Suave en la forma, estricto en el dato". Superficies blancas flotando sobre un gris claro, campos rellenos sin borde, botones píldora y chips suaves; datos en mono con cifras tabulares.

## §4 · Tokens y estilo

Variables de HeroUI, sobrescritas en `src/styles/theme.css`:

| Variable | Claro | Oscuro |
| --- | --- | --- |
| `--background` | `#F5F5F6` | `#0F0F12` |
| `--surface` | `#FFFFFF` | `#1B1B20` |
| `--surface-secondary` | `#F4F4F5` | `#232329` |
| `--default` | `#EBEBEE` | `#2A2A31` |
| `--border` | `#E4E4E7` | `#2E2E35` |
| `--foreground` | `#18181B` | `#FAFAFA` |
| `--muted` | `#71717A` | `#A1A1AA` |
| `--accent` | `#0369D9` | `#4C9DFF` |
| `--accent-soft` | `#E6F1FE` | `#0F2747` |
| `--success` | `#17803D` | `#4ADE80` |
| `--warning` | `#A35B00` | `#FBBF24` |
| `--danger` | `#D92D20` | `#F87171` |

El accent por defecto de HeroUI (≈ `#2E86F5`) no cumple AA con texto blanco; se usa `#0369D9` (5.1:1).

Chips de estado del documento (`<Chip variant="soft">` + ícono lucide). Texto / fondo en claro:

| Estado | Color | Claro | Oscuro | Ícono |
| --- | --- | --- | --- | --- |
| Aceptado | success | `#146C36` / `#E8F7EE` | soft oscuro | `CircleCheck` |
| Pendiente | warning | `#8A4D00` / `#FFF4DB` | soft oscuro | `Clock` |
| En proceso | accent | `#005BB8` / `#E6F1FE` | soft oscuro | `RotateCw` |
| Rechazado | default · solid | `#FFFFFF` / `#27272A` | gris claro | `CircleX` |
| Invalidado | danger | `#B42318` / `#FEECEB` | soft oscuro | `Ban` |

Rechazado es el único chip sólido y oscuro, para que destaque.

Tipografía (tamaño/interlineado · peso):

| Rol | Medida | Uso |
| --- | --- | --- |
| Display | 30/36 · 700 | Título de página |
| Title | 20/28 · 600 | Títulos de sección grandes |
| Heading | 15/22 · 600 | Títulos de tarjeta y campos destacados |
| Body | 14/20 · 400 | Texto general |
| Small | 13/18 · 400 | Celdas de tabla y descripciones |
| Mono 13 · tnum | JetBrains Mono | Montos |
| Mono 12 | JetBrains Mono | Códigos (referencias, Nº de control, UUID) |

Radios: kbd 6 · campo 12 · tarjeta 20 · modal 24 · botón píldora (full).

Profundidad: `surface` (tarjetas), `overlay` (popover y menús), `modal` (drawer y modales). Sin bordes en tarjetas: la separación la da el contraste surface/background. Los bordes quedan para separadores de tabla (1 px) y para el foco.

Botones (`<Button variant>`): `primary` (accent), `secondary` (gris default), `tertiary` (accent-soft con texto accent), `ghost`, `danger-soft`, `danger`, y la variante propia `fiscal`: tinta (`--foreground` de fondo, texto inverso) con ícono `ShieldCheck`. La acción fiscal (Transmitir, Entrar) usa `fiscal`, nunca el accent.

Campos: rellenos (fondo `--default` o `--surface-secondary`), sin borde. Foco: borde accent de 2 px. Error: fondo danger-soft, borde danger y mensaje en danger debajo del campo.

Montos con `Money`: siempre mono, tabular, alineados a la derecha; ceros en `--muted`; negativos con signo.

## §5 · País

`NEXT_PUBLIC_PAIS` = `SV` o `DO` (República Dominicana se identifica como `DO`, igual que en el backend; las capturas conservan "RD" en el nombre). Al arrancar se valida contra `GET /api/v1/meta/country`; si no coincide, pantalla de error completa con ambos valores. Los textos salen del diccionario local de `src/config/country.ts`; las capacidades (pestañas de bandeja, `supportsInvalidation`, `supportsCorrelativesAdmin`) salen del backend.

| Clave | SV | DO |
| --- | --- | --- |
| `subtitle` (sidebar) | SV · Hacienda | DO · DGII |
| `authority` | MH | DGII |
| `authorityFull` | Hacienda (MH) | la DGII |
| `authorityOrg` (dashboard) | Ministerio de Hacienda | DGII |
| `docName` | DTE | e-CF |
| `controlLabel` | Nº de control | e-NCF |
| `tax` | IVA 13 % | ITBIS 18 % |
| `currency` | USD (`$`) | DOP (`RD$`) |
| `emissionHint` | se estampa en el DTE | se estampa en el e-CF |
| `fileFormat` | JSON | XML |

Pestañas de Transmitir y slug de ruta ↔ tipo de la API:

| País | Pestaña | Slug | Tipo API |
| --- | --- | --- | --- |
| SV | 01·03 Facturas y créditos fiscales | `facturas` | `fce` |
| SV | 05 Notas de crédito | `notas-credito` | `nc` |
| SV | 14 Sujeto excluido | `sujeto-excluido` | `se` |
| DO | 31·32 Facturas y créditos fiscales | `facturas` | `fce` |
| DO | 34 Notas de crédito | `notas-credito` | `nc` |
| DO | 41 Compras | `compras` | `ce` |
| DO | 43 Gastos menores | `gastos-menores` | `gm` |

Tipos de documento fiscal para `DocTypeChip`: SV 01 Factura, 03 Crédito fiscal, 05 Nota de crédito, 11 Exportación, 14 Sujeto excluido. DO 31 Crédito fiscal, 32 Consumo, 34 Nota de crédito, 41 Compras, 43 Gastos menores.

Documentos de identidad: SV NIT, DUI, NRC. DO RNC (9 dígitos), cédula (11). Las expresiones regulares se copian literalmente de `../s50_fesv_backend/docs/contrato.md`.

## §6 · Estructura y datos

```
src/
  app/
    (auth)/login
    (app)/layout.tsx                 → shell
    (app)/page.tsx                   → dashboard
    (app)/transmitir/[tipo]/page.tsx
    (app)/transmitir/lotes/[id]/page.tsx
    (app)/emitidos/page.tsx
    (app)/clientes/page.tsx, nuevo/, [id]/
    (app)/correlativos/page.tsx      → solo si supportsCorrelativesAdmin
    (app)/admin/usuarios|menus|rutas|permisos
    dev/                             → páginas de prueba, solo en desarrollo
    providers.tsx
  components/
    fiscal/                          → componentes de §7
    shell/                           → Sidebar, TopBar, CommandPalette
  features/<dominio>/
    api.ts                           → funciones tipadas con schema.d.ts
    queries.ts                       → hooks de React Query
    components/                      → piezas propias de la pantalla
    schemas.ts                       → esquemas Zod
  lib/
    api/client.ts, schema.d.ts, types.ts
    hooks/useUrlFilters.ts, useShortcuts.ts
    format.ts, toast.ts
  stores/                            → useSourceStore, useSelectionStore, useUiStore
  config/country.ts
  styles/theme.css
```

Dominios: `auth`, `meta`, `menu`, `admin`, `catalogs`, `customers`, `sequences`, `inbox`, `transmit`, `issued`, `dashboard`.

Datos:
- Las query keys salen de una factory e incluyen país, fuente y filtros.
- Las mutaciones de transmisión llevan `retry: 0` y el botón se deshabilita mientras corren.
- Los filtros de cada pantalla viven en la URL (`useUrlFilters`, validados con Zod), para que sobrevivan a una recarga y se puedan compartir.
- La fuente activa vive en `useSourceStore`, sincronizada con `?fuente=`. "Todas" = `source=all`.
- Las rutas del menú vienen del backend (`Route.path`); las páginas deben existir en esas mismas rutas.

### Capa de datos (convención)

- **Tipos:** `pnpm api:types` genera `lib/api/schema.d.ts`. `lib/api/types.ts` solo da alias (`ProblemDetails`, `DevErrorKind`…) y utilidades sobre `paths` (`PathParams`, `QueryParams`, `JsonBody`, `JsonResponse`). Si el contrato cambia, se regenera; nunca se edita a mano.
- **Cliente:** todo pasa por `apiClient` (`lib/api/client.ts`). Rechaza siempre con `ApiError { code, message, status, details, traceId }` (`lib/api/errors.ts`): `code` ← `code`, `message` ← `detail ?? title`, `details` ← `errors`. Los códigos son los del contrato del backend (`PROBLEM_CODES`: `validation.failed`, `auth.unauthenticated`, `auth.forbidden`, `http.notFound`, `server.unexpected`); el frontend no los renombra y, si falta el cuerpo, usa el mismo código por defecto por status que el backend. Solo `network` y `unknown` son propios del frontend. 403 (`isForbidden`) → "sin acceso" sin tocar la sesión; 401 → `clearSession()` y `/login?next=…` (salvo `skipAuthRedirect: true`); sin respuesta → `code: "network"`. Las cancelaciones se propagan sin normalizar.
- **Sesión:** `configureAuth({ getToken, clearSession })` es el punto de extensión; la etapa 3 lo conecta al store de sesión.
- **Por dominio:** `features/<dominio>/api.ts` exporta funciones async que reciben `signal` y devuelven tipos de `schema.d.ts` (rutas con `buildPath` + `PathParams`). `features/<dominio>/queries.ts` define `const <dominio>Keys = createQueryKeys("<dominio>")` y los hooks `useX` / `useXMutation`. Las pantallas solo importan de `queries.ts`. El dominio se crea en la etapa que lo conecta; `features/dev` es el ejemplo.
- **Query keys:** `createQueryKeys` (`lib/api/queryKeys.ts`) → `[país, dominio, "list"|"detail", recurso, …, { source, ...filtros }]`. Invalidar `keys.all` alcanza todo el dominio.
- **Reintentos:** las queries reintentan hasta 2 veces solo ante red o 5xx. Las mutaciones nunca (`retry: 0` global); en las de transmisión se declara también explícitamente, y el botón se deshabilita con `isPending`.
- **Stores:** `useSourceStore` + `useSourceUrlSync(isKnown)` (fuente ↔ `?fuente=`, la URL manda; se monta una sola vez, en AppShell, y agrega la fuente activa a las URLs que llegan sin ella) + `useSource()` para leerla o cambiarla desde cualquier componente; `withSource(href, fuente)` para enlaces; `useSelectionStore` con `selectionScope(bandeja, tipo, fuente)`; `useUiStore` (densidad y sidebar, persistido en localStorage).
- **Filtros:** `useUrlFilters(esquemaZod)` lee y escribe la URL con `router.replace`; un parámetro inválido se descarta y vale su default. Listas con `csv(...)`. Los componentes que lo usan van dentro de `<Suspense>`.

## §7 · Componentes fiscales (`components/fiscal/`)

Cada uno envuelve primitivos de HeroUI. Si HeroUI v3 no trae alguno (Table, Drawer, Pagination), se arma con el mismo lenguaje visual: TanStack Table para la tabla y Modal anclado a la derecha para el drawer.

| Componente | Primitivos | Notas |
| --- | --- | --- |
| `AppShell` | Avatar, Tabs, Switch, Kbd | Sidebar dinámica (menú del backend) + TopBar; tema con next-themes |
| `SourceSwitcher` | Select o Dropdown, zustand | Fuente global en el store y en `?fuente=` |
| `CommandPalette` | Modal, Input, Kbd | ⌘K: navegar, buscar documento por código, cambiar de fuente |
| `StatusChip` / `DocTypeChip` | Chip soft | 5 estados con ícono (§4). DocTypeChip "03 Crédito fiscal"; variante "revisar" en warning con ícono de alerta |
| `CopyCode` | Button sm, Tooltip | Truncado al centro (`truncateMiddle`), valor completo en tooltip y aria-label; estados reposo, foco y "Copiado" |
| `Money` | span tabular-nums | `Intl.NumberFormat`; la moneda va en la cabecera de la columna |
| `DataTable` | Table, Checkbox, Pagination | Orden, selección, filas bloqueadas con motivo, densidad; fluida con más de 100 filas |
| `FilterBar` / `FilterChip` | DateRangePicker, DateField, Chip onClose | Fechas con `@internationalized/date`; reglas cruzadas en Zod |
| `BulkActionBar` | Button, Kbd | Píldora oscura flotante abajo al centro; solo aparece con selección |
| `DocumentSheet` | Drawer o Modal a la derecha | Panel flotante con 12 px de margen; la lista queda visible detrás; J/K para navegar |
| `CriticalConfirm` | Modal, Alert, Checkbox, Input | Nivel 1: casilla obligatoria. Nivel 2 (destructivo): escribir dígitos para habilitar |
| `EmptyState` / `ErrorState` | — | Ícono en cuadro suave, título, explicación y acciones (B03) |
| `TableSkeleton` | Skeleton | Solo en la tabla; los filtros siguen disponibles |
| Toasts | sileo | A través de `lib/toast.ts` |

Estados de fila en DataTable: reposo; hover (`--surface-secondary`); seleccionada (fondo accent-soft y borde accent); bloqueada (checkbox deshabilitado y motivo en danger bajo el cliente, con enlace de acción si aplica).

Estados (B03):
- Vacío: dice qué no hay y en qué rango, con acciones ("Cambiar rango", "Ver emitidos").
- Sin resultados: dice qué filtros están activos, con "Buscar sin filtros".
- Error de fuente: "No pudimos leer Sage 50 de {fuente}", aclara que las demás fuentes no se ven afectadas, "Detalle técnico" plegable, "Reintentar" y "Cambiar fuente".
- Carga: "Leyendo documentos de Sage 50 · {fuente}…" con skeleton solo en la tabla.

Toasts (Sileo, arriba al centro, píldora que se expande):
- Progreso: "Transmitiendo 6 DTE…" con `toast.promise`.
- Éxito breve: "Guardado en ERP", "Código copiado".
- Parcial: "Guardado en ERP: 13 de 14" en warning.
- Error persistente (sin duración) con explicación y acciones "Reintentar" / "Cerrar".
- Resultado del lote, oscuro: "5 de 6 DTE aceptados por MH · 1 rechazado. Lote TX-0142 registrado." con "Ver resultados".

Errores en línea y bloqueos:
- Error de campo en danger debajo del campo ("La fecha inicial no puede ser mayor que la final").
- Advertencia en Alert warning ("La fecha de emisión es posterior a hoy…").
- Bloqueo por rol en Alert neutro con candado: "Tu rol (Consulta) no puede transmitir. Pide acceso a un administrador."

## §8 · Pantallas

Nota: el guardado en ERP también aplica a DO y el diseño DO lo muestra, pero por ahora se mantiene solo en SV, igual que en producción. En DO se ocultan la tarjeta "Aceptados sin guardar en ERP", la tarjeta "Sincronización con Sage 50" y la acción "Guardar en ERP". Se habilitará más adelante.

### Shell
- Sidebar (256 px): logo + "Facturación" + `subtitle` del país; `SourceSwitcher` ("Fuente" + nombre, avatar con iniciales); menú del backend con íconos; grupo "Administración"; badge accent en Transmitir (pendientes) y badge oscuro en Emitidos (rechazados); abajo, selector Claro/Oscuro segmentado y tarjeta de usuario (iniciales, nombre, rol, cerrar sesión).
- TopBar: breadcrumb; campo "Buscar documento, cliente o ir a…" con ⌘K; chip de ambiente (punto verde "Producción"; en pruebas, warning); botón de teclado que abre la hoja de atajos.
- Por debajo de 1280 px la sidebar pasa a drawer.

### Login
Pantalla dividida.
- Izquierda: logo "Facturación electrónica"; tarjeta "Bienvenida de nuevo" / "Ingresa con tu correo corporativo."; Correo; Contraseña con botón mostrar/ocultar; errores en Alert danger dentro de la tarjeta; botón "Entrar" (fiscal, ancho completo); pie "¿Problemas para entrar? Contacta al administrador del sistema."
- Derecha: panel oscuro decorativo (`aria-hidden`) con una lista de números de control y su estado, y el texto "Cada documento, transmitido una vez y con certeza." / "De Sage 50 a Hacienda o la DGII: revisa, firma, transmite y conserva la respuesta de cada comprobante."
- El error de credenciales es genérico: "Correo o contraseña incorrectos." Sin contador de intentos, aunque la captura lo muestre.

### Recuperación de contraseña
No hay recuperación por el usuario: solo existen usuarios específicos, y un administrador cambia la contraseña desde Administración › Usuarios. No se usan la captura "Cambiar contraseña" ni los endpoints `/auth/password-reset/*`.

### Dashboard (`/`)
- "Buenas tardes, {nombre}" según la hora; debajo, periodo · fuentes · `authorityOrg`. Selector segmentado Hoy / 7 días / Este mes / Personalizado.
- Tarjetas "Requiere atención", cada una con CTA a la vista filtrada:
  - Pendientes de transmitir: tarjeta oscura, número grande, desglose por fuente, botón "Transmitir pendientes". Se carga aparte (`/dashboard/pending`) con su propio skeleton.
  - Rechazados por {authority}: total y "N en las últimas 24 h", "Revisar rechazados →".
  - Aceptados sin guardar en ERP: "Sin referencia fiscal en Sage 50", "Guardar en ERP →". Por ahora solo SV (ver nota de §8).
  - Solo DO: Correlativos por agotarse, "Menos del 10 % disponible", "Ver correlativos →".
- Emitidos por estado: barra apilada y 5 tarjetas con cantidad y porcentaje; cada una enlaza a Emitidos filtrado.
- Por tipo de documento (barras horizontales con cantidad) y Por fuente (tabla Fuente · barra · Total · Rechazados en badge oscuro).
- Últimos envíos con error: código de error en badge, referencia · fuente, mensaje y hace cuánto; "Ver los N".
- Sincronización con Sage 50 (por ahora solo SV): porcentaje grande, "X de Y aceptados ya están en el ERP", barra, pendientes por fuente y botón "Guardar en ERP".
- Solo DO: tarjeta con borde warning "Correlativos por agotarse", con lista y barras.
- Sin librería de gráficos: divs o SVG con `role="img"` y `aria-label`.

### Transmitir (`/transmitir/[tipo]`)
- Título "Transmitir documentos"; subtítulo "Pendientes de enviar a {authorityFull} desde Sage 50 · {fuente}". A la derecha "Sincronizado hace N min" y "Actualizar" (R).
- Pestañas por tipo (§5) con contador.
- Tarjeta de filtros: Contabilizado (rango, por defecto del día 1 del mes a hoy) con presets Este mes / Mes anterior / Últimos 7 días; "Fecha de emisión fiscal" con ícono de escudo, campo destacado con borde de tinta y la nota `emissionHint`; Limpiar; Buscar (↵).
- Filtros rápidos: Todos, Listos para enviar, Sin cliente, Montos por revisar, cada uno con su conteo. Búsqueda local "Referencia o cliente" (/). "N seleccionados de M".
- Columnas: checkbox · Referencia (orden) · Cliente (avatar con iniciales, nombre, código Sage) · Tipo (`DocTypeChip`) · Contabilizado · Total {moneda} · {impuesto} · Total + {impuesto} (negrita) · botón de detalle.
- Cliente no registrado: avatar "!" en danger, "No registrado · Crear cliente" (enlace al formulario con el origen en la URL), fila no seleccionable.
- Montos que no cuadran: `DocTypeChip` en warning "· revisar".
- Paginación: "Filas por página" 25, "1–12 de 86" y páginas.
- BulkActionBar: "N seleccionados", "Total + {impuesto}", Deseleccionar, Vista previa, "Transmitir a {authority}" (fiscal invertido, con atajo).

### Detalle (DocumentSheet)
- Cabecera "Documento 2 de 86" con ↑/↓ y cerrar; referencia grande en mono; DocTypeChip; estado "sin transmitir".
- Tarjeta del cliente (avatar, nombre, código · {documento}) con "Editar".
- Contabilizado, Emisión fiscal y Condición (p. ej. "Crédito · 30 días").
- Tabla de líneas: ID, Nombre, Cant., Precio, Subtotal, {impuesto}, Renta, Total.
- Totales: Subtotal, {impuesto}, Renta retenida, Total {moneda}.
- Pie: "Vista previa PDF" y "Agregar a la selección" (X).

### Confirmación (CriticalConfirm nivel 1)
"Transmitir N documentos a {authorityFull}" / "Cada {docName} se firmará y enviará con la fecha de emisión indicada." Alert warning "Acción fiscal irreversible. Una vez recibidos por {authority} no se pueden editar ni retirar; solo anular mediante invalidación." Resumen: Fuente, Emisión fiscal, Ambiente, Total + {impuesto}. Lista de documentos (referencia, tipo, cliente, total). Casilla obligatoria "Revisé la fecha de emisión ({fecha}) y los montos. Entiendo que esta transmisión tiene efectos fiscales." Cancelar / "Transmitir N {docName}" (fiscal).

### Enviando
Panel oscuro abajo al centro con `aria-live`: "Transmitiendo a {authorityFull}… 3/6", barra de progreso, "Firmando y enviando uno a uno. No cierres la sesión." y "3 aceptados · 0 rechazados". Cada fila muestra su estado en línea a la derecha.

### Resultados (`/transmitir/lotes/[id]`)
- Breadcrumb "Transmitir > Lote TX-0142" y "← Volver a la bandeja".
- Meta: fecha y hora · fuente · ambiente · usuario. Título "5/6 documentos ingresados en {authorityFull}". Acciones "Resumen CSV" y "Ver en Emitidos" (primary).
- Barra verde/oscura con chips "N aceptados · monto" y "N rechazados · monto". Alert warning si hubo rechazos: "El rechazado no tiene validez fiscal y sigue pendiente en la bandeja. Corrige la causa antes de volver a transmitirlo."
- Rechazados primero, en tarjeta con borde oscuro: referencia, cliente, total, chip Rechazado, lista de códigos y mensajes de la autoridad, "Corregir cliente C-xxxxx →" (fiscal) y "Copiar errores".
- Aceptados: referencia, cliente, total, chip Aceptado y tres `CopyCode`: Código de generación, Número de control, Sello de recibido. Observaciones de la autoridad en un chip warning "Observación {authority}".

### Emitidos (`/emitidos`)
- Título "Documentos emitidos"; subtítulo "Todo lo transmitido a {authority}, con su respuesta y su estado en Sage 50." Búsqueda en servidor "Referencia, cliente, Nº de control o Código de generación" (/).
- Pestañas por estado con conteo: Todos, Aceptado, Pendiente, En proceso, Rechazado, Invalidado.
- Chips de filtro: "Emisión 30 sep – 30 oct ×", "Tipo 01, 03 ×", "+ Filtro".
- Columnas: Ref. ERP · Fuente (chip) · Tipo · {controlLabel} (o "— sin número asignado —") · Código de generación (truncado + copiar) · Emisión (orden) · Procesado · Estado · ⋯.
- Paginación de 50: "1–50 de 412 · página 1 de 9".
- Menú ⋯: Ver PDF (P), Descargar {fileFormat} (D), Copiar código (C), Reenviar correo (E, con el correo destino), Guardar en ERP (S, por ahora solo SV), Reconsultar estado, Regenerar número (solo DO), Invalidar (danger, separado al final). Las acciones no disponibles se muestran deshabilitadas con su motivo (p. ej. "No disponible para e-CF 31").
- Invalidar (CriticalConfirm nivel 2): "Invalidar {ref} ante {authority}" / "No se puede deshacer. El {docName} pasará a Invalidado; si necesitas reemplazarlo, emite uno nuevo desde la bandeja." Resumen Cliente, Emitido, Total. Campos: Tipo de documento del solicitante, Número de documento, Nombre del solicitante, Motivo. "Escribe los últimos 3 dígitos del {controlLabel} ({ddd}) para confirmar"; mientras no coincida, "Faltan dígitos: el botón se habilita al coincidir." Cancelar / "Invalidar ante {authority}" (danger).

### Clientes (`/clientes`)
- Título "Clientes"; subtítulo "N receptores registrados para emitir documentos fiscales". Botones "Importar desde Sage 50" (secondary) y "+ Nuevo cliente" (primary).
- Alert danger "N clientes no registrados bloquean M documentos en Transmitir: C-00487, C-00502." con acción "Crear C-00487 desde Sage 50".
- Búsqueda "Nombre, código o documento", segmentado Activos / Inactivos / Todos con conteo, select "Tipo de documento".
- Columnas: Cliente (avatar, nombre, nombre comercial) · Código Sage 50 · Documento (chip de tipo + número en mono) · Dirección · Estado · editar y eliminar (danger-soft).

### Cliente · formulario (`/clientes/nuevo`, `/clientes/[id]`)
- Si viene de Transmitir: banner accent-soft "Vienes de Transmitir: el cliente C-00487 no existe. Al guardar volverás con CCF-001878 listo para seleccionar." y "Volver sin guardar".
- Secciones en tarjetas con título y descripción a la izquierda:
  - Identificación: Código Sage 50*, Tipo de persona*, Tipo de documento*, Documento*, NRC.
  - Nombre: Nombre o razón social* ("Como aparecerá en el {docName}"), Nombre comercial.
  - Actividad: Actividad económica (búsqueda en el catálogo), Actividad para exportación.
  - Ubicación: País*, Departamento*, Municipio* ("Se filtra según el departamento"), Dirección complementaria.
  - Contacto: Correo* ("Aquí se envía el documento"), Teléfono.
  - Switch "Habilitar cliente".
- Los campos precargados desde Sage llevan un chip "Sage 50".
- Panel derecho "Buscar en Sage 50": Fuente, "Documento (NIT/DUI) o código", Buscar; resultado "Encontrado en {fuente}" con Nombre, documento, Dirección y Correo, y "Usar estos datos".
- Barra flotante abajo: "N campos por corregir" (danger), Cancelar, "Guardar" o "Guardar y volver a Transmitir" (⌘S).

### Correlativos (`/correlativos`, solo DO)
- Título "Correlativos e-NCF"; subtítulo "Rangos autorizados por la DGII. Alerta cuando queda menos del 10 %." Switch "Mostrar inactivos" con conteo y "+ Nuevo rango".
- Agrupados por emisor (avatar, nombre, RNC, número de rangos). Tarjetas: "e-CF 31 · Crédito fiscal", serie, chip Activo o "Por agotarse" (warning, con borde warning en la tarjeta), anillo de consumo, e-NCF actual en mono (prefijo en `--muted`), "N disponibles" (en warning si `isLow`) y "Rango 1–5,000". La tarjeta en edición lleva borde accent.
- Panel "Editar rango": Emisor y Tipo e-CF (solo lectura al editar), Nombre, Máscara, Inicial, Final, Correlativo actual (resaltado en warning) con Alert "Cambiarlo puede producir e-NCF duplicados o saltos. Ajústalo solo para corregir un desfase confirmado.", switch "Rango activo", Cancelar / Guardar cambios.

### Administración de accesos (`/admin/*`)
- Título "Administración de accesos"; subtítulo "Qué ve cada rol en la navegación y qué puede hacer en cada ruta." Segmentado Usuarios / Menús / Rutas / Permisos por rol.
- Menús: "Estructura del menú — Arrastra para reordenar · Alt + ↑↓ con teclado" y "+ Nuevo menú"; árbol con asa, ícono, nombre, ruta, "N submenús" y editar. Panel "Editar menú · {nombre}": Nombre, Ruta, Ícono (búsqueda por nombre de Material Icons y cuadrícula), switch "Habilitar submenús", lista de submenús con su ruta, "+ Agregar submenú", Descartar / Guardar menú.
- Rutas: búsqueda, "+ Nueva ruta"; columnas Nombre · Dirección (mono) · Estado (chip) · Creada · Activa (switch).
- Permisos por rol: lista de roles con número de usuarios; "Permisos · {rol}", búsqueda y "Asignar ruta"; columnas Ruta (nombre + path) · Crear · Leer · Actualizar · Eliminar · Estado · eliminar. Las filas modificadas se resaltan en warning-soft; barra "N cambios sin guardar · aplican al próximo inicio de sesión" con Descartar / Guardar permisos.
- Usuarios: sin captura; mismo estilo que Rutas (lista con búsqueda y estado, modal de crear y editar).

## §9 · Atajos

Registro central en `useShortcuts`; se desactivan con el foco en un input o textarea. "?" (o el botón de teclado de la TopBar) abre la hoja de atajos.

| Atajo | Acción |
| --- | --- |
| ⌘K / Ctrl K | CommandPalette |
| / | Enfocar la búsqueda de la pantalla |
| F | Cambiar de fuente |
| R | Actualizar (reconsultar Sage 50) |
| 1–5 | Pestaña de tipo en Transmitir |
| J / K | Fila siguiente / anterior (también en DocumentSheet) |
| X | Seleccionar la fila / agregar a la selección |
| ↵ | Abrir el detalle de la fila; en filtros, Buscar |
| P | Vista previa PDF (Transmitir) / Ver PDF (Emitidos) |
| D, C, E, S | Emitidos: descargar, copiar código, reenviar correo, guardar en ERP |
| ⌘↵ | Transmitir la selección (abre la confirmación) |
| ⌘S | Guardar formulario |
| Alt ↑ / ↓ | Reordenar en Menús |
| Esc | Cerrar drawer, modal o paleta |

## §10 · Accesibilidad y calidad

- Todo se usa con teclado; foco visible (borde accent de 2 px).
- Focus trap en modales y drawers, con retorno del foco al cerrar.
- `aria-live` en el progreso de envío; `role="alert"` en errores; `aria-invalid` y `aria-describedby` en campos.
- Contraste AA en claro y oscuro (por eso el accent es `#0369D9`).
- Íconos decorativos con `aria-hidden`; botones solo con ícono con `aria-label`.
- Cada vista de datos tiene estados vacío, cargando, error y sin acceso (403).
- Tablas con más de 100 filas sin trabarse; búsqueda con debounce de 300 ms en servidor.
- `pnpm lint` y `pnpm typecheck` en verde antes de cerrar un bloque.

## §11 · Resumen de cierre de cada bloque

1. Archivos creados y modificados.
2. Qué se probó contra el backend local y con qué resultado.
3. Partes NO verificadas.
4. Diferencias con el diseño (`../new_design`) y por qué.
5. Cambios de contrato que hay que pedirle al backend.
6. Dependencias agregadas o propuestas.
7. Decisiones pendientes.

Bitácora de progreso:
- Al cerrar cada bloque, agrega su Resumen de cierre al final de docs/progreso.md con el encabezado "## <Bloque> · <nombre> · <fecha yyyy-MM-dd>". Una sola entrada por bloque.
- Si el bloque se detiene a esperar aprobación, no escribas en la bitácora durante la pausa: la entrada va al terminar el bloque completo.
- Si el bloque se entrega por partes (por ejemplo, un tipo de documento a la vez), usa una sola entrada con un subapartado por parte y complétala a medida que avanzas.
- El Prompt de revisión no crea una entrada nueva: actualiza la del bloque con un apartado "Revisión" que diga qué se corrigió.
- Al empezar una sesión nueva, lee docs/progreso.md después de CLAUDE.md.
