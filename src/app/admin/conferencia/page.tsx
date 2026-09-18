"use client";

import React, { useState, useEffect } from "react";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatDate, formatDateTime, formatKM, formatPlate } from "@/lib/utils";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  Car,
  AlertTriangle,
  ZoomIn,
  Check,
  ArrowRight,
  RefreshCw,
  Maximize2,
  X,
} from "lucide-react";

export default function ConferenciaPage() {
  const {
    payments,
    inspections,
    vehicles,
    profiles,
    confirmPaymentAndInspection,
    rejectPaymentAndInspection,
    refreshDataFromCloud,
  } = useSevenDrive();

  // Pagamentos que estão na fila de conferência
  const pendingPayments = payments.filter((p) => p.status === "pendente_conferencia");

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    pendingPayments[0]?.id || null
  );
  const [adminObservation, setAdminObservation] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal de Recusa
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Modal de Zoom de Imagem em Alta Resolução
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // Polling automático da nuvem a cada 12 segundos para manter a fila sempre atualizada
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDataFromCloud().catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Garante que haja um item selecionado caso a fila mude
  useEffect(() => {
    if (!selectedPaymentId && pendingPayments.length > 0) {
      setSelectedPaymentId(pendingPayments[0].id);
    }
  }, [pendingPayments, selectedPaymentId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDataFromCloud();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const currentPayment = payments.find((p) => p.id === selectedPaymentId);

  // Busca a vistoria vinculada ao pagamento, com fallback para a mais recente do mesmo veículo
  const currentInspection =
    inspections.find((i) => i.payment_id === selectedPaymentId) ||
    inspections
      .filter((i) => i.vehicle_id === currentPayment?.vehicle_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const currentVehicle = vehicles.find((v) => v.id === currentPayment?.vehicle_id);
  const currentDriver = profiles.find((p) => p.id === currentPayment?.driver_id);

  const handleConfirm = async () => {
    if (!selectedPaymentId) return;

    await confirmPaymentAndInspection(
      selectedPaymentId,
      adminObservation || "Conferência aprovada com sucesso pelo Locador."
    );

    setSuccessMessage(
      `Pagamento de ${formatCurrency(currentPayment?.valor)} confirmado com sucesso! KM do veículo ${currentVehicle?.placa} atualizado para ${formatKM(currentInspection?.km_registrado)}.`
    );

    setAdminObservation("");

    // Seleciona o próximo se houver
    const remaining = pendingPayments.filter((p) => p.id !== selectedPaymentId);
    setSelectedPaymentId(remaining[0]?.id || null);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentId || !rejectReason.trim()) return;

    await rejectPaymentAndInspection(selectedPaymentId, rejectReason.trim());

    setErrorMessage(
      `Intenção de pagamento de ${formatCurrency(currentPayment?.valor)} foi RECUSADA. O motorista foi notificado do motivo: "${rejectReason.trim()}".`
    );

    setIsRejectModalOpen(false);
    setRejectReason("");

    const remaining = pendingPayments.filter((p) => p.id !== selectedPaymentId);
    setSelectedPaymentId(remaining[0]?.id || null);

    setTimeout(() => {
      setErrorMessage(null);
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Botão de Atualização */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Fila de Dupla Conferência
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {pendingPayments.length} pendente(s)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Compare o comprovante bancário com as fotos da vistoria e do odômetro antes de confirmar e dar baixa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : "text-zinc-400"}`} />
          <span>{isRefreshing ? "Sincronizando..." : "Atualizar Fila"}</span>
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Alerta de Recusa */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 flex items-center gap-3 animate-fade-in">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {pendingPayments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Fila de Conferência Vazia!
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Todos os pagamentos e vistorias digitais enviados pelos motoristas já foram conferidos e baixados. Novos envios aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Lista de Pagamentos na Fila */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 h-fit">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
              Aguardando Sua Baixa ({pendingPayments.length})
            </h2>

            <div className="space-y-2">
              {pendingPayments.map((p) => {
                const veh = vehicles.find((v) => v.id === p.vehicle_id);
                const driv = profiles.find((d) => d.id === p.driver_id);
                const isSelected = p.id === selectedPaymentId;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-900/20"
                        : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {driv?.full_name || "Motorista"}
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        {formatCurrency(p.valor)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Car className="w-3 h-3 text-zinc-500" />
                        {veh?.placa} ({veh?.marca} {veh?.modelo})
                      </span>
                      <span>{formatDate(p.data_vencimento)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colunas 2 e 3: Visualizador Lado a Lado (Comprovante x Vistoria) */}
          <div className="lg:col-span-2 space-y-6">
            {currentPayment && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                {/* Cabeçalho do Item Selecionado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        Conferência: {currentDriver?.full_name}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {currentVehicle?.placa}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Enviado em: {formatDateTime(currentPayment.data_pagamento)} • Vencimento: {formatDate(currentPayment.data_vencimento)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Valor Informado</span>
                    <span className="text-xl font-black text-emerald-400">
                      {formatCurrency(currentPayment.valor)}
                    </span>
                  </div>
                </div>

                {/* VISUALIZAÇÃO LADO A LADO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LADO 1: COMPROVANTE BANCÁRIO */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-blue-400" />
                        1. Comprovante de Pagamento
                      </h4>
                      <span className="text-[10px] text-zinc-500">Clique para ampliar</span>
                    </div>

                    <div
                      onClick={() => {
                        if (currentPayment.comprovante_url) {
                          setZoomImage({
                            url: currentPayment.comprovante_url,
                            title: `Comprovante - ${currentDriver?.full_name} (${formatCurrency(currentPayment.valor)})`,
                          });
                        }
                      }}
                      className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[3/4] flex items-center justify-center relative group cursor-pointer"
                    >
                      {currentPayment.comprovante_url ? (
                        <>
                          <img
                            src={currentPayment.comprovante_url}
                            alt="Comprovante de Pagamento"
                            className="w-full h-full object-contain group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="bg-zinc-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700 shadow-lg">
                              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                              Ampliar Comprovante
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-zinc-500 text-xs">
                          Nenhum comprovante anexado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* LADO 2: VISTORIA & FOTO DO ODÔMETRO */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-amber-400" />
                        2. Odômetro & Vistoria (6 Fotos)
                      </h4>
                      <span className="text-[10px] font-bold text-amber-400">
                        KM Informado: {currentInspection ? formatKM(currentInspection.km_registrado) : "-"}
                      </span>
                    </div>

                    {/* Foto Principal do Odômetro */}
                    <div
                      onClick={() => {
                        if (currentInspection?.foto_odometro_url) {
                          setZoomImage({
                            url: currentInspection.foto_odometro_url,
                            title: `Foto do Odômetro (${formatKM(currentInspection.km_registrado)}) - Placa ${currentVehicle?.placa}`,
                          });
                        }
                      }}
                      className="rounded-xl overflow-hidden border-2 border-amber-500/60 bg-zinc-950 aspect-video relative group cursor-pointer"
                    >
                      {currentInspection?.foto_odometro_url ? (
                        <>
                          <img
                            src={currentInspection.foto_odometro_url}
                            alt="Foto do Odômetro"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="bg-zinc-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700 shadow-lg">
                              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                              Ampliar Odômetro
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-zinc-500 text-xs flex items-center justify-center h-full">
                          Sem foto do odômetro
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[11px] font-bold text-white border border-zinc-700">
                        Painel / Odômetro Oficial
                      </div>
                    </div>

                    {/* Miniaturas das outras 5 fotos */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: "Frente", url: currentInspection?.foto_frente_url },
                        { label: "Lat. Esq", url: currentInspection?.foto_lateral_esq_url },
                        { label: "Lat. Dir", url: currentInspection?.foto_lateral_dir_url },
                        { label: "Traseira", url: currentInspection?.foto_traseira_url },
                        { label: "Interior", url: currentInspection?.foto_interior_url },
                      ].map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (photo.url) {
                              setZoomImage({
                                url: photo.url,
                                title: `Vistoria: ${photo.label} - Placa ${currentVehicle?.placa}`,
                              });
                            }
                          }}
                          className={`aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 relative group ${
                            photo.url ? "cursor-pointer" : ""
                          }`}
                        >
                          {photo.url ? (
                            <>
                              <img
                                src={photo.url}
                                alt={photo.label}
                                className="w-full h-full object-cover group-hover:scale-115 transition"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <ZoomIn className="w-3.5 h-3.5 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-500">
                              -
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center text-zinc-300 py-0.5">
                            {photo.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Comparativo de KM */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">KM Anterior no Sistema:</span>
                        <span className="font-mono text-zinc-300">{formatKM(currentVehicle?.km_atual)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-400">Novo KM a ser Registrado:</span>
                        <span className="font-mono text-emerald-400">
                          {formatKM(currentInspection?.km_registrado || currentVehicle?.km_atual)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações da Vistoria pelo Motorista */}
                {currentInspection?.observacoes && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-zinc-400 font-bold block mb-0.5">Nota do Motorista:</span>
                    <p className="text-zinc-300 italic">{currentInspection.observacoes}</p>
                  </div>
                )}

                {/* Campo de Observação do Admin */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Parecer do Administrador / Observação de Baixa (Opcional):
                  </label>
                  <input
                    type="text"
                    value={adminObservation}
                    onChange={(e) => setAdminObservation(e.target.value)}
                    placeholder="Ex: Pagamento compensado via PIX, veículo higienizado e odômetro conferido com sucesso."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* AÇÕES: RECUSAR OU CONFIRMAR */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-800/80 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Recusar Intenção de Pagamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar e Dar Baixa (Quitar Aluguel)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DE IMAGEM */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <span className="text-xs font-bold text-white">{zoomImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECUSA */}
      {isRejectModalOpen && currentPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Recusar Intenção de Pagamento
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {currentDriver?.full_name} • {formatCurrency(currentPayment.valor)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Explique o motivo da recusa (ex: comprovante ilegível, valor não caiu na conta, foto do odômetro cortada, etc). Esta mensagem aparecerá para o motorista para que ele possa corrigir e reenviar.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  Motivo da Recusa (Obrigatório) <span className="text-red-500">*</span>:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: O comprovante enviado está ilegível ou o valor de R$ 650,00 não foi identificado no extrato bancário. Por favor, reenvie o comprovante correto."
                  rows={4}
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    rejectReason.trim()
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                  }`}
                >
                  Confirmar Recusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
