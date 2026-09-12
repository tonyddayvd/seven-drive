"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { generatePixPayload, formatCurrency } from "@/lib/utils";
import {
  Copy,
  Check,
  QrCode as QrIcon,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

interface PixQrCodeProps {
  amount: number;
  pixKey: string;
  merchantName?: string;
  merchantCity?: string;
  txid?: string;
}

export function PixQrCode({
  amount,
  pixKey,
  merchantName = "Seven Drive",
  merchantCity = "SAO PAULO",
  txid = "ALUGUEL",
}: PixQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKeyOnly, setCopiedKeyOnly] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [brCodePayload, setBrCodePayload] = useState("");

  useEffect(() => {
    // Gera o código EMV BR Code oficial do Banco Central com valor exato
    const payload = generatePixPayload({
      key: pixKey,
      merchantName,
      merchantCity,
      amount,
      txid,
    });

    setBrCodePayload(payload);

    if (canvasRef.current && showQrCode) {
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 220,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Erro ao gerar QR Code PIX:", error);
        }
      );
    }
  }, [amount, pixKey, merchantName, merchantCity, txid, showQrCode]);

  const handleCopyPayload = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(brCodePayload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 5000);
    }
  };

  const handleCopyKeyOnly = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
      setCopiedKeyOnly(true);
      setTimeout(() => setCopiedKeyOnly(false), 4000);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 text-left">
      {/* Header com Valor e Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            Pagamento Direto pelo Celular
          </span>
          <h3 className="text-sm font-semibold text-zinc-400 mt-2">
            Valor do Aluguel Semanal:
          </h3>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Beneficiário:</span>
          </div>
          <span className="font-bold text-white block text-sm">{merchantName}</span>
          <span className="text-[11px] text-zinc-500 block">Cidade: {merchantCity}</span>
        </div>
      </div>

      {/* BOTÃO PRINCIPAL GIGANTE: PIX COPIA E COLA */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleCopyPayload}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl active:scale-[0.98] ${
            copiedPayload
              ? "bg-emerald-600 text-white shadow-emerald-900/40 ring-4 ring-emerald-500/30"
              : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/30"
          }`}
        >
          {copiedPayload ? (
            <>
              <Check className="w-6 h-6 animate-bounce" />
              <span>✓ Código Pix Copiado com Sucesso!</span>
            </>
          ) : (
            <>
              <Copy className="w-6 h-6" />
              <span>Copiar Código Pix Copia e Cola</span>
            </>
          )}
        </button>

        {/* Feedback visual imediato quando copiado */}
        {copiedPayload ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-semibold space-y-1 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Check className="w-5 h-5" />
              <span>Código Pix na Área de Transferência!</span>
            </div>
            <p className="text-zinc-300 text-xs">
              Agora abra o aplicativo do seu banco (Nubank, Itaú, Inter, Bradesco, etc.) e acerte em <strong>Pix &gt; Pix Copia e Cola</strong>. O valor exato de <strong>{formatCurrency(amount)}</strong> já estará preenchido!
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-zinc-400 font-medium">
            Toque no botão acima para copiar o código Pix com o valor exato de <strong className="text-white">{formatCurrency(amount)}</strong>.
          </p>
        )}
      </div>

      {/* GUIA PASSO A PASSO PARA O MOTORISTA */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Como Pagar pelo Celular (Passo a Passo)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <strong className="text-white block">Copie o Código:</strong>
              <span className="text-zinc-400 text-[11px]">
                Toque no botão verde acima para copiar o Pix.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <strong className="text-white block">Abra seu Banco:</strong>
              <span className="text-zinc-400 text-[11px]">
                Abra seu app bancário (Nubank, Itaú, Inter, etc.).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <strong className="text-white block">Pix Copia e Cola:</strong>
              <span className="text-zinc-400 text-[11px]">
                Acesse a opção <strong>Pix Copia e Cola</strong> e cole o código.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div>
              <strong className="text-white block">Confirmar & Salvar:</strong>
              <span className="text-zinc-400 text-[11px]">
                Confirme o pagamento de {formatCurrency(amount)} e tire print do comprovante.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHAVE PIX SIMPLES ALTERNATIVA */}
      <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-zinc-400">
          <span>Chave PIX do Locador: </span>
          <span className="font-mono text-zinc-200 font-bold ml-1">{pixKey}</span>
        </div>

        <button
          type="button"
          onClick={handleCopyKeyOnly}
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
        >
          {copiedKeyOnly ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Chave Copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar apenas a chave avulsa</span>
            </>
          )}
        </button>
      </div>

      {/* SEÇÃO RECOLHÍVEL DO QR CODE (Para quem estiver no computador ou tiver 2 celulares) */}
      <div className="pt-2 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => setShowQrCode(!showQrCode)}
          className="w-full flex items-center justify-between py-2 text-xs text-zinc-400 hover:text-zinc-200 font-semibold transition"
        >
          <span className="flex items-center gap-2">
            <QrIcon className="w-4 h-4 text-zinc-500" />
            <span>Está no computador ou prefere escanear QR Code com outro celular?</span>
          </span>
          {showQrCode ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showQrCode && (
          <div className="mt-4 p-5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center space-y-3 animate-fade-in">
            <p className="text-xs text-zinc-400">
              Aponte a câmera do seu aplicativo de banco para o QR Code abaixo:
            </p>
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-zinc-200 inline-block">
              <canvas ref={canvasRef} className="rounded-xl max-w-full" />
            </div>
            <p className="text-[11px] text-zinc-500">
              Valor configurado: {formatCurrency(amount)} • Beneficiário: {merchantName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
