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
  Key,
  Copy,
  Check,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const { settings, updateSettings, triggerBrowserNotification } = useSevenDrive();

  const [formData, setFormData] = useState({
    chave_pix: settings.chave_pix,
    tipo_chave_pix: settings.tipo_chave_pix,
    nome_beneficiario: settings.nome_beneficiario,
    cidade_beneficiario: settings.cidade_beneficiario,
    dias_alerta_vencimento: settings.dias_alerta_vencimento,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          Configurações do Sistema
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Definição da chave PIX oficial para recebimento, regras financeiras e integração de banco de dados.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">Configurações atualizadas com sucesso!</span>
        </div>
      )}

      {/* 1. Configurações de Recebimento PIX */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          Dados de Recebimento PIX do Locador
        </h2>
        <p className="text-xs text-zinc-400">
          Esses dados serão utilizados para gerar automaticamente o QR Code dinâmico e o código Copia e Cola na tela do motorista.
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

      {/* 2. Notificações Web Push */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BellRing className="w-5 h-5 text-amber-400" />
          Notificações Web Push no Navegador
        </h2>
        <p className="text-xs text-zinc-400">
          Dispara avisos sonoros e visuais diretamente no Windows/Android/iOS do Locador e do Locatário para avisos de revisão em 1.000 km e 500 km.
        </p>

        <button
          onClick={handleTestPush}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition"
        >
          <BellRing className="w-4 h-4 text-amber-400" />
          <span>Disparar Notificação de Teste no Navegador</span>
        </button>
      </div>

      {/* 3. Infraestrutura Supabase Free Tier */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Status do Banco de Dados Supabase (R$ 0,00/mês)
        </h2>
        <p className="text-xs text-zinc-400">
          O schema PostgreSQL completo com todas as tabelas, funções de RLS e purga automática de 60 dias está localizado no diretório:
        </p>
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400 select-all">
          supabase/migrations/20260912_initial_schema.sql
        </div>
      </div>
    </div>
  );
}
