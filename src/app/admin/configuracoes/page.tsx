"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import {
  Sliders,
  QrCode,
  Save,
  CheckCircle2,
  BellRing,
  Database,
  Lock,
  Share2,
  Copy,
  Check,
  Trash2,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const {
    settings,
    updateSettings,
    triggerBrowserNotification,
    adminPassword,
    setAdminPassword,
    clearOrphanMockData,
  } = useSevenDrive();

  const [formData, setFormData] = useState({
    chave_pix: settings.chave_pix,
    tipo_chave_pix: settings.tipo_chave_pix,
    nome_beneficiario: settings.nome_beneficiario,
    cidade_beneficiario: settings.cidade_beneficiario,
    dias_alerta_vencimento: settings.dias_alerta_vencimento,
  });

  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length >= 4) {
      setAdminPassword(newPassword.trim());
      setPasswordSaved(true);
      setNewPassword("");
      setTimeout(() => setPasswordSaved(false), 4000);
    } else {
      alert("A senha de administrador deve ter pelo menos 4 caracteres.");
    }
  };

  const handleCopyDriverLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const origin = window.location.origin;
      const driverUrl = `${origin}/motorista`;
      navigator.clipboard.writeText(driverUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCleanData = () => {
    if (confirm("Deseja remover todos os custos e registros de veículos que já foram excluídos?")) {
      clearOrphanMockData();
      setCleaned(true);
      setTimeout(() => setCleaned(false), 4000);
    }
  };

  const handleTestPush = () => {
    triggerBrowserNotification(
      "Seven Drive - Teste de Alerta",
      "Sistema de notificações Web Push funcionando perfeitamente sem custos!"
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Configurações do Sistema & Segurança
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Definição de senha do administrador, chave PIX, isolamento de links para motoristas e manutenção do banco.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Configurações PIX atualizadas com sucesso!</span>
        </div>
      )}

      {passwordSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Senha de Administrador alterada com sucesso!</span>
        </div>
      )}

      {cleaned && (
        <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-500/60 text-blue-200 flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Registros órfãos e dados de veículos antigos removidos com sucesso! O dashboard agora reflete estritamente sua frota atual.</span>
        </div>
      )}

      {/* 1. Segurança: Senha do Administrador (Área do Locador) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Senha de Acesso do Administrador (Locador)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Protege o painel executivo, contratos e finanças. Defina sua senha pessoal para bloquear acessos não autorizados.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 text-xs">
          <div className="relative flex-1">
            <KeyRound className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha do Locador (ex: sua senha pessoal)..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md"
          >
            Alterar Senha do Admin
          </button>
        </form>
      </div>

      {/* 2. Link Exclusivo para Envio ao Motorista (Locatário) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                Link Oficial Exclusivo do Motorista (Locatário)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Isolado
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Envie este link para o seu motorista. O motorista terá acesso <strong>apenas</strong> à tela do carro dele, wizard de pagamento PIX e envio de vistorias, sem visualizar seu painel financeiro nem outros carros.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
          <span className="font-mono text-xs text-emerald-400 truncate flex-1 select-all">
            {typeof window !== "undefined" ? `${window.location.origin}/motorista` : "https://seven-drive.vercel.app/motorista"}
          </span>
          <button
            type="button"
            onClick={handleCopyDriverLink}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition shadow-sm ${
              copiedLink
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Link Copiado!" : "Copiar Link do Motorista"}</span>
          </button>
        </div>
      </div>

      {/* 3. Status da Nuvem Supabase & Sincronização em Tempo Real */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Nuvem Supabase & Sincronização Contínua</h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Nuvem Ativa & Conectada
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Todos os dados agora são salvos diretamente no seu banco de dados em nuvem. Qualquer veículo, motorista ou pagamento criado no computador é refletido automaticamente no celular e vice-versa.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-zinc-300 space-y-0.5">
            <span className="font-bold text-white block">Sincronização Multi-Dispositivo</span>
            <span className="text-zinc-400 block text-[11px]">
              Se você acabou de abrir o sistema no computador onde cadastrou seu veículo, clique abaixo para enviar os dados cadastrados para a nuvem imediatamente.
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                const v = localStorage.getItem("sevendrive_vehicles");
                const p = localStorage.getItem("sevendrive_profiles");
                const c = localStorage.getItem("sevendrive_contracts");
                const pay = localStorage.getItem("sevendrive_payments");
                const insp = localStorage.getItem("sevendrive_inspections");
                const m = localStorage.getItem("sevendrive_maintenances");
                const f = localStorage.getItem("sevendrive_fines");
                const exp = localStorage.getItem("sevendrive_expenses");
                const s = localStorage.getItem("sevendrive_settings");

                if (v) await supabase.from("vehicles").upsert(JSON.parse(v));
                if (p) await supabase.from("profiles").upsert(JSON.parse(p));
                if (c) await supabase.from("contracts").upsert(JSON.parse(c));
                if (pay) await supabase.from("payments").upsert(JSON.parse(pay));
                if (insp) await supabase.from("inspections").upsert(JSON.parse(insp));
                if (m) await supabase.from("maintenances").upsert(JSON.parse(m));
                if (f) await supabase.from("fines").upsert(JSON.parse(f));
                if (exp) await supabase.from("expenses").upsert(JSON.parse(exp));
                if (s) await supabase.from("system_settings").upsert([JSON.parse(s)]);

                alert("Sucesso! Todos os dados do computador foram enviados para a nuvem. Agora abra o celular e atualize a página!");
              } catch (err: any) {
                alert("Erro ao enviar: " + err.message);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition whitespace-nowrap"
          >
            <Database className="w-4 h-4" />
            <span>Enviar Dados do PC para Nuvem</span>
          </button>
        </div>
      </div>

      {/* 4. Limpeza de Custos Antigos / Dados Órfãos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Limpeza de Dados Antigos & Resíduos de Veículos Excluídos
        </h2>
        <p className="text-xs text-zinc-400">
          Se você excluiu os veículos de teste e cadastrou seus veículos reais, use este botão para limpar instantaneamente qualquer despesa, manutenção ou multa que pertencia aos veículos antigos.
        </p>
        <div>
          <button
            type="button"
            onClick={handleCleanData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 font-bold text-xs transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Dados de Veículos Excluídos do Dashboard</span>
          </button>
        </div>
      </div>

      {/* 4. Configurações de Recebimento PIX */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          Dados de Recebimento PIX do Locador
        </h2>
        <p className="text-xs text-zinc-400">
          Esses dados serão utilizados para gerar o QR Code dinâmico e o código Copia e Cola na tela do motorista.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Tipo de Chave PIX:</label>
              <select
                value={formData.tipo_chave_pix}
                onChange={(e) => setFormData({ ...formData, tipo_chave_pix: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
              >
                <option value="E-mail">E-mail</option>
                <option value="CPF/CNPJ">CPF/CNPJ</option>
                <option value="Telefone">Telefone</option>
                <option value="Chave Aleatória">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Chave PIX:</label>
              <input
                type="text"
                value={formData.chave_pix}
                onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                placeholder="Ex: financeiro@sevendrive.com.br"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Nome do Beneficiário (Banco):</label>
              <input
                type="text"
                value={formData.nome_beneficiario}
                onChange={(e) => setFormData({ ...formData, nome_beneficiario: e.target.value })}
                placeholder="Ex: Seven Drive Locadora Ltda"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Cidade do Beneficiário:</label>
              <input
                type="text"
                value={formData.cidade_beneficiario}
                onChange={(e) => setFormData({ ...formData, cidade_beneficiario: e.target.value.toUpperCase() })}
                placeholder="Ex: SAO PAULO"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white uppercase"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações PIX</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
