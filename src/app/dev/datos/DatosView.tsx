"use client";

import { Button, Chip, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleX, LogOut, RotateCw } from "lucide-react";
import type { ReactNode } from "react";
import { z } from "zod";
import { DEV_ERROR_EXPECTATIONS, DEV_ERROR_KINDS, triggerUnauthorized } from "@/features/dev/api";
import { devKeys, useDevErrorProbe, useHealth, useNetworkErrorProbe } from "@/features/dev/queries";
import type { ApiError } from "@/lib/api/errors";
import type { DevErrorKind } from "@/lib/api/types";
import { useUrlFilters } from "@/lib/hooks/useUrlFilters";

const filtersSchema = z.object({
  vista: z.enum(["todos", "fallos"]).default("todos"),
});

interface Expectation {
  status: number | null;
  code: string;
}

const NETWORK_EXPECTATION: Expectation = { status: null, code: "network" };

function matches(error: ApiError | null | undefined, expected: Expectation): boolean {
  return !!error && error.code === expected.code && error.status === expected.status && error.message.length > 0;
}

export function DatosView() {
  const queryClient = useQueryClient();
  const health = useHealth();
  const { filters, setFilters } = useUrlFilters(filtersSchema);
  const onlyFailures = filters.vista === "fallos";

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Capa de datos</h1>
          <p className="text-muted">
            Llamadas reales a <code className="font-mono text-small">{process.env.NEXT_PUBLIC_API_URL}</code> y su
            error normalizado <code className="font-mono text-small">{"{ code, message, details }"}</code>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButtonGroup
            aria-label="Vista"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[filters.vista]}
            onSelectionChange={(keys) => {
              const [key] = [...keys];
              if (key === "todos" || key === "fallos") setFilters({ vista: key });
            }}
          >
            <ToggleButton id="todos" size="sm">
              Todos
            </ToggleButton>
            <ToggleButton id="fallos" size="sm">
              Solo fallos
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="secondary" size="sm" onPress={() => queryClient.invalidateQueries({ queryKey: devKeys.all })}>
            <RotateCw aria-hidden />
            Repetir
          </Button>
          <Button variant="danger-soft" size="sm" onPress={() => void triggerUnauthorized().catch(() => {})}>
            <LogOut aria-hidden />
            Probar 401 (redirige a /login)
          </Button>
        </div>
      </header>

      <section className="flex items-center justify-between rounded-card bg-surface p-5 shadow-surface">
        <div className="flex flex-col gap-1">
          <span className="text-heading">GET /health</span>
          <span className="text-small text-muted">
            {health.isPending
              ? "Consultando…"
              : health.isError
                ? `${health.error.message}`
                : `Respuesta: ${health.data}`}
          </span>
        </div>
        <ResultChip ok={health.isSuccess && health.data === "Healthy"} pending={health.isPending} />
      </section>

      <section className="overflow-x-auto rounded-card bg-surface shadow-surface">
        <table className="w-full min-w-[960px] text-left text-small">
          <thead className="text-muted">
            <tr className="border-b border-separator">
              <th className="px-4 py-3 font-medium">Caso</th>
              <th className="px-4 py-3 font-medium">Esperado</th>
              <th className="px-4 py-3 font-medium">status</th>
              <th className="px-4 py-3 font-medium">code</th>
              <th className="px-4 py-3 font-medium">message</th>
              <th className="px-4 py-3 font-medium">details</th>
              <th className="px-4 py-3 font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {DEV_ERROR_KINDS.map((kind) => (
              <DevErrorRow key={kind} kind={kind} onlyFailures={onlyFailures} />
            ))}
            <NetworkRow onlyFailures={onlyFailures} />
          </tbody>
        </table>
      </section>
    </main>
  );
}

function DevErrorRow({ kind, onlyFailures }: { kind: DevErrorKind; onlyFailures: boolean }) {
  const probe = useDevErrorProbe(kind);
  return (
    <ProbeRow
      label={`/dev/errors/${kind}`}
      expected={DEV_ERROR_EXPECTATIONS[kind]}
      error={probe.data}
      pending={probe.isPending}
      onlyFailures={onlyFailures}
    />
  );
}

function NetworkRow({ onlyFailures }: { onlyFailures: boolean }) {
  const probe = useNetworkErrorProbe();
  return (
    <ProbeRow
      label="red (puerto cerrado)"
      expected={NETWORK_EXPECTATION}
      error={probe.data}
      pending={probe.isPending}
      onlyFailures={onlyFailures}
    />
  );
}

function ProbeRow({
  label,
  expected,
  error,
  pending,
  onlyFailures,
}: {
  label: string;
  expected: Expectation;
  error: ApiError | null | undefined;
  pending: boolean;
  onlyFailures: boolean;
}) {
  const ok = matches(error, expected);
  if (onlyFailures && (ok || pending)) return null;

  return (
    <tr className="border-b border-separator align-top last:border-0">
      <td className="px-4 py-3 font-mono text-[12px]">{label}</td>
      <td className="px-4 py-3 font-mono text-[12px] text-muted">
        {expected.status ?? "—"} · {expected.code}
      </td>
      <Cell>{error?.status ?? "—"}</Cell>
      <Cell>{error?.code ?? (pending ? "…" : "sin error")}</Cell>
      <td className="max-w-[280px] px-4 py-3">{error?.message}</td>
      <td className="px-4 py-3 font-mono text-[12px]">
        {error?.details
          ? Object.entries(error.details).map(([field, messages]) => (
              <div key={field}>
                <b>{field}</b>: {messages.join(" · ")}
              </div>
            ))
          : "—"}
      </td>
      <td className="px-4 py-3">
        <ResultChip ok={ok} pending={pending} />
      </td>
    </tr>
  );
}

function Cell({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3 font-mono text-[12px]">{children}</td>;
}

function ResultChip({ ok, pending }: { ok: boolean; pending: boolean }) {
  if (pending) {
    return (
      <Chip variant="soft" color="accent">
        <RotateCw aria-hidden className="size-3.5" />
        <Chip.Label>Probando</Chip.Label>
      </Chip>
    );
  }
  return ok ? (
    <Chip variant="soft" color="success">
      <CircleCheck aria-hidden className="size-3.5" />
      <Chip.Label>Correcto</Chip.Label>
    </Chip>
  ) : (
    <Chip variant="soft" color="danger">
      <CircleX aria-hidden className="size-3.5" />
      <Chip.Label>No coincide</Chip.Label>
    </Chip>
  );
}
