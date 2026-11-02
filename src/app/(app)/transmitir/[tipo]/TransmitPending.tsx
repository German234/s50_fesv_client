"use client";

import { notFound } from "next/navigation";
import { PendingScreen } from "@/components/shell/PendingScreen";
import { findSource, findTransmitTab, useCountry } from "@/config/country";
import { useSource } from "@/stores";

/** Valida la pestaña contra las bandejas del backend; desconocida → 404. */
export function TransmitPending({ slug }: { slug: string }) {
  const country = useCountry();
  const { source } = useSource();
  if (!findTransmitTab(country, slug)) notFound();
  const sourceName = findSource(country, source)?.name ?? "todas las fuentes";
  return (
    <PendingScreen
      title="Transmitir documentos"
      subtitle={`Pendientes de enviar a ${country.authorityFull} desde Sage 50 · ${sourceName}`}
      stage="bandeja"
    />
  );
}
