import { Button, Chip, Kbd } from "@heroui/react";
import { Ban, CircleCheck, CircleX, Clock, RotateCw, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FiscalButton } from "@/components/fiscal/FiscalButton";
import { getCountryTexts } from "@/config/country";
import { formatMoney } from "@/lib/format";
import { ThemeSwitch } from "./ThemeSwitch";

export const metadata: Metadata = { title: "Tema · dev" };

// Página de comparación con ../new_design/B01 · Fundamentos HeroUI.png.
// Los colores se leen de las variables reales: cada mitad de una muestra va dentro
// de un contenedor `.light` o `.dark`, así se ven ambos temas a la vez.

const TOKENS = [
  ["--background", "#F5F5F6", "#0F0F12"],
  ["--surface", "#FFFFFF", "#1B1B20"],
  ["--surface-secondary", "#F4F4F5", "#232329"],
  ["--default", "#EBEBEE", "#2A2A31"],
  ["--border", "#E4E4E7", "#2E2E35"],
  ["--foreground", "#18181B", "#FAFAFA"],
  ["--muted", "#71717A", "#A1A1AA"],
  ["--accent", "#0369D9", "#4C9DFF"],
  ["--accent-soft", "#E6F1FE", "#0F2747"],
  ["--success", "#17803D", "#4ADE80"],
  ["--warning", "#A35B00", "#FBBF24"],
  ["--danger", "#D92D20", "#F87171"],
] as const;

type ChipColor = "success" | "warning" | "accent" | "danger";

const STATES: { label: string; Icon: LucideIcon; color?: ChipColor; spec: string; hex: string }[] = [
  { label: "Aceptado", Icon: CircleCheck, color: "success", spec: 'color="success"', hex: "#146C36 / #E8F7EE" },
  { label: "Pendiente", Icon: Clock, color: "warning", spec: 'color="warning"', hex: "#8A4D00 / #FFF4DB" },
  { label: "En proceso", Icon: RotateCw, color: "accent", spec: 'color="accent"', hex: "#005BB8 / #E6F1FE" },
  { label: "Rechazado", Icon: CircleX, spec: 'color="default" · solid', hex: "#FFFFFF / #27272A" },
  { label: "Invalidado", Icon: Ban, color: "danger", spec: 'color="danger"', hex: "#B42318 / #FEECEB" },
];

const TYPE_SCALE = [
  ["Display 30/36 · 700", "text-display", "Transmitir documentos"],
  ["Title 20/28 · 600", "text-title", "Resultado de la transmisión"],
  ["Heading 15/22 · 600", "text-heading", "Fecha de emisión fiscal"],
  ["Body 14/20 · 400", "text-body", "Ferretería El Volcán, S.A. de C.V."],
  ["Small 13/18 · 400", "text-small", "Celdas de tabla y descripciones"],
] as const;

const RADII = [
  ["6 · kbd", "rounded-kbd"],
  ["12 · field", "rounded-field"],
  ["20 · card", "rounded-card"],
  ["24 · modal", "rounded-modal"],
  ["full · btn", "rounded-full"],
] as const;

const DEPTH = [
  ["surface", "tarjetas", "bg-surface shadow-surface"],
  ["overlay", "popover", "bg-overlay shadow-overlay"],
  ["modal", "drawer", "bg-overlay shadow-overlay ring-1 ring-border"],
] as const;

