"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: ReactNode;
  /** "← Iniciar sesión" arriba del título (recuperación). */
  backToLogin?: boolean;
  /** "Paso 2 de 3". */
  step?: string;
  /** Al montar, el foco pasa al título: anuncia el paso nuevo tras avanzar o retroceder. */
  focusTitle?: boolean;
  children: ReactNode;
}

export function AuthCard({ title, description, backToLogin, step, focusTitle, children }: AuthCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) headingRef.current?.focus();
  }, [focusTitle]);

  return (
    <section aria-labelledby="auth-card-title" className="bg-surface rounded-card w-full max-w-[400px] p-8 shadow-sm">
      {backToLogin && (
        <Link
          href="/login"
          className="bg-surface-secondary text-body hover:bg-default focus-visible:outline-accent mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 focus-visible:outline-2"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Iniciar sesión
        </Link>
      )}
      {step && <p className="text-small text-muted mb-1">{step}</p>}
      <h1 id="auth-card-title" ref={headingRef} tabIndex={-1} className="text-display outline-none">
        {title}
      </h1>
      <p className="text-muted mt-1 mb-5 text-[15px]">{description}</p>
      {children}
    </section>
  );
}
