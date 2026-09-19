"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatKM, formatDate, formatPlate, isPaymentLate } from "@/lib/utils";
import {
  Car,
  CreditCard,
  Camera,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";

export default function MotoristaPage() {
  const {
    currentUser,
    profiles,
    vehicles,
    contracts,
    payments,
    activeAlerts,
    refreshDataFromCloud,
    resetPaymentIntention,
  } = useSevenDrive();

  // Sincronização automática em segundo plano para refletir aprovação/recusa em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDataFromCloud().catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const driversList = profiles.filter((p) => p.role === "driver");

  // Identifica o motorista ativo (se for motorista usa ele; se for o locador testando, usa o primeiro motorista cadastrado)
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    currentUser.role === "driver" ? currentUser.id : driversList[0]?.id || ""
  );

  const activeDriver = profiles.find((p) => p.id === selectedDriverId) || driversList[0] || currentUser;

  // Encontra o contrato ativo deste motorista
  const contract = contracts.find(
    (c) => c.driver_id === activeDriver.id && c.status === "ativo"
  ) || contracts[0];

  const vehicle = vehicles.find((v) => v.id === contract?.vehicle_id) || vehicles[0];

  // Encontra os pagamentos deste motorista
  const driverPayments = payments.filter(
    (p) => (contract && p.contract_id === contract.id) || p.driver_id === activeDriver.id
  );

  // PRIORIDADE 1: Se houver qualquer pagamento recusado pelo locador, ele é o centro das atenções!
  const rejectedPayment = driverPayments.find((p) => p.status === "recusado");

  // Pagamentos em aberto ordenados
  const openPayments = driverPayments
    .filter((p) => p.status === "recusado" || p.status === "pendente_envio" || p.status === "atrasado" || p.status === "pendente_conferencia")
    .sort((a, b) => {
      if (a.status === "recusado" && b.status !== "recusado") return -1;
      if (b.status === "recusado" && a.status !== "recusado") return 1;
      return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
    });

  const currentPayment = rejectedPayment || openPayments[0] || driverPayments.sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime())[0];

  const vehicleAlerts = activeAlerts.filter((a) => a.vehicleId === vehicle?.id);

  const weekdayNames: { [key: number]: string } = {
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
    7: "Domingo",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Seletor de Motorista se houver mais de um na frota */}
      {driversList.length > 1 && (
        <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            Motorista Conectado:
          </span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1 font-bold text-xs"
          >
            {driversList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alerta de Recusa Prioritário se houver pagamento recusado */}
      {rejectedPayment && (
        <div className="p-5 rounded-3xl bg-red-950/80 border-2 border-red-500 text-white shadow-xl shadow-red-950/50 space-y-3 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Atenção: Seu Envio Foi Recusado pelo Locador
                </h2>
                <span className="text-xs text-red-300">
                  Vencimento: {formatDate(rejectedPayment.data_vencimento)} • Valor: {formatCurrency(rejectedPayment.valor)}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-500 text-white animate-pulse">
              Ação Necessária
            </span>
          </div>

          <div className="bg-black/60 p-3.5 rounded-2xl border border-red-900/60 text-xs space-y-1">
            <span className="text-red-400 font-bold block text-[11px] uppercase tracking-wide">
              Motivo apontado pelo Locador:
            </span>
            <p className="text-zinc-200 italic font-medium leading-relaxed">
              &ldquo;{rejectedPayment.motivo_recusa || rejectedPayment.observacao_admin || "Comprovante ou vistoria pendente de regularização."}&rdquo;
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/motorista/pagar?id=${rejectedPayment.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/40 transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Corrigir Comprovante / Fotos e Reenviar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => {
                if (window.confirm("Tem certeza que deseja cancelar este envio? O pagamento voltará para pendente com o valor atualizado do contrato.")) {
                  resetPaymentIntention(rejectedPayment.id, "Cancelado pelo Motorista");
                }
              }}
              className="px-4 py-3.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition flex items-center justify-center whitespace-nowrap"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Boas-vindas */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Portal do Locatário
            </span>
            <h1 className="text-xl font-black text-white mt-0.5">
              Olá, {activeDriver.full_name.split(" ")[0]}!
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Gerencie seu veículo alugado, envie comprovantes e realize vistorias com foto.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cartão do Veículo Alugado */}
      {vehicle ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Seu Veículo Vinculado
              </span>
              <h2 className="text-lg font-bold text-white">
                {vehicle.marca} {vehicle.modelo}
              </h2>
              <p className="text-xs text-zinc-400">
                Ano {vehicle.ano} • Cor {vehicle.cor} • {vehicle.combustivel}
              </p>
            </div>
            <span className="font-mono text-xs font-black px-3 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
              {formatPlate(vehicle.placa)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                KM Oficial Atual
              </span>
              <span className="text-base font-mono font-black text-emerald-400">
                {formatKM(vehicle.km_atual)}
              </span>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                Valor do Aluguel
              </span>
              <span className="text-base font-bold text-white">
                {formatCurrency(contract?.valor_aluguel || 650)}
                <span className="text-[10px] text-zinc-400 font-normal"> /semana</span>
              </span>
              {contract?.dia_vencimento && (
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">
                  Toda {weekdayNames[contract.dia_vencimento]}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
          <p className="text-sm">Nenhum veículo vinculado ao seu contrato no momento.</p>
        </div>
      )}

      {/* Status do Próximo Pagamento & Ação Principal */}
      {currentPayment ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Status do Aluguel Semanal
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Vencimento: {formatDate(currentPayment.data_vencimento)}
              </h3>
            </div>

            {(() => {
              const isLate = currentPayment.status === "atrasado" || (currentPayment.status === "pendente_envio" && isPaymentLate(currentPayment.data_vencimento, currentPayment.status));

              return (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    currentPayment.status === "confirmado"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : currentPayment.status === "pendente_conferencia"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                      : currentPayment.status === "recusado"
                      ? "bg-red-500/10 text-red-400 border-red-500/30 font-black animate-pulse"
                      : isLate
                      ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {currentPayment.status === "confirmado"
                    ? "Quitado / Aprovado"
                    : currentPayment.status === "pendente_conferencia"
                    ? "Em Conferência pelo Locador"
                    : currentPayment.status === "recusado"
                    ? "Envio Recusado pelo Locador"
                    : isLate
                    ? "Em Atraso (Regularize Agora)"
                    : "Aguardando Pagamento"}
                </span>
              );
            })()}
          </div>

          {/* Aviso especial de Envio Recusado com o motivo */}
          {currentPayment.status === "recusado" && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>O locador recusou a sua conferência anterior:</span>
              </div>
              <p className="text-zinc-300 italic bg-black/40 p-2.5 rounded-lg border border-red-900/50">
                &ldquo;{currentPayment.motivo_recusa || currentPayment.observacao_admin || "Comprovante ou vistoria pendente de correção."}&rdquo;
              </p>
              <span className="text-[11px] text-zinc-400 block pt-1">
                Por favor, clique no botão abaixo para anexar o comprovante correto e reenviar as 6 fotos da vistoria.
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 block">Total a Pagar:</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(currentPayment.valor)}
              </span>
            </div>

            {(currentPayment.status === "pendente_envio" || currentPayment.status === "recusado") && (
              <div className="flex gap-2">
                <Link
                  href={`/motorista/pagar?id=${currentPayment.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{currentPayment.status === "recusado" ? "Corrigir & Reenviar" : "Pagar & Vistoria"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {currentPayment.status === "recusado" && (
                  <button
                    onClick={() => {
                      if (window.confirm("Tem certeza que deseja cancelar este envio?")) {
                        resetPaymentIntention(currentPayment.id, "Cancelado pelo Motorista");
                      }
                    }}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-xs transition"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}

            {currentPayment.status === "pendente_conferencia" && (
              <div className="text-right text-xs text-blue-300 flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                <span>Comprovante e 6 fotos enviadas. Aguardando baixa do locador.</span>
              </div>
            )}

            {currentPayment.status === "confirmado" && (
              <div className="text-right text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Semana paga e vistoria conferida!</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-xs text-zinc-400 mb-3">Nenhum pagamento pendente no momento.</p>
          <Link
            href="/motorista/pagar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Fazer Pagamento Antecipado</span>
          </Link>
        </div>
      )}

      {/* Ações Secundárias do Motorista */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/motorista/manutencao"
          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Enviar Revisão</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Anexar nota fiscal de peças e odômetro
            </p>
          </div>
        </Link>

        <Link
          href="/motorista/historico"
          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Histórico</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Visualizar comprovantes e recibos
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
