"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSevenDrive } from "@/lib/store";
import {
  Car,
  UserCheck,
  Bell,
  Wrench,
  DollarSign,
  FileCheck,
  AlertTriangle,
  FileText,
  Sliders,
  Menu,
  X,
  CreditCard,
  History,
  Lock,
  Share2,
  Check,
  LogOut,
  ExternalLink,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    payments,
    activeAlerts,
    logoutAdmin,
    isAdminAuthenticated,
  } = useSevenDrive();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Verifica se está na área do motorista ou do administrador
  const isMotoristaRoute = pathname.startsWith("/motorista");

  const pendingConferenceCount = payments.filter(
    (p) => p.status === "pendente_conferencia"
  ).length;

  interface NavLink {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  const adminLinks: NavLink[] = [
    { href: "/admin", label: "Dashboard", icon: Car },
    {
      href: "/admin/conferencia",
      label: "Fila de Conferência",
      icon: FileCheck,
      badge: pendingConferenceCount,
    },
    { href: "/admin/veiculos", label: "Veículos & CRLV", icon: Car },
    { href: "/admin/motoristas", label: "Motoristas & CNH", icon: UserCheck },
    { href: "/admin/pagamentos", label: "Gestão Financeira", icon: DollarSign },
    {
      href: "/admin/manutencoes",
      label: "Revisões & KM",
      icon: Wrench,
      badge: activeAlerts.length,
      badgeColor: "bg-amber-500",
    },
    { href: "/admin/multas", label: "Multas & FICI", icon: FileText },
    { href: "/admin/configuracoes", label: "Configurações", icon: Sliders },
  ];

  const driverLinks: NavLink[] = [
    { href: "/motorista", label: "Meu Veículo", icon: Car },
    { href: "/motorista/pagar", label: "Pagar & Vistoria", icon: CreditCard },
    { href: "/motorista/manutencao", label: "Enviar Revisão/KM", icon: Wrench },
    { href: "/motorista/historico", label: "Histórico", icon: History },
  ];

  const currentLinks = isMotoristaRoute ? driverLinks : adminLinks;

  const handleCopyDriverLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const origin = window.location.origin;
      const driverUrl = `${origin}/motorista`;
      navigator.clipboard.writeText(driverUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleAdminLock = () => {
    logoutAdmin();
    router.push("/admin");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Identificação de Portal */}
          <div className="flex items-center gap-6">
            <Link
              href={isMotoristaRoute ? "/motorista" : "/admin"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    SEVEN <span className="text-blue-500">DRIVE</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isMotoristaRoute
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    }`}
                  >
                    {isMotoristaRoute ? "Portal do Motorista" : "Área do Locador"}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-400 block -mt-1">
                  Gestão Inteligente de Frotas
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {currentLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {Boolean(link.badge) && link.badge! > 0 && (
                      <span
                        className={`ml-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full text-white ${
                          link.badgeColor || "bg-red-500 animate-pulse"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Área Direita */}
          <div className="flex items-center gap-2.5">
            {/* Apenas na Área do Administrador: Botão Copiar Link do Motorista */}
            {!isMotoristaRoute && (
              <button
                type="button"
                onClick={handleCopyDriverLink}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  copiedLink
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700"
                }`}
                title="Copiar link exclusivo do portal do motorista"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link do Motorista</span>
                  </>
                )}
              </button>
            )}

            {/* Sino de Notificações */}
            <div className="relative">
              <button
                onClick={() => setAlertDropdownOpen(!alertDropdownOpen)}
                className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Notificações e Alertas"
              >
                <Bell className="w-5 h-5" />
                {(activeAlerts.length > 0 || pendingConferenceCount > 0) && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {alertDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Notificações do Sistema
                    </h4>
                    <span className="text-[10px] text-zinc-400">
                      {activeAlerts.length + pendingConferenceCount} pendências
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
                    {pendingConferenceCount > 0 && !isMotoristaRoute && (
                      <Link
                        href="/admin/conferencia"
                        onClick={() => setAlertDropdownOpen(false)}
                        className="block p-2.5 rounded-xl bg-blue-950/40 border border-blue-800 hover:bg-blue-900/40 transition"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                          <FileCheck className="w-4 h-4 text-blue-400" />
                          <span>Fila de Conferência</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 mt-1">
                          {pendingConferenceCount} pagamento(s) com fotos de vistoria aguardando conferência.
                        </p>
                      </Link>
                    )}

                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          alert.tipo === "urgente"
                            ? "bg-red-950/40 border-red-800 text-red-200"
                            : "bg-amber-950/40 border-amber-800 text-amber-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{alert.itemNome} ({alert.vehiclePlaca})</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">{alert.mensagem}</p>
                      </div>
                    ))}

                    {pendingConferenceCount === 0 && activeAlerts.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">
                        Nenhum alerta pendente no momento.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Apenas na Área do Administrador: Botão de Bloquear / Sair */}
            {!isMotoristaRoute && (
              <button
                type="button"
                onClick={handleAdminLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition"
                title="Bloquear Painel do Administrador"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800 space-y-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {Boolean(link.badge) && link.badge! > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {!isMotoristaRoute && (
              <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyDriverLink}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-200 border border-zinc-700"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>{copiedLink ? "Link Copiado!" : "Copiar Link do Motorista"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLock}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 text-xs font-bold text-red-300 border border-red-800"
                >
                  <Lock className="w-4 h-4" />
                  <span>Bloquear Área de Administrador</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
