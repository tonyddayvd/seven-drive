"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Lock, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, loginAdmin } = useSevenDrive();
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passwordInput);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPasswordInput("");
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Área Restrita do Locador
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Desbloquear Painel de Gestão
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Esta área contém os dados financeiros, contratos e gestão de toda a frota. Digite a senha mestra para prosseguir.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(false);
                }}
                placeholder="Digite a senha do administrador..."
                className={`w-full bg-zinc-950 border ${
                  error ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-blue-500"
                } rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 pr-11`}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold animate-shake">
                Senha incorreta. Tente novamente ou use a senha padrão inicial: admin123
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 transition"
            >
              <span>Acessar Painel do Locador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Senha padrão inicial: <strong className="text-zinc-300">admin123</strong> (alterável em Configurações)</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
