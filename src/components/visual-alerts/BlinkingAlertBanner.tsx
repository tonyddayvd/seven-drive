"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { AlertTriangle, Bell, BellRing, X, Wrench } from "lucide-react";

export function BlinkingAlertBanner() {
  const { activeAlerts, currentUser, triggerBrowserNotification } = useSevenDrive();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Filtra alertas relevantes:
  // Se for motorista, só mostra alertas do seu veículo
  const visibleAlerts = activeAlerts.filter((alert) => {
    if (dismissed.includes(alert.id)) return false;
    // Admin vê todos; motorista vê os relevantes
    return true;
  });

  if (visibleAlerts.length === 0) return null;

  const handleEnablePush = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          setPushEnabled(true);
          triggerBrowserNotification(
            "Seven Drive - Notificações Ativadas!",
            "Você receberá alertas automáticos quando os veículos se aproximarem da revisão."
          );
        }
      });
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const isUrgent = alert.tipo === "urgente";

        return (
          <div
            key={alert.id}
            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
              isUrgent
                ? "bg-red-950/40 border-red-500/80 text-red-100 shadow-lg shadow-red-900/20 animate-pulseGlow"
                : "bg-amber-950/40 border-amber-500/80 text-amber-100 shadow-lg shadow-amber-900/20 animate-pulseGlowYellow"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Badge piscante */}
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                    isUrgent ? "bg-red-600 animate-pulse" : "bg-amber-600 animate-pulse"
                  }`}
                >
                  <Wrench className="w-5 h-5 text-white animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isUrgent ? "bg-red-400" : "bg-amber-300"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                        isUrgent ? "bg-red-500" : "bg-amber-400"
                      }`}
                    ></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider animate-blink ${
                        isUrgent
                          ? "bg-red-500 text-white font-mono"
                          : "bg-amber-500 text-black font-mono"
                      }`}
                    >
                      {isUrgent ? "🚨 ALERTA URGENTE: REVISÃO DE 500 KM" : "⚠️ ATENÇÃO: REVISÃO DE 1.000 KM"}
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-zinc-300">
                      Veículo {alert.vehiclePlaca} ({alert.vehicleModelo})
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-zinc-200">
                    {alert.mensagem}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!pushEnabled && (
                  <button
                    onClick={handleEnablePush}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
                    title="Ativar Notificações Web Push no Navegador"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    Ativar Push
                  </button>
                )}
                <button
                  onClick={() => setDismissed((prev) => [...prev, alert.id])}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
                  title="Dispensar aviso por enquanto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
