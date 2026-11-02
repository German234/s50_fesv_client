"use client";

import { Alert, Button, FieldError, Input, Label, TextField, type SortDescriptor } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { Database, Eye, Lock, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  AddFilterButton,
  BulkActionBar,
  CopyCode,
  CriticalConfirm,
  DataTable,
  DOCUMENT_STATUSES,
  DocTypeChip,
  DocumentSheet,
  EmptyState,
  ErrorState,
  FilterBar,
  FilterChip,
  FilterDateRange,
  FiscalButton,
  FiscalDateField,
  Money,
  StatusChip,
  TableSkeleton,
  type DataTableColumn,
  type DateRange,
  type RowId,
} from "@/components/fiscal";
import { CountryMismatch } from "@/components/shell/CountryGate";
import { useCountry } from "@/config/country";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useUiStore } from "@/stores/useUiStore";
import { ThemeSwitch } from "../tema/ThemeSwitch";
import { buildDemoDocuments, initials, type DemoDocument } from "./demoData";

const UUID = "3f2a9c1e-7b4d-4e21-9a0c-6d6a1b8b2e17";

/** ?abrir=detalle | confirmar1 | confirmar2 abre ese overlay al cargar (para revisar y capturar). */
function useInitialOverlay(): string | null {
  return useSearchParams().get("abrir");
}
const PAGE_SIZES = [25, 50, 100];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title">{title}</h2>
        {note && <p className="text-small text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Panel({ title, className = "", children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-4 rounded-card bg-surface p-5 shadow-surface ${className}`}>
      {title && <h3 className="text-heading">{title}</h3>}
      {children}
    </div>
  );
}

function StateLabel({ children }: { children: ReactNode }) {
  return <span className="text-small text-muted">{children}</span>;
}

export function ComponentesView() {
  const country = useCountry();
  const typeCodes = useMemo(() => country.transmitTabs[0]?.codes ?? ["01", "03"], [country]);
  const documents = useMemo(() => buildDemoDocuments(typeCodes), [typeCodes]);
  const rate = country.meta.taxRate;

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-10 px-6 py-12 pb-32">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="text-small font-medium text-accent">components/fiscal · sobre @heroui/react</span>
          <h1 className="text-[40px] leading-[1.1] font-bold tracking-tight">Componentes reutilizables</h1>
          <p className="text-muted">
            País {country.code} · {country.authorityOrg}. Todo se usa con teclado: Tab, flechas, Enter, J/K y X en la tabla.
          </p>
        </div>
        <ThemeSwitch />
      </header>

      <ChipsAndCodes />
      <Fields />
      <TableDemo documents={documents} rate={rate} />
      <Confirmations />
      <States />
      <Toasts />
      <LightAndDark />
    </main>
  );
}

