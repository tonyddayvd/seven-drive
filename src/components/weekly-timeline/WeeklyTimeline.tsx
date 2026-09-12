"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, Calendar, Car } from "lucide-react";

export function WeeklyTimeline() {
  const { payments, vehicles, contracts } = useSevenDrive();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  // Filtra por veículo selecionado
  const filteredPayments = selectedVehicle === "all"
    ? payments
    : payments.filter((p) => p.vehicle_id === selectedVehicle);

  // Semanas simuladas cobrindo período atual (Setembro/2026)
  const weeks = [
    {
      id: "2026-35",
      label: "Semana 35 (24/08 a 30/08)",
      range: "24/08 - 30/08",
    },
    {
      id: "2026-36",
      label: "Semana 36 (31/08 a 06/09)",
      range: "31/08 - 06/09",
    },
    {
      id: "2026-37",
      label: "Semana 37 (07/09 a 13/09) - Atual",
      range: "07/09 - 13/09",
    },
    {
      id: "2026-38",
      label: "Semana 38 (14/09 a 20/09)",
      range: "14/09 - 20/09",
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Linha do Tempo Semanal de Pagamentos
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Status consolidado das semanas de locação de cada veículo
          </p>
        </div>

        {/* Seletor de Veículo */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-400">Veículo:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Veículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-5 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
        <span className="font-semibold text-zinc-300">Legenda:</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>🟢 Pago & Confirmado</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>🟡 Semana Atual / A Vencer (1 a 2 dias)</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>🔴 Atrasado</span>
        </div>
      </div>

      {/* Grid de Semanas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeks.map((week) => {
          const weekPayments = filteredPayments.filter(
            (p) => p.semana_ano === week.id || (p.data_vencimento >= "2026-09-07" && week.id === "2026-37")
          );

          // Determina o status da semana
          const hasOverdue = weekPayments.some((p) => p.status === "atrasado");
          const hasPending = weekPayments.some(
            (p) => p.status === "pendente_envio" || p.status === "pendente_conferencia"
          );
          const allConfirmed =
            weekPayments.length > 0 && weekPayments.every((p) => p.status === "confirmado");

          let statusType: "green" | "yellow" | "red" = "yellow";
          if (hasOverdue) {
            statusType = "red";
          } else if (allConfirmed) {
            statusType = "green";
          } else if (hasPending) {
            statusType = "yellow";
          }

          const borderColors = {
            green: "border-emerald-500/60 bg-emerald-950/20 hover:border-emerald-500",
            yellow: "border-amber-500/60 bg-amber-950/20 hover:border-amber-500",
            red: "border-red-500/60 bg-red-950/20 hover:border-red-500",
          };

          const badgeColors = {
            green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            yellow: "bg-amber-500/20 text-amber-300 border-amber-500/30",
            red: "bg-red-500/20 text-red-300 border-red-500/30",
          };

          const totalSemana = weekPayments
            .filter((p) => p.status === "confirmado")
            .reduce((acc, curr) => acc + Number(curr.valor), 0);

          return (
            <div
              key={week.id}
              className={`rounded-xl border p-4 transition-all duration-200 shadow-sm ${borderColors[statusType]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-zinc-400">{week.range}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColors[statusType]}`}
                >
                  {statusType === "green"
                    ? "Confirmada"
                    : statusType === "red"
                    ? "Em Atraso"
                    : "Em Aberto"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{week.label.split(" (")[0]}</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Recebido:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(totalSemana)}</span>
                </div>

                <div className="border-t border-zinc-800/80 pt-2 mt-2 space-y-1.5">
                  {weekPayments.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic">Nenhum pagamento agendado</p>
                  ) : (
                    weekPayments.map((p) => {
                      const veh = vehicles.find((v) => v.id === p.vehicle_id);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-[11px] bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800"
                        >
                          <span className="font-medium text-zinc-300 flex items-center gap-1">
                            <Car className="w-3 h-3 text-zinc-500" />
                            {veh?.placa || "Veículo"}
                          </span>
                          <span
                            className={`font-semibold ${
                              p.status === "confirmado"
                                ? "text-emerald-400"
                                : p.status === "pendente_conferencia"
                                ? "text-blue-400"
                                : "text-amber-400"
                            }`}
                          >
                            {p.status === "confirmado"
                              ? "Pago"
                              : p.status === "pendente_conferencia"
                              ? "Conferir"
                              : "Pendente"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
