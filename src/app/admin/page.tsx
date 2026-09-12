"use client";

import React from "react";
import Link from "next/link";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatKM, formatPlate } from "@/lib/utils";
import { WeeklyTimeline } from "@/components/weekly-timeline/WeeklyTimeline";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Car,
  FileCheck,
  AlertTriangle,
  ArrowUpRight,
  Wrench,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const {
    vehicles,
    payments,
    maintenances,
    fines,
    expenses,
    getVehicleFinancialSummary,
    activeAlerts,
  } = useSevenDrive();

  const { clearOrphanMockData } = useSevenDrive();

  // Executa limpeza automática de resquícios de veículos excluídos
  React.useEffect(() => {
    clearOrphanMockData();
  }, [vehicles.length]);

  const existingVehicleIds = new Set(vehicles.map((v) => v.id));

  // Cálculos Consolidados de Toda a Frota (Apenas veículos reais cadastrados!)
  const totalReceitas = payments
    .filter((p) => p.status === "confirmado" && existingVehicleIds.has(p.vehicle_id))
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const totalManutencoes = maintenances
    .filter((m) => existingVehicleIds.has(m.vehicle_id))
    .reduce((acc, curr) => acc + Number(curr.valor_custo || 0), 0);

  const totalMultas = fines
    .filter((f) => f.status_pagamento === "pago_locador" && existingVehicleIds.has(f.vehicle_id))
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const totalDespesas = expenses
    .filter((e) => existingVehicleIds.has(e.vehicle_id))
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const totalCustos = totalManutencoes + totalMultas + totalDespesas;
  const saldoLiquidoGeral = totalReceitas - totalCustos;

  const pendingPayments = payments.filter((p) => p.status === "pendente_conferencia" && existingVehicleIds.has(p.vehicle_id));

  return (
    <div className="space-y-8">
      {/* Título e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Painel Executivo do Locador
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Visão financeira consolidada, saldo líquido por veículo e status operacional da frota.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/conferencia"
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>Fila de Conferência</span>
            {pendingPayments.length > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                {pendingPayments.length}
              </span>
            )}
          </Link>

          <Link
            href="/admin/pagamentos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Gerenciar Pagamentos</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas Financeiras Consolidadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Bruta (Aluguéis)</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalReceitas)}</div>
          <span className="text-xs text-zinc-500 mt-1 block">
            Apenas pagamentos confirmados
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Custos & Despesas</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalCustos)}</div>
          <span className="text-xs text-zinc-500 mt-1 block">
            Manutenções, multas e taxas
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Líquido Real</span>
            <div className={`p-2 rounded-xl ${saldoLiquidoGeral >= 0 ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${saldoLiquidoGeral >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(saldoLiquidoGeral)}
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            Consolidado líquido de toda a frota
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fila & Alertas de KM</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {pendingPayments.length} <span className="text-xs font-normal text-zinc-400">pag. /</span> {activeAlerts.length} <span className="text-xs font-normal text-zinc-400">rev.</span>
          </div>
          <span className="text-xs text-amber-400 mt-1 block">
            Ações pendentes do administrador
          </span>
        </div>
      </div>

      {/* Linha do Tempo Semanal de Pagamentos */}
      <WeeklyTimeline />

      {/* Tabela de Saldo Real Consolidado por Veículo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Saldo Líquido Real por Veículo
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cálculo automatizado abatendo custos operacionais individuais de cada veículo
            </p>
          </div>
          <Link
            href="/admin/veiculos"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Ver todos os veículos &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Placa / KM Oficial</th>
                <th className="py-3 px-4">Receitas (Aluguéis)</th>
                <th className="py-3 px-4">Manutenções</th>
                <th className="py-3 px-4">Multas / Despesas</th>
                <th className="py-3 px-4 font-bold text-right">Saldo Líquido Real</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {vehicles.map((veh) => {
                const financial = getVehicleFinancialSummary(veh.id);

                return (
                  <tr key={veh.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{veh.marca} {veh.modelo}</div>
                      <span className="text-[10px] text-zinc-500">Ano {veh.ano} • {veh.combustivel}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                        {formatPlate(veh.placa)}
                      </span>
                      <span className="block text-[11px] text-zinc-400 mt-1">
                        {formatKM(veh.km_atual)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      {formatCurrency(financial.receitas)}
                    </td>
                    <td className="py-3.5 px-4 text-red-400 font-semibold">
                      - {formatCurrency(financial.manutencoes)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-semibold">
                      - {formatCurrency(financial.multas + financial.despesas)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                          financial.saldoLiquido >= 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {formatCurrency(financial.saldoLiquido)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/veiculos`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition"
                      >
                        <span>Detalhes</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
