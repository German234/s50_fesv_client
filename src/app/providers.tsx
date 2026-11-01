"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ThemeProvider, useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "sileo";
import { useCountry } from "@/config/country";

// HeroUI v3 no necesita provider propio. RouterProvider e I18nProvider son de
// React Aria (re-exportados por HeroUI): el primero hace que los `href` de sus
// componentes naveguen con el router de Next; el segundo fija el locale de los
// campos de fecha (dd/mm/aaaa).
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const country = useCountry();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouterProvider navigate={router.push}>
        <I18nProvider locale={country.locale}>
          <QueryClientProvider client={queryClient}>
            {children}
            <ThemedToaster />
          </QueryClientProvider>
        </I18nProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="top-center" theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}
