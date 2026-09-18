"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Payment } from "@/types/database";
import { formatCurrency, formatDate, formatPlate, isPaymentLate } from "@/lib/utils";
import { InspectionStep, InspectionPhotos } from "@/components/inspection-camera/InspectionStep";
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  X,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export default function PagamentosPage() {
  const {
    payments,
    vehicles,
    profiles,
    addPayment,
    updatePayment,
    deletePayment,
    submitPaymentAndInspection,
    confirmPaymentAndInspection,
  } = useSevenDrive();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Modal de Lançamento Completo com Vistoria (Admin pode usar Galeria!)
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedPaymentForInspection, setSelectedPaymentForInspection] = useState<Payment | null>(null);
  const [adminInspectionKM, setAdminInspectionKM] = useState<number>(0);
  const [adminReceiptUrl, setAdminReceiptUrl] = useState<string>("");
  const [adminReceiptFileName, setAdminReceiptFileName] = useState<string>("");
  const [adminPhotos, setAdminPhotos] = useState<InspectionPhotos>({
    frente: "",
    lateralEsq: "",
    lateralDir: "",
    traseira: "",
    interior: "",
    odometro: "",
  });
  const [adminObs, setAdminObs] = useState("");

  const handleOpenInspectionForPayment = (payment: Payment) => {
    setSelectedPaymentForInspection(payment);
    const v = vehicles.find((veh) => veh.id === payment.vehicle_id);
    setAdminInspectionKM(v?.km_atual || 0);
    setAdminReceiptUrl(payment.comprovante_url || "");
    setAdminReceiptFileName(payment.comprovante_url ? "comprovante_existente" : "");
    setAdminPhotos({
      frente: "",
      lateralEsq: "",
      lateralDir: "",
      traseira: "",
      interior: "",
      odometro: "",
    });
    setAdminObs("Lançado e conferido diretamente pelo Administrador.");
    setIsInspectionModalOpen(true);
  };

  const handleAdminReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdminReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAdminReceiptUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdminInspectionAndConfirm = () => {
    if (!selectedPaymentForInspection) return;

    // Submete a vistoria e comprovante
    submitPaymentAndInspection({
      paymentId: selectedPaymentForInspection.id,
      receiptUrl: adminReceiptUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
      kmRegistrado: adminInspectionKM,
      photos: adminPhotos,
      observacoes: adminObs,
    });

    // Como é o próprio administrador lançando, já confirma e baixa imediatamente!
    setTimeout(() => {
      confirmPaymentAndInspection(
        selectedPaymentForInspection.id,
        "Lançamento manual de vistoria (galeria) e quitação direta realizada pelo Locador."
      );
    }, 100);

    setIsInspectionModalOpen(false);
  };

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: vehicles[0]?.id || "",
    driver_id: profiles.find((p) => p.role === "driver")?.id || "",
    contract_id: "manual",
    valor: 650,
    data_vencimento: new Date().toISOString().split("T")[0],
    data_pagamento: "",
    status: "confirmado" as Payment["status"],
    observacao_admin: "",
  });

  const handleOpenAdd = () => {
    setEditingPayment(null);
    setFormData({
      vehicle_id: vehicles[0]?.id || "",
      driver_id: profiles.find((p) => p.role === "driver")?.id || "",
      contract_id: "manual",
      valor: 650,
      data_vencimento: new Date().toISOString().split("T")[0],
      data_pagamento: new Date().toISOString().split("T")[0],
      status: "confirmado",
      observacao_admin: "Lançamento manual pelo administrador.",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      vehicle_id: payment.vehicle_id,
      driver_id: payment.driver_id,
      contract_id: payment.contract_id,
      valor: Number(payment.valor),
      data_vencimento: payment.data_vencimento,
      data_pagamento: payment.data_pagamento ? payment.data_pagamento.split("T")[0] : "",
      status: payment.status,
      observacao_admin: payment.observacao_admin || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPayment) {
      updatePayment(editingPayment.id, {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        valor: Number(formData.valor),
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento ? new Date(formData.data_pagamento).toISOString() : null,
        status: formData.status,
        observacao_admin: formData.observacao_admin,
      });
    } else {
      addPayment({
        contract_id: formData.contract_id,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        valor: Number(formData.valor),
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento ? new Date(formData.data_pagamento).toISOString() : null,
        status: formData.status,
        observacao_admin: formData.observacao_admin,
        semana_ano: `2026-37`,
      });
    }

    setIsModalOpen(false);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const driver = profiles.find((d) => d.id === p.driver_id);
    const vehicle = vehicles.find((v) => v.id === p.vehicle_id);
    const matchesSearch =
      (driver?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle?.placa || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gestão Financeira de Pagamentos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Controle total: adicione recebimentos manuais, edite valores ou exclua registros com auditoria.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Pagamento Manual</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por motorista ou placa do veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmado">Confirmados</option>
            <option value="pendente_conferencia">Pendente Conferência</option>
            <option value="pendente_envio">Aguardando Envio</option>
            <option value="atrasado">Atrasados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Motorista</th>
                <th className="py-3.5 px-4">Veículo</th>
                <th className="py-3.5 px-4">Valor</th>
                <th className="py-3.5 px-4">Vencimento</th>
                <th className="py-3.5 px-4">Data Pagamento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações do Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredPayments.map((p) => {
                const driver = profiles.find((d) => d.id === p.driver_id);
                const vehicle = vehicles.find((v) => v.id === p.vehicle_id);

                return (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {driver?.full_name || "Motorista não encontrado"}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-bold">
                        {formatPlate(vehicle?.placa)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatCurrency(p.valor)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {formatDate(p.data_vencimento)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {p.data_pagamento ? formatDate(p.data_pagamento) : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const isLate = p.status === "atrasado" || (p.status === "pendente_envio" && isPaymentLate(p.data_vencimento, p.status));
                        const currentStatus = p.status === "confirmado" 
                          ? "confirmado" 
                          : p.status === "pendente_conferencia" 
                          ? "pendente_conferencia" 
                          : isLate 
                          ? "atrasado" 
                          : "pendente_envio";

                        return (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              currentStatus === "confirmado"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : currentStatus === "pendente_conferencia"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                                : currentStatus === "atrasado"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {currentStatus === "confirmado" && <CheckCircle2 className="w-3 h-3" />}
                            {currentStatus === "pendente_conferencia" && <Clock className="w-3 h-3" />}
                            {currentStatus === "confirmado"
                              ? "Confirmado"
                              : currentStatus === "pendente_conferencia"
                              ? "Conferência"
                              : currentStatus === "atrasado"
                              ? "Atrasado"
                              : "Pendente"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenInspectionForPayment(p)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 text-[11px] font-bold transition"
                          title="Lançar Vistoria / Fotos da Galeria e Dar Baixa Direta"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Vistoria / Galeria</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          title="Editar Pagamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Deseja realmente remover este registro de pagamento?")) {
                              deletePayment(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition"
                          title="Excluir Pagamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingPayment ? "Editar Registro de Pagamento" : "Adicionar Pagamento Manual"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                  <label className="block text-zinc-300 font-semibold mb-1">Motorista:</label>
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
                  <label className="block text-zinc-300 font-semibold mb-1">Valor (R$):</label>
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
                  <label className="block text-zinc-300 font-semibold mb-1">Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment["status"] })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente_conferencia">Pendente Conferência</option>
                    <option value="pendente_envio">Aguardando Envio</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data Vencimento:</label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data Pagamento (opcional):</label>
                  <input
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Observações do Locador:</label>
                <input
                  type="text"
                  value={formData.observacao_admin}
                  onChange={(e) => setFormData({ ...formData, observacao_admin: e.target.value })}
                  placeholder="Ex: Pagamento recebido em dinheiro ou transferência bancária manual"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISTORIA DO ADMINISTRADOR (COM GALERIA & BAIXA DIRETA) */}
      {isInspectionModalOpen && selectedPaymentForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-zinc-900 border border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Lançamento de Vistoria pelo Administrador
                </div>
                <h3 className="text-xl font-black text-white">
                  Lançar Vistoria & Quitar Pagamento Direto
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Como administrador, você pode <strong>carregar fotos direto da galeria do celular ou computador</strong> sem depender do motorista.
                </p>
              </div>

              <button
                onClick={() => setIsInspectionModalOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações do Pagamento Selecionado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block">Motorista:</span>
                <span className="font-bold text-white">
                  {profiles.find((p) => p.id === selectedPaymentForInspection.driver_id)?.full_name}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Veículo / Placa:</span>
                <span className="font-mono font-bold text-white">
                  {formatPlate(vehicles.find((v) => v.id === selectedPaymentForInspection.vehicle_id)?.placa)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Valor da Parcela:</span>
                <span className="font-black text-emerald-400">
                  {formatCurrency(selectedPaymentForInspection.valor)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Vencimento:</span>
                <span className="font-bold text-white">
                  {formatDate(selectedPaymentForInspection.data_vencimento)}
                </span>
              </div>
            </div>

            {/* Anexar Comprovante Bancário (Opcional no Admin) */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <label className="block text-xs font-bold text-zinc-300">
                Comprovante Bancário (Galeria / Arquivo):
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer transition">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{adminReceiptFileName || "Selecionar Comprovante"}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAdminReceiptUpload}
                    className="hidden"
                  />
                </label>
                {adminReceiptUrl && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Comprovante carregado
                  </span>
                )}
              </div>
            </div>

            {/* Vistoria com 6 Fotos (allowGallery=true) */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Vistoria Digital das 6 Fotos (Upload via Galeria Liberado)
              </h4>

              <InspectionStep
                currentKM={adminInspectionKM}
                onKMChange={setAdminInspectionKM}
                photos={adminPhotos}
                onPhotosChange={setAdminPhotos}
                observacoes={adminObs}
                onObservacoesChange={setAdminObs}
                allowGallery={true}
              />
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInspectionModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveAdminInspectionAndConfirm}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Vistoria e Confirmar Pagamento Imediatamente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
