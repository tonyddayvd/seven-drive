"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { MaintenanceRule } from "@/types/database";
import { formatCurrency, formatKM, formatDate, formatPlate } from "@/lib/utils";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Car,
  BellRing,
  FileText,
  Clock,
  X,
  Sparkles,
} from "lucide-react";

export default function ManutencoesPage() {
  const {
    vehicles,
    maintenanceRules,
    maintenances,
    activeAlerts,
    addMaintenanceRule,
    updateMaintenanceRule,
    addMaintenance,
    triggerBrowserNotification,
  } = useSevenDrive();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form Rule State
  const [ruleForm, setRuleForm] = useState({
    nome_item: "",
    intervalo_km: 10000,
    alerta_amarelo_km: 1000,
    alerta_vermelho_km: 500,
    ativo: true,
  });

  // Form Log Maintenance State
  const [logForm, setLogForm] = useState({
    vehicle_id: vehicles[0]?.id || "",
    tipo_item: maintenanceRules[0]?.nome_item || "Troca de Óleo",
    km_realizado: 38000,
    data_realizada: new Date().toISOString().split("T")[0],
    valor_custo: 250,
    foto_nota_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80",
    foto_odometro_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80",
    observacoes: "Manutenção realizada e notas anexadas.",
    status: "concluido" as const,
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceRule(ruleForm);
    setIsRuleModalOpen(false);
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenance(logForm);
    setIsLogModalOpen(false);
    triggerBrowserNotification(
      "Seven Drive - Manutenção Registrada",
      `Manutenção de ${logForm.tipo_item} registrada com sucesso aos ${formatKM(logForm.km_realizado)}.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Manutenção Preventiva & Alertas de KM
            </h1>
            {activeAlerts.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                {activeAlerts.length} alerta(s) ativo(s)
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Parametrização customizada de KM, monitoramento de revisões e alertas duplos (1.000 km e 500 km).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition"
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Parametrizar Regra de KM</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Revisão Realizada</span>
          </button>
        </div>
      </div>

      {/* Monitor de Saúde da Frota: Próximas Revisões por Veículo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-500" />
          Proximidade de Revisões por Veículo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((veh) => {
            return (
              <div
                key={veh.id}
                className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs">
                    {formatPlate(veh.placa)}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatKM(veh.km_atual)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {maintenanceRules.map((rule) => {
                    const lastMaint = maintenances
                      .filter(
                        (m) =>
                          m.vehicle_id === veh.id &&
                          m.tipo_item.toLowerCase().includes(rule.nome_item.toLowerCase())
                      )
                      .sort((a, b) => b.km_realizado - a.km_realizado)[0];

                    const kmBase = lastMaint ? lastMaint.km_realizado : veh.km_inicial;
                    const kmProxima = kmBase + rule.intervalo_km;
                    const kmRestante = kmProxima - veh.km_atual;

                    const isUrgent = kmRestante <= rule.alerta_vermelho_km;
                    const isWarning = !isUrgent && kmRestante <= rule.alerta_amarelo_km;

                    return (
                      <div
                        key={rule.id}
                        className={`p-2 rounded-lg text-xs border ${
                          isUrgent
                            ? "bg-red-950/30 border-red-500/60 text-red-200"
                            : isWarning
                            ? "bg-amber-950/30 border-amber-500/60 text-amber-200"
                            : "bg-zinc-900 border-zinc-800/80 text-zinc-300"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{rule.nome_item}</span>
                          <span
                            className={`font-mono font-bold ${
                              isUrgent ? "text-red-400" : isWarning ? "text-amber-400" : "text-zinc-400"
                            }`}
                          >
                            {kmRestante <= 0 ? "VENCIDA!" : `Faltam ${formatKM(kmRestante)}`}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isUrgent
                                ? "bg-red-500 animate-pulse"
                                : isWarning
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, ((rule.intervalo_km - Math.max(0, kmRestante)) / rule.intervalo_km) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regras Parametrizadas Cadastradas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          Regras de Manutenção Parametrizadas
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-4">Item de Manutenção</th>
                <th className="py-3 px-4">Intervalo Definido</th>
                <th className="py-3 px-4">Alerta Amarelo (Atenção)</th>
                <th className="py-3 px-4">Alerta Vermelho (Urgência)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {maintenanceRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{rule.nome_item}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">
                    A cada {rule.intervalo_km.toLocaleString("pt-BR")} km
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400">
                    Faltando {rule.alerta_amarelo_km.toLocaleString("pt-BR")} km
                  </td>
                  <td className="py-3 px-4 font-mono text-red-400 font-bold">
                    Faltando {rule.alerta_vermelho_km.toLocaleString("pt-BR")} km
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico de Manutenções Realizadas e Evidências */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          Histórico de Revisões & Evidências
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Item Revisado</th>
                <th className="py-3 px-4">KM Realizado</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Custo</th>
                <th className="py-3 px-4">Evidências (Nota + Odômetro)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {maintenances.map((m) => {
                const veh = vehicles.find((v) => v.id === m.vehicle_id);

                return (
                  <tr key={m.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {veh?.placa} ({veh?.modelo})
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-200">{m.tipo_item}</td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{formatKM(m.km_realizado)}</td>
                    <td className="py-3 px-4 text-zinc-400">{formatDate(m.data_realizada)}</td>
                    <td className="py-3 px-4 font-bold text-red-400">{formatCurrency(m.valor_custo)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {m.foto_nota_url && (
                          <a
                            href={m.foto_nota_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-[11px] border border-zinc-700"
                          >
                            Ver Nota Fiscal
                          </a>
                        )}
                        {m.foto_odometro_url && (
                          <a
                            href={m.foto_odometro_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] border border-zinc-700"
                          >
                            Foto Odômetro
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Parametrizar Regra */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Parametrizar Nova Regra de KM</h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome do Item:</label>
                <input
                  type="text"
                  placeholder="Ex: Correia Dentada, Amortecedores, etc."
                  value={ruleForm.nome_item}
                  onChange={(e) => setRuleForm({ ...ruleForm, nome_item: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Intervalo de KM:</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={ruleForm.intervalo_km}
                  onChange={(e) => setRuleForm({ ...ruleForm, intervalo_km: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">Alerta Atenção (KM):</label>
                  <input
                    type="number"
                    value={ruleForm.alerta_amarelo_km}
                    onChange={(e) => setRuleForm({ ...ruleForm, alerta_amarelo_km: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                  <span className="text-[10px] text-zinc-500">Padrão: 1.000 km</span>
                </div>

                <div>
                  <label className="block text-red-400 font-semibold mb-1">Alerta Urgente (KM):</label>
                  <input
                    type="number"
                    value={ruleForm.alerta_vermelho_km}
                    onChange={(e) => setRuleForm({ ...ruleForm, alerta_vermelho_km: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                  <span className="text-[10px] text-zinc-500">Padrão: 500 km</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançar Manutenção Realizada */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Lançar Manutenção Realizada</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Veículo:</label>
                <select
                  value={logForm.vehicle_id}
                  onChange={(e) => setLogForm({ ...logForm, vehicle_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} ({v.modelo}) - Atual: {formatKM(v.km_atual)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Item Revisado:</label>
                <input
                  type="text"
                  value={logForm.tipo_item}
                  onChange={(e) => setLogForm({ ...logForm, tipo_item: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">KM Realizado:</label>
                  <input
                    type="number"
                    value={logForm.km_realizado}
                    onChange={(e) => setLogForm({ ...logForm, km_realizado: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Valor Custo (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={logForm.valor_custo}
                    onChange={(e) => setLogForm({ ...logForm, valor_custo: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
