import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SevenDriveProvider } from "@/lib/store";
import { Navbar } from "@/components/navigation/Navbar";
import { BlinkingAlertBanner } from "@/components/visual-alerts/BlinkingAlertBanner";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Seven Drive - Gestão Inteligente de Frota e Locação",
  description: "Sistema completo de gestão de veículos, contratos, vistorias obrigatórias e manutenções com custo R$ 0,00 de infraestrutura.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seven Drive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Seven Drive" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
        <SevenDriveProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <BlinkingAlertBanner />
            {children}
          </main>
          <PwaInstallPrompt />
          <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Seven Drive &copy; {new Date().getFullYear()} — Todos os direitos reservados.</span>
              <span className="text-zinc-600">Arquitetura Serverless Free Tier: Next.js + Supabase (R$ 0,00/mês)</span>
            </div>
          </footer>
        </SevenDriveProvider>
      </body>
    </html>
  );
}
