import type { Metadata } from "next";
import "./globals.css";
import { SevenDriveProvider } from "@/lib/store";
import { Navbar } from "@/components/navigation/Navbar";
import { BlinkingAlertBanner } from "@/components/visual-alerts/BlinkingAlertBanner";

export const metadata: Metadata = {
  title: "Seven Drive - Gestão Inteligente de Frota e Locação",
  description: "Sistema completo de gestão de veículos, contratos, vistorias obrigatórias e manutenções com custo R$ 0,00 de infraestrutura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
        <SevenDriveProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <BlinkingAlertBanner />
            {children}
          </main>
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
