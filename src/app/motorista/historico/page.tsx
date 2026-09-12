"use client";

import React from "react";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { History, CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";

export default function MotoristaHistoricoPage() {
  const { currentUser, payments } = useSevenDrive();

  const driverPayments = payments.filter((p) => p.driver_id === currentUser.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Histórico de Pagamentos & Comprovantes
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Acompanhe todos os aluguéis enviados, comprovantes anexados e parecer do locador.
        </p>
      </div>

      <div className="space-y-3">
        {driverPayments.map((p) => {
          return (
            <div
              key={p.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Aluguel Semanal - {formatCurrency(p.valor)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      p.status === "confirmado"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : p.status === "pendente_conferencia"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {p.status === "confirmado"
                      ? "Confirmado & Baixado"
                      : p.status === "pendente_conferencia"
                      ? "Em Conferência"
                      : "Pendente de Envio"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Vencimento: {formatDate(p.data_vencimento)}
                  {p.data_pagamento && ` • Pago em: ${formatDateTime(p.data_pagamento)}`}
                </p>
                {p.observacao_admin && (
                  <p className="text-[11px] text-zinc-300 italic bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800/80 mt-1">
                    Locador: {p.observacao_admin}
                  </p>
                )}
              </div>

              {p.comprovante_url && (
                <a
                  href={p.comprovante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-semibold border border-zinc-700 transition self-end sm:self-center"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Comprovante</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
