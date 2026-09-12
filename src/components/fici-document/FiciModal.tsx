"use client";

import React, { useRef } from "react";
import { Fine, Vehicle, Profile } from "@/types/database";
import { formatDate, formatDateTime, formatCurrency, formatCPF, formatPlate } from "@/lib/utils";
import { Printer, X, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

interface FiciModalProps {
  fine: Fine;
  vehicle?: Vehicle;
  driver?: Profile;
  onClose: () => void;
}

export function FiciModal({ fine, vehicle, driver, onClose }: FiciModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl my-8 overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Formulário de Identificação do Condutor Infrator (FICI)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Documento FICI (Estilo Oficial Pré-preenchido) */}
        <div ref={printRef} className="p-8 bg-white text-zinc-900 text-xs font-sans space-y-6">
          {/* Brasão / Cabeçalho */}
          <div className="text-center border-b-2 border-zinc-900 pb-4">
            <h1 className="text-sm font-black uppercase tracking-wider">
              República Federativa do Brasil - Sistema Nacional de Trânsito
            </h1>
            <h2 className="text-base font-extrabold uppercase mt-0.5 text-zinc-800">
              Formulário de Identificação do Condutor Infrator - FICI
            </h2>
            <p className="text-[11px] text-zinc-600 mt-1">
              Transferência de Responsabilidade de Pontuação (Art. 257, § 7º do Código de Trânsito Brasileiro)
            </p>
          </div>

          {/* 1. Dados da Notificação / Infração */}
          <div className="border border-zinc-300 rounded p-3 bg-zinc-50">
            <h3 className="font-bold text-[11px] uppercase border-b border-zinc-200 pb-1 mb-2 text-zinc-700">
              1. Dados do Auto de Infração
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Auto de Infração:</span>
                <span className="font-mono font-bold text-zinc-900 text-xs">{fine.auto_infracao}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Órgão Emissor:</span>
                <span className="font-bold text-zinc-900 text-xs">{fine.orgao_emissor}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Data e Hora:</span>
                <span className="font-semibold text-zinc-900 text-xs">{formatDateTime(fine.data_infracao)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Pontuação na CNH:</span>
                <span className="font-bold text-red-600 text-xs">{fine.pontos} Pontos</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Descrição da Infração:</span>
                <span className="font-semibold text-zinc-900 text-xs">{fine.descricao}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Valor Nominal:</span>
                <span className="font-bold text-zinc-900 text-xs">{formatCurrency(fine.valor)}</span>
              </div>
            </div>
          </div>

          {/* 2. Dados do Veículo */}
          <div className="border border-zinc-300 rounded p-3 bg-zinc-50">
            <h3 className="font-bold text-[11px] uppercase border-b border-zinc-200 pb-1 mb-2 text-zinc-700">
              2. Dados do Veículo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Placa:</span>
                <span className="font-mono font-extrabold text-zinc-900 text-sm">
                  {formatPlate(vehicle?.placa || "BRA2E19")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">RENAVAM:</span>
                <span className="font-mono font-semibold text-zinc-900">{vehicle?.renavam || "12345678901"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Marca / Modelo:</span>
                <span className="font-semibold text-zinc-900">{vehicle ? `${vehicle.marca} ${vehicle.modelo}` : "Chevrolet Onix"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Chassi:</span>
                <span className="font-mono text-[10px] text-zinc-800">{vehicle?.chassi || "9BGKS48V0PG123456"}</span>
              </div>
            </div>
          </div>

          {/* 3. Dados do Condutor Infrator (Locatário) */}
          <div className="border-2 border-zinc-800 rounded p-4 bg-zinc-50/50">
            <h3 className="font-black text-xs uppercase border-b border-zinc-300 pb-1 mb-2 text-blue-900">
              3. Identificação do Condutor Infrator (Motorista Responsável)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-2">
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Nome Completo:</span>
                <span className="font-bold text-zinc-900 text-xs">{driver?.full_name || "Carlos Eduardo Silva"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">CPF do Condutor:</span>
                <span className="font-mono font-bold text-zinc-900 text-xs">{formatCPF(driver?.cpf || "345.678.901-22")}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Nº Registro CNH:</span>
                <span className="font-mono font-bold text-zinc-900 text-xs">{driver?.cnh_numero || "04981273910"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Categoria CNH:</span>
                <span className="font-bold text-zinc-900 text-xs">{driver?.cnh_categoria || "B"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Validade da CNH:</span>
                <span className="font-semibold text-zinc-900 text-xs">{formatDate(driver?.cnh_validade || "2027-05-20")}</span>
              </div>
              <div className="col-span-3">
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Endereço Residencial:</span>
                <span className="font-semibold text-zinc-900 text-xs">{driver?.endereco || "Rua Vergueiro, 2500 - Vila Mariana, São Paulo/SP"}</span>
              </div>
            </div>
          </div>

          {/* Declaração e Termo */}
          <div className="text-[10px] text-zinc-600 text-justify leading-relaxed border-t border-zinc-200 pt-3">
            Declaro para os devidos fins de direito que, na data e hora da infração acima discriminada, eu era o real condutor do veículo automotor, assumindo integralmente a responsabilidade pela pontuação gerada e suas consequências legais, nos termos do § 7º do Artigo 257 da Lei nº 9.503/1997 (CTB).
          </div>

          {/* Linhas de Assinatura */}
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="text-center">
              <div className="border-t border-zinc-900 pt-1">
                <span className="font-bold text-[11px] block uppercase">Assinatura do Proprietário / Locador</span>
                <span className="text-[9px] text-zinc-500">Seven Drive Gestão de Frota</span>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-zinc-900 pt-1">
                <span className="font-bold text-[11px] block uppercase">Assinatura do Condutor Infrator</span>
                <span className="text-[9px] text-zinc-500">{driver?.full_name || "Condutor Declarado"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
