import type { Metadata } from "next";
import { Suspense } from "react";
import { DatosView } from "./DatosView";

export const metadata: Metadata = { title: "Datos · dev" };

// Diagnóstico de la capa de datos contra el backend local: /health y la normalización de
// cada error de /api/v1/dev/errors/{kind}.
export default function DatosPage() {
  return (
    <Suspense>
      <DatosView />
    </Suspense>
  );
}
