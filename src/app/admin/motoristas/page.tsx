"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Profile, Contract } from "@/types/database";
import { formatCPF, formatPhone, formatCurrency, formatDate, formatPlate } from "@/lib/utils";
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  FileText,
  Upload,
  CheckCircle2,
  Car,
  Calendar,
  X,
  Link as LinkIcon,
  Eye,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function MotoristasPage() {
  const {
    profiles,
    vehicles,
    contracts,
    addDriver,
    updateDriver,
    deleteDriver,
    addContract,
    updateContract,
    deleteContract,
    generateWeeklyPaymentsForContract,
  } = useSevenDrive();

  const [activeTab, setActiveTab] = useState<"drivers" | "contracts">("drivers");
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Profile | null>(null);
  const [cnhFileName, setCnhFileName] = useState<string>("");
  const [viewingCnhUrl, setViewingCnhUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    cnh_url: "",
  });

  // Form State Contract
  const [contractForm, setContractForm] = useState({
    vehicle_id: vehicles[0]?.id || "",
    driver_id: profiles.find((p) => p.role === "driver")?.id || "",
    valor_aluguel: 650,
    periodicidade: "semanal" as const,
    dia_vencimento: 1, // 1 = Segunda-feira por padrão
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    status: "ativo" as const,
    observacoes: "",
  });

  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setCnhFileName("");
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
      cnh_url: "",
    });
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriver = (d: Profile) => {
    setEditingDriver(d);
    setCnhFileName(d.cnh_url ? "cnh_cadastrada.pdf" : "");
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
      cnh_url: d.cnh_url || "",
    });
    setIsDriverModalOpen(true);
  };

  const handleCnhFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCnhFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDriverForm((prev) => ({
            ...prev,
            cnh_url: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, driverForm);
      setSuccessMessage(`Motorista ${driverForm.full_name} atualizado com sucesso!`);
    } else {
      addDriver(driverForm);
      setSuccessMessage(`Motorista ${driverForm.full_name} cadastrado com sucesso com CNH arquivada!`);
    }
    setIsDriverModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 5000);
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
    setSuccessMessage("Contrato criado com sucesso! As parcelas semanais foram geradas automaticamente para o dia fixo da semana.");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const weekdayNames: { [key: number]: string } = {
    1: "Toda Segunda-feira",
    2: "Toda Terça-feira",
    3: "Toda Quarta-feira",
    4: "Toda Quinta-feira",
    5: "Toda Sexta-feira",
    6: "Todo Sábado",
    7: "Todo Domingo",
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
            Cadastro completo de locatários com upload real de CNH e contratos com pagamento semanal em dia fixo.
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
            <span>Novo Contrato Semanal</span>
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

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
          {driversList.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
              <UserCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">Nenhum motorista cadastrado ainda.</p>
              <button
                onClick={handleOpenAddDriver}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Cadastrar Primeiro Motorista
              </button>
            </div>
          ) : (
            driversList.map((driver) => {
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDriver(driver)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        title="Editar Motorista"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o motorista ${driver.full_name}?`)) {
                            deleteDriver(driver.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition"
                        title="Excluir Motorista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                        {driver.cnh_numero || "Não informado"} (Cat. {driver.cnh_categoria || "B"})
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
                      {assignedVehicle ? "Alugando" : "Disponível"}
                    </span>
                  </div>

                  {/* Documento CNH Fixo */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Documento CNH:</span>
                    </div>
                    {driver.cnh_url ? (
                      <button
                        onClick={() => setViewingCnhUrl(driver.cnh_url || null)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Visualizar CNH
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-400 italic">Pendente envio</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
                  <th className="py-3.5 px-4">Dia Fixo da Semana</th>
                  <th className="py-3.5 px-4">Data Início</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 italic">
                      Nenhum contrato ativo cadastrado.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => {
                    const driver = profiles.find((d) => d.id === c.driver_id);
                    const vehicle = vehicles.find((v) => v.id === c.vehicle_id);

                    return (
                      <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {driver?.full_name || "Motorista não encontrado"}
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
                          {formatCurrency(c.valor_aluguel)} <span className="text-[10px] text-zinc-400">/sem</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-200">
                          <span className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-300">
                            {weekdayNames[c.dia_vencimento] || `Dia ${c.dia_vencimento}`}
                          </span>
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                generateWeeklyPaymentsForContract(c.id, 4);
                                setSuccessMessage(`+4 semanas geradas com sucesso para ${weekdayNames[c.dia_vencimento]}!`);
                                setTimeout(() => setSuccessMessage(null), 4000);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                              title="Gerar as próximas 4 parcelas semanais automaticamente"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>+4 Semanas</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Deseja realmente encerrar/excluir este contrato?")) {
                                  deleteContract(c.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition"
                              title="Excluir Contrato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Motorista com Upload Real de CNH */}
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
                  placeholder="Ex: Carlos Eduardo Silva"
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
                    placeholder="motorista@email.com"
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
                    placeholder="00.000.000-0"
                    value={driverForm.rg}
                    onChange={(e) => setDriverForm({ ...driverForm, rg: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Nº CNH:</label>
                  <input
                    type="text"
                    placeholder="Ex: 01234567890"
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
                    <option value="B">B (Carro)</option>
                    <option value="AB">AB (Moto e Carro)</option>
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
                  placeholder="Ex: (11) 98888-1111 (Esposa Maria)"
                  value={driverForm.contato_emergencia}
                  onChange={(e) => setDriverForm({ ...driverForm, contato_emergencia: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* Upload REAL de Documento Fixo: CNH */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <label className="block text-zinc-300 font-bold mb-1">
                  Upload de Documento Fixo: CNH (PDF ou Foto)
                </label>
                <p className="text-[11px] text-zinc-400">
                  O documento será salvo permanentemente na ficha do motorista para conferências e processos de multas.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-bold transition shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Selecionar CNH do Dispositivo</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleCnhFileUpload}
                      className="hidden"
                    />
                  </label>

                  {driverForm.cnh_url ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{cnhFileName || "Documento CNH carregado com sucesso!"}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic">
                      Nenhum arquivo de CNH selecionado
                    </span>
                  )}
                </div>

                {driverForm.cnh_url && driverForm.cnh_url.startsWith("data:image") && (
                  <div className="mt-2 max-w-[200px] rounded-lg overflow-hidden border border-zinc-700">
                    <img src={driverForm.cnh_url} alt="Preview CNH" className="w-full h-auto" />
                  </div>
                )}
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

      {/* Modal Cadastro de Contrato com Dia Fixo da Semana */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Criar Contrato de Locação Semanal</h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContractSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Motorista (Locatário):</label>
                <select
                  value={contractForm.driver_id}
                  onChange={(e) => setContractForm({ ...contractForm, driver_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                  required
                >
                  {driversList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({formatCPF(d.cpf)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Veículo Alugado:</label>
                <select
                  value={contractForm.vehicle_id}
                  onChange={(e) => setContractForm({ ...contractForm, vehicle_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                  required
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
                  <label className="block text-zinc-300 font-semibold mb-1">Valor Semanal (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={contractForm.valor_aluguel}
                    onChange={(e) => setContractForm({ ...contractForm, valor_aluguel: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    Dia Fixo de Pagamento:
                  </label>
                  <select
                    value={contractForm.dia_vencimento}
                    onChange={(e) => setContractForm({ ...contractForm, dia_vencimento: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-emerald-500 rounded-lg p-2.5 text-white font-bold"
                  >
                    <option value={1}>Toda Segunda-feira</option>
                    <option value={2}>Toda Terça-feira</option>
                    <option value={3}>Toda Quarta-feira</option>
                    <option value={4}>Toda Quinta-feira</option>
                    <option value={5}>Toda Sexta-feira</option>
                    <option value={6}>Todo Sábado</option>
                    <option value={7}>Todo Domingo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Data de Início do Contrato:</label>
                <input
                  type="date"
                  value={contractForm.data_inicio}
                  onChange={(e) => setContractForm({ ...contractForm, data_inicio: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Observações do Contrato:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Franquia semanal de KM, regras de caução, etc."
                  value={contractForm.observacoes}
                  onChange={(e) => setContractForm({ ...contractForm, observacoes: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/80 rounded-xl text-[11px] text-blue-300">
                ✨ As parcelas de pagamento semanais serão criadas automaticamente para o dia fixo da semana selecionado.
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
                  Ativar Contrato Semanal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de CNH */}
      {viewingCnhUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Documento de CNH Arquivado
              </h4>
              <button
                onClick={() => setViewingCnhUrl(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2">
              {viewingCnhUrl.startsWith("data:image") ? (
                <img src={viewingCnhUrl} alt="CNH do Motorista" className="max-w-full h-auto rounded" />
              ) : (
                <div className="text-center py-8 text-zinc-300 space-y-3">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                  <p className="text-xs">Documento em formato PDF arquivado com sucesso.</p>
                  <a
                    href={viewingCnhUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Documento
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
