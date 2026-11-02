"use client";

import type { ReactNode } from "react";
import { useSessionExpiry } from "../queries";

/** Envuelve (app): cierra la sesión al vencer el token. El acceso sin cookie lo corta src/proxy.ts. */
export function SessionGuard({ children }: { children: ReactNode }) {
  useSessionExpiry();
  return children;
}
