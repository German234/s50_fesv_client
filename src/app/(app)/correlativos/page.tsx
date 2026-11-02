"use client";

import { notFound } from "next/navigation";
import { PendingScreen } from "@/components/shell/PendingScreen";
import { useCountry } from "@/config/country";

export default function CorrelativesPage() {
  const country = useCountry();
  if (!country.supportsCorrelativesAdmin) notFound();
  return (
    <PendingScreen
      title={`Correlativos ${country.controlLabel}`}
      subtitle={`Rangos autorizados por ${country.authority}. Alerta cuando queda menos del 10 %.`}
      stage="Correlativos"
    />
  );
}