function ChipsAndCodes() {
  const country = useCountry();
  const [firstType, secondType] = country.documentTypes;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Panel title="StatusChip · DocTypeChip">
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
        <div className="border-t border-dashed border-separator" />
        <div className="flex flex-wrap gap-2">
          {secondType && <DocTypeChip code={secondType.code} />}
          {secondType && <DocTypeChip code={secondType.code} variant="review" />}
          {firstType && <DocTypeChip code={firstType.code} compact />}
        </div>
      </Panel>

      <Panel title="CopyCode">
        <StateLabel>Reposo (Tab para enfocar, Enter para copiar)</StateLabel>
        <CopyCode value={UUID} label="Código de generación" />
        <StateLabel>Foco de teclado</StateLabel>
        <CopyCode value={UUID} label="Código de generación" className="ring-2 ring-focus" />
        <StateLabel>{country.controlLabel} sin truncar</StateLabel>
        <CopyCode value={country.code === "DO" ? "E310000000123" : "DTE-01-M001P001-000000000000123"} label={country.controlLabel} full />
      </Panel>

      <Panel title="Money">
        <table className="w-full text-body">
          <thead>
            <tr className="border-b border-separator text-small text-muted">
              <th className="py-2 text-start font-medium">Concepto</th>
              <th className="py-2 text-end font-medium">Total {country.currency.code}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Factura", 12480],
              ["Nota de crédito", -1250],
              ["Renta", 0],
            ].map(([concept, amount]) => (
              <tr key={concept} className="border-b border-separator/60">
                <td className="py-2">{concept}</td>
                <td className="py-2 text-end">
                  <Money value={amount} />
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-2 font-semibold">Total</td>
              <td className="py-2 text-end">
                <Money value={11230} emphasis />
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Fields() {
  const country = useCountry();
  const [range, setRange] = useState<DateRange | null>({
    start: new CalendarDate(2026, 10, 1),
    end: new CalendarDate(2026, 10, 30),
  });
  const [invalidRange, setInvalidRange] = useState<DateRange | null>({
    start: new CalendarDate(2026, 10, 15),
    end: new CalendarDate(2026, 10, 1),
  });
  const [emission, setEmission] = useState<CalendarDate | null>(new CalendarDate(2026, 10, 30));
  const [filters, setFilters] = useState([
    { id: "estado", label: "Estado", value: "Rechazado +1" },
    { id: "emision", label: "Emisión", value: "30 sep – 30 oct" },
  ]);
  const rangeError =
    invalidRange && invalidRange.start.compare(invalidRange.end) > 0 ? "La fecha inicial no puede ser mayor que la final." : undefined;

  return (
    <Section title="Campos y filtros" note="DateRangePicker, DateField y TextField: reposo, foco, error y deshabilitado">
      <FilterBar onSubmit={() => toast.success("Búsqueda enviada")} onClear={() => setRange(null)}>
        <FilterDateRange label="Contabilizado" value={range} onChange={setRange} />
        <FiscalDateField value={emission} onChange={setEmission} />
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Estados de campo">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField defaultValue="Ferretería El Volcán" className="flex flex-col gap-1.5">
              <Label className="text-small">Foco (Tab hasta aquí)</Label>
              <Input />
            </TextField>
            <TextField defaultValue="24518" isInvalid className="flex flex-col gap-1.5">
              <Label className="text-small">Error</Label>
              <Input className="font-mono" />
              <FieldError className="text-small text-danger">
                {country.code === "DO" ? "RNC de 9 dígitos" : "6 a 8 dígitos y guion"}
              </FieldError>
            </TextField>
            <FilterDateRange label="Rango inválido" value={invalidRange} onChange={setInvalidRange} errorMessage={rangeError} />
            <FiscalDateField value={null} onChange={() => {}} isDisabled label="Emisión (deshabilitado)" />
          </div>
        </Panel>

        <Panel title="FilterChip · BulkActionBar">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                value={filter.value}
                onRemove={() => setFilters((current) => current.filter((f) => f.id !== filter.id))}
              />
            ))}
            <AddFilterButton
              onPress={() => setFilters((current) => [...current, { id: `tipo-${current.length}`, label: "Tipo", value: "01, 03" }])}
            />
          </div>
          <BulkActionBar inline selectedCount={6} total={25860.22} onClear={() => {}} onPreview={() => {}} onTransmit={() => {}} />
          <BulkActionBar
            inline
            selectedCount={2}
            total={3162.59}
            onClear={() => {}}
            onTransmit={() => {}}
            transmitDisabledReason="Tu rol (Consulta) no puede transmitir."
          />
        </Panel>
      </div>
    </Section>
  );
}

