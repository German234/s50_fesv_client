import { ShieldCheck } from "lucide-react";
import { AuthPanel } from "@/features/auth/components/AuthPanel";

// Pantalla dividida (§8 Login): formulario a la izquierda, panel decorativo a la derecha.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-background grid min-h-dvh lg:grid-cols-[1fr_minmax(0,47%)]">
      <div className="flex min-h-dvh flex-col px-6 py-8 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-foreground text-background flex size-10 items-center justify-center rounded-xl">
            <ShieldCheck aria-hidden className="size-5" />
          </span>
          <span className="text-heading">Facturación electrónica</span>
        </div>
        <main className="flex flex-1 items-center justify-center py-10">{children}</main>
        <p className="text-small text-muted text-center">¿Problemas para entrar? Contacta al administrador del sistema.</p>
      </div>
      <AuthPanel />
    </div>
  );
}
