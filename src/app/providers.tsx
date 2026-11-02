"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sileo";
import { CountryGate } from "@/components/shell/CountryGate";
import { COUNTRY_TEXTS, getConfiguredCountry, isCountryCode } from "@/config/country";
import { endSession, getSessionToken, removeSessionData } from "@/features/auth/session";
import { configureAuth } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import { useUiStore } from "@/stores/useUiStore";

const MAX_QUERY_RETRIES = 2;

// Reintenta solo lo que puede resolverse solo (red, 5xx); un 4xx no cambia al repetirlo.
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (!isApiError(error)) return true;
  return error.status === null || error.status >= 500;
}

// HeroUI v3 no necesita provider propio. RouterProvider e I18nProvider son de
// React Aria (re-exportados por HeroUI): el primero hace que los `href` de sus
// componentes naveguen con el router de Next; el segundo fija el locale de los
// campos de fecha (dd/mm/aaaa).
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  // Locale del diccionario local; si NEXT_PUBLIC_PAIS es inválido, CountryGate muestra el error.
  const configured = getConfiguredCountry();
  const locale = isCountryCode(configured) ? COUNTRY_TEXTS[configured].locale : "es";
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: shouldRetryQuery },
        // Ninguna mutación se reintenta sola: una transmisión repetida tiene efectos fiscales.
        mutations: { retry: 0 },
      },
    });
    // Se registra aquí y no en un efecto: los efectos de los hijos (las primeras queries)
    // corren antes que los de Providers y saldrían sin token.
    configureAuth({
      getToken: getSessionToken,
      clearSession: () => {
        endSession();
        removeSessionData(client);
      },
    });
    return client;
  });

  // Preferencias de UI guardadas en este navegador (ver useUiStore).
  useEffect(() => {
    void useUiStore.persist.rehydrate();
  }, []);

  // Ante un 401 el cliente HTTP vuelve a /login con el router de Next.
  useEffect(() => {
    configureAuth({ navigate: (href) => router.replace(href) });
  }, [router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouterProvider navigate={router.push}>
        <I18nProvider locale={locale}>
          <QueryClientProvider client={queryClient}>
            <CountryGate>{children}</CountryGate>
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
