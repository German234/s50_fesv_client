"use client";

import { Button, Spinner } from "@heroui/react";
import { Globe, ServerCrash } from "lucide-react";
import type { ReactNode } from "react";
import { COUNTRY_TEXTS, getConfiguredCountry, isCountryCode } from "@/config/country";
import { useCountryMeta } from "@/features/meta/queries";
import { normalizeError } from "@/lib/api/errors";
import { ErrorState } from "@/components/fiscal/StateViews";

/**
 * Valida el país antes de mostrar la aplicación (CLAUDE.md §5): NEXT_PUBLIC_PAIS debe ser
 * SV o DO y coincidir con GET /api/v1/meta/country. Si no, pantalla de error completa.
 * Dentro de este componente, useCountry() siempre tiene datos.
 */
export function CountryGate({ children }: { children: ReactNode }) {
  const configured = getConfiguredCountry();
  const meta = useCountryMeta();

  if (!isCountryCode(configured)) {
    return (
      <ErrorState
        fullScreen
        icon={Globe}
        title="El país de esta instalación no es válido"
        description={
          <>
            <code className="font-mono">NEXT_PUBLIC_PAIS</code> vale{" "}
            <b className="font-mono">{JSON.stringify(configured ?? null)}</b>; debe ser <b className="font-mono">SV</b> o{" "}
            <b className="font-mono">DO</b>. Corrige la variable y reinicia el frontend.
          </>
        }
      />
    );
  }

  if (meta.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <span role="status" className="flex items-center gap-2 text-muted">
          <Spinner size="sm" aria-hidden />
          Cargando la configuración del país…
        </span>
      </main>
    );
  }

  if (meta.isError) {
    const error = normalizeError(meta.error);
    return (
      <ErrorState
        fullScreen
        icon={ServerCrash}
        title="No pudimos cargar la configuración del país"
        description="Sin ella no se puede mostrar la aplicación. Revisa que el backend esté en línea."
        technicalDetail={
          <>
            GET {process.env.NEXT_PUBLIC_API_URL}/api/v1/meta/country
            <br />
            {error.code}
            {error.status ? ` · ${error.status}` : ""} · {error.message}
            {error.traceId && (
              <>
                <br />
                traceId {error.traceId}
              </>
            )}
          </>
        }
        actions={
          <Button className="button--fiscal" isPending={meta.isFetching} onPress={() => void meta.refetch()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (meta.data.code !== configured) {
    return <CountryMismatch fullScreen configured={configured} backendCode={meta.data.code} backendName={meta.data.name} />;
  }

  return children;
}

export interface CountryMismatchProps {
  /** NEXT_PUBLIC_PAIS. */
  configured: string;
  /** dbo.countryConfig.code según /api/v1/meta/country. */
  backendCode: string;
  backendName: string;
  fullScreen?: boolean;
}

/** Error de país: muestra ambos valores y cómo corregirlo. */
export function CountryMismatch({ configured, backendCode, backendName, fullScreen = false }: CountryMismatchProps) {
  const name = isCountryCode(backendCode) ? COUNTRY_TEXTS[backendCode].authorityOrg : backendName;
  return (
    <ErrorState
      fullScreen={fullScreen}
      icon={Globe}
      title="El país del frontend no coincide con el del backend"
      description={
        <div className="flex flex-col gap-3">
          <p>Los textos y las capacidades serían de países distintos, así que la aplicación no se muestra.</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-field bg-surface-secondary p-3 text-foreground">
            <dt className="text-muted">Frontend (NEXT_PUBLIC_PAIS)</dt>
            <dd className="font-mono font-semibold">{configured}</dd>
            <dt className="text-muted">Backend (countryConfig)</dt>
            <dd className="font-mono font-semibold">
              {backendCode} <span className="font-sans font-normal text-muted">· {name}</span>
            </dd>
          </dl>
          <p>Ajusta NEXT_PUBLIC_PAIS o la fila de dbo.countryConfig para que coincidan.</p>
        </div>
      }
    />
  );
}
