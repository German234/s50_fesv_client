import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facturación electrónica",
  description: "Plataforma de facturación electrónica SV/DO",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes cambia la clase de <html> antes de hidratar
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
