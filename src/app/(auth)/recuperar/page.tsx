import type { Metadata } from "next";
import { RecoverFlow } from "@/features/auth/components/RecoverFlow";

export const metadata: Metadata = { title: "Recuperar contraseña · Facturación electrónica" };

export default function RecoverPage() {
  return <RecoverFlow />;
}
