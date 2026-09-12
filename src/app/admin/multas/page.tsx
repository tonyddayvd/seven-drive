"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Fine } from "@/types/database";
import { formatCurrency, formatDate, formatDateTime, formatPlate } from "@/lib/utils";
import { FiciModal } from "@/components/fici-document/FiciModal";
import {
  FileText,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Printer,
  CheckCircle2,
  Car,
  Trash2,
  X,
  Clock,
  HardDrive,
} from "lucide-react";

export default function MultasPage() {
  const { fines, vehicles, profiles, addFine, updateFine } = useSevenDrive();

  const [selectedFineForFici, setSelectedFineForFici] = useState<Fine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: vehicles[0]?.id || "",
    driver_id: profiles.find((p) => p.role === "driver")?.id || "",
    auto_infracao: "",
    data_infracao: new Date().toISOString(),
    valor: 130.16,
    pontos: 4,
    orgao_emissor: "DETRAN-SP",
    descricao: "Excesso de velocidade até 20%",
    local_infracao: "Av. dos Bandeirantes, 2000",
    status_pagamento: "pendente" as Fine["status_pagamento"],
    status_transferencia_pontos: "pendente" as Fine["status_transferencia_pontos"],
  });

  const handleOpenFici = (fine: Fine) => {
    setSelectedFineForFici(fine);
    if (fine.status_transferencia_pontos === "pendente") {
      updateFine(fine.id, { status_transferencia_pontos: "fici_gerado" });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFine(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gestão de Multas & Transferência de Pontos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registro de infrações, impacto no saldo do veículo e geração automática do formulário FICI (CTB Art. 257).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Infração / Multa</span>
        </button>
      </div>

      {/* Card Informativo: Purga Automática de Mídia (60 Dias) */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Privacidade & Purga Automática (60 Dias)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ativo no Supabase Storage
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fotos de vistorias, comprovantes e notas com mais de 60 dias são excluídas automaticamente para economia de armazenamento e privacidade. Documentos <strong>CNH</strong> e <strong>CRLV</strong> permanecem fixos.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Multas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Auto de Infração</th>
                <th className="py-3.5 px-4">Veículo</th>
                <th className="py-3.5 px-4">Condutor Responsável</th>
                <th className="py-3.5 px-4">Data / Local</th>
                <th className="py-3.5 px-4">Valor</th>
                <th className="py-3.5 px-4">Pontos CNH</th>
                <th className="py-3.5 px-4">Status Pontos</th>
                <th className="py-3.5 px-4 text-right">Ação FICI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {fines.map((fine) => {
                const vehicle = vehicles.find((v) => v.id === fine.vehicle_id);
                const driver = profiles.find((d) => d.id === fine.driver_id);

                return (
                  <tr key={fine.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div>{fine.auto_infracao}</div>
                      <span className="text-[10px] text-zinc-500">{fine.orgao_emissor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold">
                        {formatPlate(vehicle?.placa)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-200">
                      {driver?.full_name || "Condutor não associado"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      <div>{formatDate(fine.data_infracao)}</div>
                      <span className="text-[10px] text-zinc-500 truncate max-w-xs block">
                        {fine.local_infracao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-400">
                      {formatCurrency(fine.valor)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-400 font-mono">
                      {fine.pontos} pts
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          fine.status_transferencia_pontos === "fici_gerado"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : fine.status_transferencia_pontos === "transferido"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {fine.status_transferencia_pontos === "fici_gerado"
                          ? "FICI Gerado"
                          : fine.status_transferencia_pontos === "transferido"
                          ? "Transferido"
                          : "Pendente"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenFici(fine)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 hover:text-white border border-zinc-700 transition font-bold"
                        title="Visualizar e Imprimir Formulário FICI"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Gerar FICI</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Multa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Cadastrar Nova Notificação de Infração</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Veículo:</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Motorista Infrator:</label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    {profiles
                      .filter((p) => p.role === "driver")
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Auto de Infração:</label>
                  <input
                    type="text"
                    placeholder="Ex: R12345678"
                    value={formData.auto_infracao}
                    onChange={(e) => setFormData({ ...formData, auto_infracao: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Órgão Emissor:</label>
                  <input
                    type="text"
                    placeholder="Ex: DETRAN-SP / DER"
                    value={formData.orgao_emissor}
                    onChange={(e) => setFormData({ ...formData, orgao_emissor: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Valor da Multa (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Pontos na CNH:</label>
                  <input
                    type="number"
                    value={formData.pontos}
                    onChange={(e) => setFormData({ ...formData, pontos: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Descrição da Infração:</label>
                <input
                  type="text"
                  placeholder="Ex: Transitar em velocidade superior à máxima em até 20%"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Local da Infração:</label>
                <input
                  type="text"
                  placeholder="Ex: Rodovia dos Imigrantes, Km 14"
                  value={formData.local_infracao}
                  onChange={(e) => setFormData({ ...formData, local_infracao: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Infração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal FICI */}
      {selectedFineForFici && (
        <FiciModal
          fine={selectedFineForFici}
          vehicle={vehicles.find((v) => v.id === selectedFineForFici.vehicle_id)}
          driver={profiles.find((d) => d.id === selectedFineForFici.driver_id)}
          onClose={() => setSelectedFineForFici(null)}
        />
      )}
    </div>
  );
}
