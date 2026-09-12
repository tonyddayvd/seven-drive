"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { generatePixPayload, formatCurrency } from "@/lib/utils";
import { Copy, Check, QrCode as QrIcon } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [brCodePayload, setBrCodePayload] = useState("");

  useEffect(() => {
    // Gera o código EMV BR Code oficial
    const payload = generatePixPayload({
      key: pixKey,
      merchantName,
      merchantCity,
      amount,
      txid,
    });

    setBrCodePayload(payload);

    if (canvasRef.current) {
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
  }, [amount, pixKey, merchantName, merchantCity, txid]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(brCodePayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
        <QrIcon className="w-4 h-4" />
        <span>Pagamento Instantâneo via PIX</span>
      </div>

      <p className="text-2xl font-black text-white mb-4">
        {formatCurrency(amount)}
      </p>

      {/* QR Code Canvas */}
      <div className="p-3 bg-white rounded-xl shadow-lg border border-zinc-200 mb-4 inline-block">
        <canvas ref={canvasRef} className="rounded-lg max-w-full" />
      </div>

      <p className="text-xs text-zinc-400 mb-4 max-w-xs">
        Abra o aplicativo do seu banco, escolha <strong>PIX</strong> e aponte a câmera para o QR Code acima, ou use o botão abaixo para copiar o código.
      </p>

      {/* Botão Copiar Chave / Copia e Cola */}
      <button
        type="button"
        onClick={handleCopy}
        className={`w-full max-w-sm flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
          copied
            ? "bg-emerald-600 text-white shadow-emerald-900/30 scale-[1.02]"
            : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 hover:text-white shadow-emerald-500/20"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 animate-bounce" />
            <span>Código PIX Copiado com Sucesso!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copiar Chave PIX (Copia e Cola)</span>
          </>
        )}
      </button>

      {/* Exibição da chave para conferência */}
      <div className="mt-4 pt-3 border-t border-zinc-800 w-full text-xs text-zinc-500 flex justify-between items-center px-2">
        <span>Beneficiário: {merchantName}</span>
        <span>Chave: {pixKey}</span>
      </div>
    </div>
  );
}
