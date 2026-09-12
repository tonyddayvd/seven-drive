"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Profile, Contract } from "@/types/database";
import { formatCPF, formatPhone, formatCurrency, formatDate, formatPlate } from "@/lib/utils";
import {
  UserCheck,
  Plus,
  Edit,
  FileText,
  Upload,
  CheckCircle2,
  Car,
  Calendar,
  X,
  Link as LinkIcon,
} from "lucide-react";

export default function MotoristasPage() {
  const {
    profiles,
    vehicles,
    contracts,
    addDriver,
    updateDriver,
    addContract,
    updateContract,
  } = useSevenDrive();

  const [activeTab, setActiveTab] = useState<"drivers" | "contracts">("drivers");
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Profile | null>(null);

  // Form State Driver
  const [driverForm, setDriverForm] = useState({
    email: "",
    full_name: "",
    role: "driver" as const,
    cpf: "",
    rg: "",
    telefone: "",
    endereco: "",
    contato_emergencia: "",
    cnh_numero: "",
    cnh_categoria: "B",
    cnh_validade: "2028-01-01",
    cnh_url: "/placeholder-cnh.pdf",
  });

  // Form State Contract
  const [contractForm, setContractForm] = useState({
    vehicle_id: vehicles[0]?.id || "",
    driver_id: profiles.find((p) => p.role === "driver")?.id || "",
    valor_aluguel: 650,
    periodicidade: "semanal" as const,
    dia_vencimento: 5,
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    status: "ativo" as const,
    observacoes: "",
  });

  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setDriverForm({
      email: "",
      full_name: "",
      role: "driver",
      cpf: "",
      rg: "",
      telefone: "",
      endereco: "",
      contato_emergencia: "",
      cnh_numero: "",
      cnh_categoria: "B",
      cnh_validade: "2028-01-01",
      cnh_url: "/placeholder-cnh.pdf",
    });
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriver = (d: Profile) => {
    setEditingDriver(d);
    setDriverForm({
      email: d.email,
      full_name: d.full_name,
      role: "driver",
      cpf: d.cpf || "",
      rg: d.rg || "",
      telefone: d.telefone || "",
      endereco: d.endereco || "",
      contato_emergencia: d.contato_emergencia || "",
      cnh_numero: d.cnh_numero || "",
      cnh_categoria: d.cnh_categoria || "B",
      cnh_validade: d.cnh_validade || "2028-01-01",
      cnh_url: d.cnh_url || "/placeholder-cnh.pdf",
    });
    setIsDriverModalOpen(true);
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, driverForm);
    } else {
      addDriver(driverForm);
    }
    setIsDriverModalOpen(false);
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContract({
      vehicle_id: contractForm.vehicle_id,
      driver_id: contractForm.driver_id,
      valor_aluguel: Number(contractForm.valor_aluguel),
      periodicidade: contractForm.periodicidade,
      dia_vencimento: Number(contractForm.dia_vencimento),
      data_inicio: contractForm.data_inicio,
      data_fim: contractForm.data_fim || null,
      status: contractForm.status,
      observacoes: contractForm.observacoes,
    });
    setIsContractModalOpen(false);
  };

  const driversList = profiles.filter((p) => p.role === "driver");

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Motoristas & Gestão de Contratos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastro completo de locatários com guarda fixa de CNH e vinculação flexível de contratos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddDriver}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Motorista</span>
          </button>
          <button
            onClick={() => setIsContractModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("drivers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "drivers"
              ? "bg-blue-600 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          Motoristas Cadastrados ({driversList.length})
        </button>
        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "contracts"
              ? "bg-blue-600 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          Contratos & Vinculações ({contracts.length})
        </button>
      </div>

      {/* Visualização de Motoristas */}
      {activeTab === "drivers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {driversList.map((driver) => {
            const activeContract = contracts.find(
              (c) => c.driver_id === driver.id && c.status === "ativo"
            );
            const assignedVehicle = vehicles.find((v) => v.id === activeContract?.vehicle_id);

            return (
              <div
                key={driver.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{driver.full_name}</h3>
                    <p className="text-xs text-zinc-400">{driver.email}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEditDriver(driver)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">CPF:</span>
                    <span className="font-mono text-zinc-200">{formatCPF(driver.cpf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Telefone:</span>
                    <span className="text-zinc-200">{formatPhone(driver.telefone)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">CNH:</span>
                    <span className="font-mono text-zinc-200">
                      {driver.cnh_numero} (Cat. {driver.cnh_categoria})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Emergência:</span>
                    <span className="text-zinc-300 text-[11px] truncate max-w-[180px]">
                      {driver.contato_emergencia || "-"}
                    </span>
                  </div>
                </div>

                {/* Veículo Vinculado */}
                <div className="bg-zinc-800/40 rounded-xl p-2.5 border border-zinc-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-400" />
                    {assignedVehicle ? (
                      <span className="font-semibold text-white">
                        {assignedVehicle.marca} {assignedVehicle.modelo} ({formatPlate(assignedVehicle.placa)})
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic">Sem veículo vinculado</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      assignedVehicle
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {assignedVehicle ? "Ativo" : "Livre"}
                  </span>
                </div>

                {/* Documento CNH Fixo */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Documento CNH</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Arquivada (Fixa)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visualização de Contratos */}
      {activeTab === "contracts" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Motorista (Locatário)</th>
                  <th className="py-3.5 px-4">Veículo Alugado</th>
                  <th className="py-3.5 px-4">Valor Aluguel</th>
                  <th className="py-3.5 px-4">Periodicidade</th>
                  <th className="py-3.5 px-4">Dia Vencimento</th>
                  <th className="py-3.5 px-4">Data Início</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {contracts.map((c) => {
                  const driver = profiles.find((d) => d.id === c.driver_id);
                  const vehicle = vehicles.find((v) => v.id === c.vehicle_id);

                  return (
                    <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {driver?.full_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold">
                          {formatPlate(vehicle?.placa)}
                        </span>
                        <span className="block text-[11px] text-zinc-400 mt-0.5">
                          {vehicle?.marca} {vehicle?.modelo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatCurrency(c.valor_aluguel)}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-zinc-300">
                        {c.periodicidade}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        {c.periodicidade === "semanal"
                          ? `Toda ${c.dia_vencimento === 5 ? "Sexta-feira" : `Dia ${c.dia_vencimento}`}`
                          : `Todo dia ${c.dia_vencimento}`}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {formatDate(c.data_inicio)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            c.status === "ativo"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Motorista */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingDriver ? "Editar Motorista" : "Cadastrar Novo Motorista"}
              </h3>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nome Completo:</label>
                <input
                  type="text"
                  value={driverForm.full_name}
                  onChange={(e) => setDriverForm({ ...driverForm, full_name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">E-mail:</label>
                  <input
                    type="email"
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Telefone/WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-8888"
                    value={driverForm.telefone}
                    onChange={(e) => setDriverForm({ ...driverForm, telefone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">CPF:</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={driverForm.cpf}
                    onChange={(e) => setDriverForm({ ...driverForm, cpf: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">RG:</label>
                  <input
                    type="text"
                    value={driverForm.rg}
                    onChange={(e) => setDriverForm({ ...driverForm, rg: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Nº CNH:</label>
                  <input
                    type="text"
                    value={driverForm.cnh_numero}
                    onChange={(e) => setDriverForm({ ...driverForm, cnh_numero: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Categoria:</label>
                  <select
                    value={driverForm.cnh_categoria}
                    onChange={(e) => setDriverForm({ ...driverForm, cnh_categoria: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Validade CNH:</label>
                  <input
                    type="date"
                    value={driverForm.cnh_validade}
                    onChange={(e) => setDriverForm({ ...driverForm, cnh_validade: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Endereço Completo:</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro, cidade/UF"
                  value={driverForm.endereco}
                  onChange={(e) => setDriverForm({ ...driverForm, endereco: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Contato de Emergência:</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98888-1111 (Mãe Rosa)"
                  value={driverForm.contato_emergencia}
                  onChange={(e) => setDriverForm({ ...driverForm, contato_emergencia: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* Upload de Documento Fixo: CNH */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <label className="block text-zinc-300 font-semibold mb-1">
                  Upload de Documento Fixo: CNH (PDF ou Imagem)
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Armazenado no bucket permanente do Supabase Storage.
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer border border-zinc-700">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Selecionar CNH</span>
                    <input type="file" accept=".pdf,image/*" className="hidden" />
                  </label>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Documento fixado
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Motorista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Contrato */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Criar Contrato de Locação</h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContractSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Selecionar Motorista:</label>
                <select
                  value={contractForm.driver_id}
                  onChange={(e) => setContractForm({ ...contractForm, driver_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                >
                  {driversList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({formatCPF(d.cpf)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Selecionar Veículo:</label>
                <select
                  value={contractForm.vehicle_id}
                  onChange={(e) => setContractForm({ ...contractForm, vehicle_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Valor do Aluguel (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={contractForm.valor_aluguel}
                    onChange={(e) => setContractForm({ ...contractForm, valor_aluguel: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Periodicidade:</label>
                  <select
                    value={contractForm.periodicidade}
                    onChange={(e) => setContractForm({ ...contractForm, periodicidade: e.target.value as any })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Dia de Vencimento:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={contractForm.dia_vencimento}
                    onChange={(e) => setContractForm({ ...contractForm, dia_vencimento: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                  <span className="text-[10px] text-zinc-500">
                    {contractForm.periodicidade === "semanal" ? "1=Segunda, 5=Sexta, 7=Domingo" : "Dia do mês (1 a 31)"}
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data Início:</label>
                  <input
                    type="date"
                    value={contractForm.data_inicio}
                    onChange={(e) => setContractForm({ ...contractForm, data_inicio: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Observações do Contrato:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Franquia de quilometragem, valor de caução, etc."
                  value={contractForm.observacoes}
                  onChange={(e) => setContractForm({ ...contractForm, observacoes: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Ativar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
