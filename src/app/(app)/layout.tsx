import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SessionGuard } from "@/features/auth/components/SessionGuard";

// AppShell lee ?fuente= con useSearchParams: necesita un Suspense para el render estático.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SessionGuard>
      <Suspense>
        <AppShell>{children}</AppShell>
      </Suspense>
    </SessionGuard>
  );
}
