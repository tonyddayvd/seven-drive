"use client";

import React from "react";
import Link from "next/link";
import { useSevenDrive } from "@/lib/store";
import { WeeklyTimeline } from "@/components/weekly-timeline/WeeklyTimeline";
import {
  Car,
  ShieldCheck,
  CreditCard,
  Camera,
  Wrench,
  FileCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { currentUser, setCurrentUser, profiles, vehicles, payments, activeAlerts } = useSevenDrive();

  const pendingConferenceCount = payments.filter((p) => p.status === "pendente_conferencia").length;
  const activeVehiclesCount = vehicles.filter((v) => v.status === "alugado").length;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/40 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Infraestrutura Permanente R$ 0,00/mês</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Gestão Total de Frota, Pagamentos e Vistorias Digitais
          </h1>

          <p className="text-base text-zinc-300 leading-relaxed">
            O <strong>Seven Drive</strong> une o controle financeiro rigoroso do Locador com a facilidade do Motorista: vistorias obrigatórias em 6 fotos com validação de odômetro, baixa de PIX em 1 clique, alertas piscantes de revisão de KM e controle de multas.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition"
            >
              <Car className="w-4 h-4" />
              <span>Painel do Locador (Admin)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/motorista"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Portal do Motorista (Locatário)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards de Destaque Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Veículos na Frota</span>
            <Car className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-white">{vehicles.length}</div>
          <span className="text-xs text-emerald-400 mt-1 block">
            {activeVehiclesCount} atualmente alugados
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fila de Conferência</span>
            <FileCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{pendingConferenceCount}</div>
          <span className="text-xs text-zinc-400 mt-1 block">
            {pendingConferenceCount > 0 ? "Aguardando conferência de vistoria" : "Fila zerada"}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Alertas de Revisão</span>
            <Wrench className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeAlerts.length}</div>
          <span className="text-xs text-red-400 mt-1 block">
            {activeAlerts.filter((a) => a.tipo === "urgente").length} urgentes (&le; 500 km)
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vistoria Digital</span>
            <Camera className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">6 Ângulos</div>
          <span className="text-xs text-zinc-400 mt-1 block">
            Frente, laterais, traseira, interior e KM
          </span>
        </div>
      </div>

      {/* Linha do Tempo Semanal */}
      <WeeklyTimeline />
    </div>
  );
}
