import { notFound } from "next/navigation";

// Páginas de prueba: solo existen en desarrollo.
export default function DevLayout({ children }: LayoutProps<"/dev">) {
  if (process.env.NODE_ENV !== "development") notFound();
  return children;
}
