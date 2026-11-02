import type { Metadata } from "next";
import { Suspense } from "react";
import { ComponentesView } from "./ComponentesView";

export const metadata: Metadata = { title: "Componentes · dev" };

// Catálogo de components/fiscal para comparar con B02 · Componentes HeroUI.png y
// B03 · Estados y toasts (Sileo).png. Los datos son props de demostración, no la API.
export default function ComponentesPage() {
  return (
    <Suspense>
      <ComponentesView />
    </Suspense>
  );
}