function StatusChip({ state }: { state: (typeof STATES)[number] }) {
  const { Icon, color, label } = state;
  return (
    <Chip variant="soft" color={color} className={color ? undefined : "chip--rejected"}>
      <Icon aria-hidden className="size-3.5" />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}

function ButtonRow({ authority }: { authority: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FiscalButton>Transmitir a {authority}</FiscalButton>
      <Button variant="primary">primary</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="tertiary">tertiary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="danger-soft">danger-soft</Button>
      <Button variant="danger">danger</Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-heading text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-card bg-surface p-5 shadow-surface ${className}`}>{children}</div>;
}

export default function TemaPage() {
  const country = getCountryTexts();

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <Chip variant="soft" color="accent" className="w-fit">
            <Chip.Label>Opción B · HeroUI v3 + Tailwind v4</Chip.Label>
          </Chip>
          <h1 className="text-[44px] leading-[1.1] font-bold tracking-tight">Suave en la forma, estricto en el dato.</h1>
          <p className="text-muted">
            Superficies blancas flotando sobre un gris claro, campos rellenos sin borde, botones píldora y chips
            suaves.
          </p>
        </div>
        <ThemeSwitch />
      </header>

      <Section title="Variables del tema (nombres de HeroUI) · claro / oscuro">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOKENS.map(([name, light, dark]) => (
            <Panel key={name} className="flex flex-col gap-2 p-3!">
              <div className="flex h-12 overflow-hidden rounded-xl ring-1 ring-black/5">
                <div className="light flex-1" style={{ background: `var(${name})` }} />
                <div className="dark flex-1" style={{ background: `var(${name})` }} />
              </div>
              <code className="font-mono text-small">{name}</code>
              <span className="font-mono text-[11px] text-muted">
                {light} · {dark}
              </span>
            </Panel>
          ))}
        </div>
        <p className="text-small text-muted">
          El accent por defecto de HeroUI (≈ #2E86F5) da 3.6:1 con texto blanco; se usa #0369D9 (5.1:1) para cumplir
          AA en botones de 13–14 px.
        </p>
      </Section>

      <Section title={'Estados del documento · <Chip variant="soft"> + ícono lucide'}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STATES.map((state) => (
            <Panel key={state.label} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="light rounded-full">
                  <StatusChip state={state} />
                </span>
                <span className="dark rounded-full">
                  <StatusChip state={state} />
                </span>
              </div>
              <code className="font-mono text-[12px] leading-5 text-muted">
                {state.spec}
                <br />
                {state.hex}
              </code>
            </Panel>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Section title="Tipografía · Inter + JetBrains Mono">
          <Panel className="p-0!">
            <dl className="divide-y divide-separator">
              {TYPE_SCALE.map(([spec, className, sample]) => (
                <div key={spec} className="grid grid-cols-[180px_1fr] items-center gap-4 px-5 py-3">
                  <dt className="font-mono text-[12px] text-muted">{spec}</dt>
                  <dd className={className}>{sample}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[180px_1fr] items-center gap-4 px-5 py-3">
                <dt className="font-mono text-[12px] text-muted">Mono 13 · tnum</dt>
                <dd className="font-mono text-[13px] tabular-nums">
                  {formatMoney(12480, { symbol: country.currency.symbol })} {formatMoney(1622.4)}{" "}
                  {formatMoney(14102.4)}
                </dd>
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center gap-4 px-5 py-3">
                <dt className="font-mono text-[12px] text-muted">Mono 12 · código</dt>
                <dd className="font-mono text-[12px]">DTE-01-M001P001-000000000000123</dd>
              </div>
            </dl>
          </Panel>
        </Section>

        <Section title="Forma y profundidad">
          <Panel className="flex flex-col gap-5">
            <div className="flex justify-between gap-2">
              {RADII.map(([label, className]) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`size-11 bg-default ${className}`} />
                  <span className="font-mono text-[12px]">{label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-card bg-background p-4">
              {DEPTH.map(([name, use, className]) => (
                <div key={name} className="flex flex-col gap-2">
                  <div className={`h-12 rounded-xl ${className}`} />
                  <span className="text-small">
                    <b>{name}</b> <span className="text-muted">· {use}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-small text-muted">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span>Sin bordes en tarjetas: la separación la da el contraste surface/background.</span>
            </div>
          </Panel>
        </Section>
      </div>

      <Section title="Botones · <Button variant>">
        <Panel className="flex flex-wrap items-center justify-between gap-6">
          <ButtonRow authority={country.authority} />
          <p className="max-w-sm text-small text-muted">
            La acción fiscal es una variante propia (<code className="font-mono">fiscal</code>): tinta + sello, nunca el
            accent.
          </p>
        </Panel>
      </Section>

      <Section title="Claro y oscuro lado a lado">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {(["light", "dark"] as const).map((mode) => (
            <div key={mode} className={`${mode} flex flex-col gap-4 rounded-card bg-background p-4 text-foreground`}>
              <Panel className="flex flex-col gap-4">
                <span className="text-heading">{mode === "light" ? "Claro" : "Oscuro"}</span>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((state) => (
                    <StatusChip key={state.label} state={state} />
                  ))}
                </div>
                <ButtonRow authority={country.authority} />
                <div className="flex items-baseline justify-between border-t border-separator pt-3">
                  <span className="text-small text-muted">Total + {country.tax.name}</span>
                  <span className="font-mono text-[13px] tabular-nums">{formatMoney(14125)}</span>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
