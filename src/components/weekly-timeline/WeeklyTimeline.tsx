"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatDate, isPaymentLate } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, Calendar, Car } from "lucide-react";

export function WeeklyTimeline() {
  const { payments, vehicles, contracts } = useSevenDrive();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  const existingVehicleIds = new Set(vehicles.map((v) => v.id));

  // Filtra por veículo selecionado E apenas veículos que realmente existem
  const filteredPayments = payments
    .filter((p) => existingVehicleIds.has(p.vehicle_id))
    .filter((p) => selectedVehicle === "all" || p.vehicle_id === selectedVehicle);

  // Cálculo das 4 semanas dinâmicas em torno da semana atual (a partir da data de hoje)
  const getDynamicWeeks = () => {
    const today = new Date();
    // Encontra a segunda-feira da semana atual
    const day = today.getDay();
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const currentMonday = new Date(today.setDate(diffToMonday));

    const result = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(currentMonday);
      start.setDate(start.getDate() + (i * 7));

      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      const d = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

      const formatShort = (date: Date) => {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        return `${dd}/${mm}`;
      };

      const toISO = (date: Date) => date.toISOString().split("T")[0];

      result.push({
        id: `${start.getFullYear()}-${weekNo}`,
        label: `Semana ${weekNo} (${formatShort(start)} a ${formatShort(end)})`,
        range: `${formatShort(start)} - ${formatShort(end)}`,
        startDate: toISO(start),
        endDate: toISO(end),
        isCurrent: i === 0,
      });
    }
    return result;
  };

  const weeks = getDynamicWeeks();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Linha do Tempo Semanal de Pagamentos
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Status consolidado das semanas de locação com dia fixo de vencimento
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
            <option value="all">Todos os Veículos ({vehicles.length})</option>
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
          <span>🟡 Semana Atual / A Vencer</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>🔴 Atrasado</span>
        </div>
      </div>

      {/* Grid de Semanas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeks.map((week) => {
          const weekPayments = filteredPayments.filter((p) => {
            if (p.semana_ano && (p.semana_ano === week.id || p.semana_ano.endsWith(week.id.split("-")[1]))) {
              return true;
            }
            return p.data_vencimento >= week.startDate && p.data_vencimento <= week.endDate;
          });

          const hasOverdue = weekPayments.some(
            (p) => p.status === "atrasado" || (p.status === "pendente_envio" && isPaymentLate(p.data_vencimento, p.status))
          );
          const hasRejected = weekPayments.some((p) => p.status === "recusado");
          const hasPending = weekPayments.some(
            (p) => p.status === "pendente_envio" || p.status === "pendente_conferencia"
          );
          const allConfirmed =
            weekPayments.length > 0 && weekPayments.every((p) => p.status === "confirmado");

          let statusType: "green" | "yellow" | "red" = "yellow";
          if (hasOverdue || hasRejected) {
            statusType = "red";
          } else if (allConfirmed) {
            statusType = "green";
          } else if (hasPending || week.isCurrent) {
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
                  {weekPayments.length === 0
                    ? "Sem Lançamento"
                    : statusType === "green"
                    ? "Confirmada"
                    : statusType === "red"
                    ? "Em Atraso"
                    : "Em Aberto"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">
                {week.label.split(" (")[0]}
                {week.isCurrent && <span className="text-[10px] text-blue-400 font-normal ml-1.5">(Atual)</span>}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Recebido:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(totalSemana)}</span>
                </div>

                <div className="border-t border-zinc-800/80 pt-2 mt-2 space-y-1.5">
                  {weekPayments.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic">Nenhum pagamento nesta semana</p>
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
                              : p.status === "recusado"
                              ? "Recusado"
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
