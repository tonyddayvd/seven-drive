"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Sparkles, PlusSquare, Share } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Registra o Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("Service Worker registration error:", err));
    }

    // 2. Verifica se já está rodando como App instalado (Standalone)
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isApp);
    if (isApp) return;

    // 3. Detecta se é iOS (Safari iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleIos);

    // 4. Captura o evento nativo de instalação do Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("sevendrive_pwa_dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 86400000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // No iOS, se não estiver instalado e não foi dispensado nas últimas 24h, exibe as instruções
    if (isAppleIos && !isApp) {
      const dismissed = localStorage.getItem("sevendrive_pwa_dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 86400000) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setShowPrompt(false);
        }
      } catch (err) {
        console.log("Erro no prompt PWA:", err);
        setShowInstructionsModal(true);
      }
    } else {
      // Se o navegador não disparou o evento nativo (ex: Chrome no Android ou navegador interno), abre o passo a passo direto
      setShowInstructionsModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("sevendrive_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || (!showPrompt && !showInstructionsModal)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in">
      <div className="bg-zinc-900/95 border-2 border-blue-500/50 backdrop-blur-xl rounded-3xl p-5 shadow-2xl shadow-blue-950/60 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-lg border border-zinc-700/80 shrink-0 bg-zinc-950 p-1 flex items-center justify-center">
              <img
                src="/icon-192.png"
                alt="Seven Drive Logo"
                className="w-11 h-11 object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Instalar Aplicativo
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Seven Drive no seu Celular ou PC
              </h4>
              <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                Crie um atalho na tela inicial e acesse o sistema com 1 toque!
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition shrink-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Se o navegador exigir adição manual pelo menu (três pontinhos), exibe o modal explicativo */}
        {showInstructionsModal && (
          <div className="p-4 bg-zinc-950 rounded-2xl border border-blue-500/60 text-xs text-zinc-300 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Como fixar o atalho no seu celular:</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              O seu navegador requer que você confirme a adição pelo menu:
            </p>
            <div className="space-y-2 text-[11px] pl-1">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Toque no menu do navegador (os <strong>3 pontinhos</strong> ⋮ no canto superior direito do Chrome).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Confirme em <strong>"Instalar"</strong>. O ícone oficial do Seven Drive surgirá imediatamente na sua tela inicial!</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowInstructionsModal(false);
                setShowPrompt(false);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Entendi, vou fazer isso!
            </button>
          </div>
        )}

        {/* Instruções para iOS (iPhone) ou Botão de 1 Clique no Android/Chrome */}
        {!showInstructionsModal && isIos && (
          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 text-[11px] text-zinc-300 space-y-2">
            <p className="font-semibold text-blue-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Para instalar no iPhone/iPad:
            </p>
            <ol className="space-y-1.5 pl-1 text-zinc-400">
              <li className="flex items-center gap-2">
                <span>1. Toque no botão</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded font-bold text-white text-[10px]">
                  <Share className="w-3 h-3 text-blue-400" /> Compartilhar
                </span>
                <span>no Safari</span>
              </li>
              <li className="flex items-center gap-2">
                <span>2. Role para baixo e escolha:</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 rounded font-bold text-white text-[10px]">
                  <PlusSquare className="w-3 h-3 text-emerald-400" /> Adicionar à Tela de Início
                </span>
              </li>
            </ol>
          </div>
        )}

        {!showInstructionsModal && !isIos && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Instalar como Atalho / App</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
            >
              Depois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