function TableDemo({ documents, rate }: { documents: DemoDocument[]; rate: number }) {
  const country = useCountry();
  const density = useUiStore((state) => state.density);
  const setDensity = useUiStore((state) => state.setDensity);
  const [sort, setSort] = useState<SortDescriptor>({ column: "reference", direction: "ascending" });
  const [selected, setSelected] = useState<Set<RowId>>(() => new Set([1, 2, 4]));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [mode, setMode] = useState<"data" | "loading" | "empty">("data");
  const initialOverlay = useInitialOverlay();
  const [openIndex, setOpenIndex] = useState<number | null>(initialOverlay === "detalle" ? 1 : null);

  const sorted = useMemo(() => {
    const direction = sort.direction === "descending" ? -1 : 1;
    const key = sort.column as keyof DemoDocument;
    return [...documents].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * direction);
  }, [documents, sort]);
  const pageRows = mode === "empty" ? [] : sorted.slice((page - 1) * pageSize, page * pageSize);
  const totalWithTax = (row: DemoDocument) => row.subtotal * (1 + rate);
  const selectedTotal = documents.filter((d) => selected.has(d.id)).reduce((sum, d) => sum + totalWithTax(d), 0);
  const openRow = openIndex === null ? null : sorted[openIndex];

  const columns: DataTableColumn<DemoDocument>[] = [
    {
      id: "reference",
      header: "Referencia",
      isRowHeader: true,
      allowsSorting: true,
      cell: (row) => <span className="font-mono text-[13px]">{row.reference}</span>,
    },
    {
      id: "customer",
      header: "Cliente",
      showsBlockedReason: true,
      minWidth: 260,
      cell: (row) => (
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
              row.registered ? "bg-default" : "bg-danger-soft text-danger-soft-foreground"
            }`}
          >
            {row.registered ? initials(row.customer) : "!"}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{row.customer}</span>
            <span className="font-mono text-[12px] text-muted">{row.customerCode}</span>
          </span>
        </span>
      ),
    },
    {
      id: "typeCode",
      header: "Tipo",
      allowsSorting: true,
      cell: (row) => <DocTypeChip code={row.typeCode} variant={row.review ? "review" : "default"} />,
    },
    {
      id: "postedOn",
      header: "Contabilizado",
      allowsSorting: true,
      cell: (row) => <span className="font-mono text-[13px] tabular-nums">{formatDate(row.postedOn)}</span>,
    },
    {
      id: "subtotal",
      header: `Total ${country.currency.code}`,
      align: "end",
      allowsSorting: true,
      cell: (row) => <Money value={row.subtotal} />,
    },
    { id: "tax", header: country.tax.name, align: "end", cell: (row) => <Money value={row.subtotal * rate} /> },
    {
      id: "total",
      header: `Total + ${country.tax.name}`,
      align: "end",
      cell: (row) => <Money value={totalWithTax(row)} emphasis />,
    },
  ];

  return (
    <Section title="DataTable" note="120 filas · orden, selección entre páginas, filas bloqueadas, densidad · J/K mueven, X selecciona, Enter abre el detalle">
      <div className="flex flex-wrap items-center gap-2">
        {(["data", "loading", "empty"] as const).map((value) => (
          <Button key={value} size="sm" variant={mode === value ? "primary" : "secondary"} onPress={() => setMode(value)}>
            {value === "data" ? "Con datos" : value === "loading" ? "Cargando" : "Vacía"}
          </Button>
        ))}
        <span className="mx-2 h-6 w-px bg-separator" />
        <Button size="sm" variant="secondary" onPress={() => setDensity(density === "compact" ? "comfortable" : "compact")}>
          Densidad: {density === "compact" ? "compacta" : "cómoda"}
        </Button>
        <span className="ms-auto text-small" aria-live="polite">
          <b>{selected.size}</b> seleccionados de {documents.length}
        </span>
      </div>

      <DataTable
        aria-label="Documentos pendientes de transmitir (demostración)"
        rows={pageRows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.reference}
        sortDescriptor={sort}
        onSortChange={setSort}
        selectedIds={selected}
        onSelectionChange={setSelected}
        isRowSelectable={(row) => (row.registered ? true : { reason: "No registrado · Crear cliente" })}
        onRowAction={(row) => setOpenIndex(sorted.findIndex((d) => d.id === row.id))}
        isLoading={mode === "loading"}
        loadingMessage="Leyendo documentos de Sage 50 · CIPSA…"
        emptyState={
          <EmptyState
            icon={ShieldCheck}
            tone="success"
            title="Nada pendiente de transmitir"
            description="No hay documentos de CIPSA entre 01/10/2026 y 30/10/2026 sin enviar."
            actions={<Button variant="secondary">Cambiar rango</Button>}
          />
        }
        pagination={{
          page,
          pageSize,
          total: mode === "empty" ? 0 : documents.length,
          onPageChange: setPage,
          pageSizeOptions: PAGE_SIZES,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />

      <BulkActionBar
        selectedCount={selected.size}
        total={selectedTotal}
        onClear={() => setSelected(new Set())}
        onPreview={() => toast.info("Vista previa de la selección")}
        onTransmit={() => toast.info(`Abriría la confirmación para ${selected.size} ${country.docName}`)}
      />

      {openRow && openIndex !== null && (
        <DocumentSheet
          isOpen
          onOpenChange={(isOpen) => !isOpen && setOpenIndex(null)}
          index={openIndex + 1}
          total={sorted.length}
          onPrevious={() => setOpenIndex((i) => (i === null ? i : Math.max(0, i - 1)))}
          onNext={() => setOpenIndex((i) => (i === null ? i : Math.min(sorted.length - 1, i + 1)))}
          title={openRow.reference}
          badges={
            <>
              <DocTypeChip code={openRow.typeCode} variant={openRow.review ? "review" : "default"} />
              <span className="text-small text-muted">sin transmitir</span>
            </>
          }
          footer={
            <>
              <Button variant="secondary">
                <Eye aria-hidden />
                Vista previa PDF
              </Button>
              <Button
                variant="primary"
                isDisabled={!openRow.registered}
                onPress={() => setSelected((current) => new Set(current).add(openRow.id))}
              >
                Agregar a la selección
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-card bg-surface-secondary p-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-default text-small font-semibold">
              {initials(openRow.customer)}
            </span>
            <span className="flex flex-col">
              <span className="text-heading">{openRow.customer}</span>
              <span className="font-mono text-[12px] text-muted">{openRow.customerCode}</span>
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-small">
            <dt className="text-muted">Contabilizado</dt>
            <dd className="text-end font-mono">{formatDate(openRow.postedOn)}</dd>
            <dt className="text-muted">Subtotal</dt>
            <dd className="text-end">
              <Money value={openRow.subtotal} />
            </dd>
            <dt className="text-muted">{country.tax.name}</dt>
            <dd className="text-end">
              <Money value={openRow.subtotal * rate} />
            </dd>
            <dt className="font-semibold">Total {country.currency.code}</dt>
            <dd className="text-end">
              <Money value={totalWithTax(openRow)} emphasis />
            </dd>
          </dl>
        </DocumentSheet>
      )}
    </Section>
  );
}

function Confirmations() {
  const country = useCountry();
  const initialOverlay = useInitialOverlay();
  const [open, setOpen] = useState<1 | 2 | null>(
    initialOverlay === "confirmar1" ? 1 : initialOverlay === "confirmar2" ? 2 : null,
  );
  const [pending, setPending] = useState(false);
  const controlNumber = country.code === "DO" ? "E310000000088" : "DTE-03-M001P001-000000000000088";

  function confirm() {
    setPending(true);
    void toast
      .promise(new Promise((resolve) => setTimeout(resolve, 1200)), {
        loading: open === 1 ? `Transmitiendo 6 ${country.docName}…` : "Invalidando…",
        success: open === 1 ? `5 de 6 ${country.docName} aceptados por ${country.authority}` : `Invalidado ante ${country.authority}`,
      })
      .finally(() => {
        setPending(false);
        setOpen(null);
      });
  }

  return (
    <Section title="CriticalConfirm · 2 niveles" note="Nivel 1: casilla obligatoria. Nivel 2: escribir los dígitos habilita la acción.">
      <Panel>
        <div className="flex flex-wrap gap-3">
          <FiscalButton onPress={() => setOpen(1)}>Transmitir 6 {country.docName}</FiscalButton>
          <Button variant="danger" onPress={() => setOpen(2)}>
            Invalidar CCF-001877
          </Button>
        </div>
      </Panel>

      <CriticalConfirm
        level={1}
        isOpen={open === 1}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={`Transmitir 6 documentos a ${country.authorityFull}`}
        description={`Cada ${country.docName} se firmará y enviará con la fecha de emisión indicada.`}
        warning={`Acción fiscal irreversible. Una vez recibidos por ${country.authority} no se pueden editar ni retirar; solo anular mediante invalidación.`}
        checkboxLabel="Revisé la fecha de emisión (30/10/2026) y los montos. Entiendo que esta transmisión tiene efectos fiscales."
        confirmLabel={`Transmitir 6 ${country.docName}`}
        onConfirm={confirm}
        isPending={pending}
      >
        <dl className="grid grid-cols-2 gap-2 rounded-field bg-surface-secondary p-3 text-small">
          <dt className="text-muted">Fuente</dt>
          <dd>CIPSA</dd>
          <dt className="text-muted">Emisión fiscal</dt>
          <dd className="font-mono">30/10/2026</dd>
          <dt className="text-muted">Total + {country.tax.name}</dt>
          <dd>
            <Money value={25860.22} symbol={country.currency.symbol} emphasis />
          </dd>
        </dl>
      </CriticalConfirm>

      <CriticalConfirm
        level={2}
        isOpen={open === 2}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={`Invalidar CCF-001877 ante ${country.authority}`}
        description={`No se puede deshacer. El ${country.docName} pasará a Invalidado; si necesitas reemplazarlo, emite uno nuevo desde la bandeja.`}
        warning="Esta acción es destructiva y queda registrada ante la autoridad."
        confirmationText={controlNumber.slice(-3)}
        confirmationPrompt={`Escribe los últimos 3 dígitos del ${country.controlLabel} (${controlNumber.slice(-3)}) para confirmar`}
        confirmLabel={`Invalidar ante ${country.authority}`}
        onConfirm={confirm}
        isPending={pending}
      />
    </Section>
  );
}

function States() {
  const country = useCountry();
  return (
    <Section title="Vacío, error y carga" note="B03 · cada estado dice qué pasó y qué hacer">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <EmptyState
            icon={ShieldCheck}
            tone="success"
            title="Nada pendiente de transmitir"
            description="No hay facturas ni créditos fiscales de CIPSA entre 01/10/2026 y 30/10/2026 sin enviar."
            actions={
              <>
                <Button variant="secondary">Cambiar rango</Button>
                <Button variant="tertiary">Ver emitidos</Button>
              </>
            }
          />
        </Panel>
        <Panel>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description={
              <>
                No encontramos <span className="font-mono">…0009921</span> con 2 filtros activos (Rechazado, SIAT).
              </>
            }
            actions={<Button variant="secondary">Buscar sin filtros</Button>}
          />
        </Panel>
        <ErrorState
          icon={Database}
          title="No pudimos leer Sage 50 de DSPORTS"
          description="La base no respondió. Las demás fuentes no se ven afectadas."
          technicalDetail="sage.unavailable · ODBC: [Pervasive][ODBC Engine Interface] Unable to connect · traceId 00-4bf9…"
          actions={
            <>
              <Button className="button--fiscal">Reintentar</Button>
              <Button variant="secondary">Cambiar fuente</Button>
            </>
          }
        />
      </div>
      <TableSkeleton message="Leyendo documentos de Sage 50 · CIPSA…" hint="<Skeleton> solo en la tabla; los filtros siguen disponibles" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Errores en línea y bloqueos">
          <Alert status="warning">
            <Alert.Indicator>
              <TriangleAlert aria-hidden className="size-4" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Description>
                La fecha de emisión (02/11/2026) es posterior a hoy. {country.authorityOrg} podría rechazar los documentos.
              </Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="default">
            <Alert.Indicator>
              <Lock aria-hidden className="size-4" />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Description>Tu rol (Consulta) no puede transmitir. Pide acceso a un administrador.</Alert.Description>
            </Alert.Content>
          </Alert>
        </Panel>
        <div className="flex flex-col gap-2">
          <h3 className="text-heading">País del frontend ≠ backend (pantalla completa en la app)</h3>
          <CountryMismatch configured="SV" backendCode={country.code === "SV" ? "DO" : country.code} backendName={country.meta.name} />
        </div>
      </div>
    </Section>
  );
}

function Toasts() {
  const country = useCountry();
  return (
    <Section title="Toasts · Sileo" note="Arriba al centro. Los errores no se cierran solos. Cada toast reemplaza al anterior.">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onPress={() =>
              void toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                loading: `Transmitiendo 6 ${country.docName}…`,
                success: () => ({
                  title: `5 de 6 ${country.docName} aceptados por ${country.authority}`,
                  description: "1 rechazado. Lote TX-0142 registrado.",
                  action: { label: "Ver resultados", onClick: () => {} },
                }),
              })
            }
          >
            Progreso → resultado del lote
          </Button>
          <Button variant="secondary" onPress={() => toast.success("Guardado en ERP")}>
            Éxito breve
          </Button>
          <Button variant="secondary" onPress={() => toast.success("Código copiado")}>
            Código copiado
          </Button>
          <Button variant="secondary" onPress={() => toast.warning("Guardado en ERP: 13 de 14")}>
            Parcial (warning)
          </Button>
          <Button
            variant="danger-soft"
            onPress={() =>
              toast.error({
                title: "No se reenvió el correo",
                description: "compras@elvolcan.com.sv rechazó el mensaje (buzón lleno). Este aviso no se cierra solo.",
                action: { label: "Reintentar", onClick: () => toast.success("Correo reenviado") },
              })
            }
          >
            Error persistente
          </Button>
        </div>
      </Panel>
    </Section>
  );
}

function LightAndDark() {
  return (
    <Section title="Claro y oscuro lado a lado">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {(["light", "dark"] as const).map((mode) => (
          <div key={mode} className={`${mode} flex flex-col gap-4 rounded-card bg-background p-4 text-foreground`}>
            <Panel title={mode === "light" ? "Claro" : "Oscuro"}>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_STATUSES.map((status) => (
                  <StatusChip key={status} status={status} />
                ))}
              </div>
              <CopyCode value={UUID} label={`Código de generación (${mode})`} />
              <div className="flex flex-wrap items-center gap-3">
                <FiscalButton>Transmitir</FiscalButton>
                <Button variant="primary">primary</Button>
                <Button variant="secondary">secondary</Button>
                <Button variant="tertiary">tertiary</Button>
                <Button variant="secondary" isDisabled>
                  deshabilitado
                </Button>
                <Button variant="primary" isPending>
                  cargando
                </Button>
              </div>
              <div className="flex items-baseline justify-between border-t border-separator pt-3">
                <span className="text-small text-muted">Total</span>
                <Money value={14125} emphasis />
              </div>
            </Panel>
          </div>
        ))}
      </div>
    </Section>
  );
}
