import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "QRclima - Agenda y herramientas para técnicos de refrigeración",
  description: "Todo tu día como técnico, claro y bajo control. Agenda visual, diagnóstico técnico y herramientas reales para el técnico de refrigeración y clima.",
  keywords: ["qrclima", "técnico refrigeración", "agenda técnicos", "diagnóstico HVAC", "herramientas clima"],
  authors: [{ name: "QRclima" }],
  openGraph: {
    title: "QRclima - Agenda y herramientas para técnicos de refrigeración",
    description: "Agenda visual, diagnóstico técnico y herramientas reales. Ve hoy, mañana y la semana completa en segundos.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRclima - Todo tu día como técnico, claro y bajo control",
    description: "Agenda visual, diagnóstico técnico y herramientas reales para el técnico de refrigeración.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
