"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatKM, formatDate, formatPlate } from "@/lib/utils";
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
} from "lucide-react";

export default function MotoristaPage() {
  const {
    currentUser,
    profiles,
    vehicles,
    contracts,
    payments,
    activeAlerts,
  } = useSevenDrive();

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

  // Encontra o próximo pagamento em aberto / vencimento iminente deste motorista
  const driverPayments = payments.filter(
    (p) => (contract && p.contract_id === contract.id) || p.driver_id === activeDriver.id
  );

  // 1. Prioriza pagamentos em aberto (pendente_envio, atrasado, pendente_conferencia) em ordem cronológica (mais antigo/próximo primeiro)
  const openPayments = driverPayments
    .filter((p) => p.status === "pendente_envio" || p.status === "atrasado" || p.status === "pendente_conferencia")
    .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

  // 2. Se não houver pendências em aberto, pega o mais recente já confirmado
  const currentPayment = openPayments[0] || driverPayments.sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime())[0];

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

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                currentPayment.status === "confirmado"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : currentPayment.status === "pendente_conferencia"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {currentPayment.status === "confirmado"
                ? "Quitado / Aprovado"
                : currentPayment.status === "pendente_conferencia"
                ? "Em Conferência pelo Locador"
                : "Aguardando Pagamento"}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 block">Total a Pagar:</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(currentPayment.valor)}
              </span>
            </div>

            {currentPayment.status === "pendente_envio" && (
              <Link
                href="/motorista/pagar"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar & Vistoria</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
