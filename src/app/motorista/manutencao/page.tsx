"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSevenDrive } from "@/lib/store";
import { formatKM, formatPlate } from "@/lib/utils";
import {
  Wrench,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  Car,
} from "lucide-react";

export default function MotoristaManutencaoPage() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    vehicles,
    contracts,
    maintenanceRules,
    settings,
    addMaintenance,
    triggerBrowserNotification,
  } = useSevenDrive();

  const activeDriver = profiles.find((p) => p.role === "driver" && (p.id === currentUser.id || currentUser.role !== "driver")) || currentUser;
  const contract = contracts.find((c) => c.driver_id === activeDriver.id && c.status === "ativo") || contracts[0];
  const vehicle = vehicles.find((v) => v.id === contract?.vehicle_id) || vehicles[0];

  const [categoria, setCategoria] = useState<"periodica" | "corretiva">("periodica");
  const [tipoItem, setTipoItem] = useState(maintenanceRules[0]?.nome_item || "Troca de Óleo");
  const [formaPagamento, setFormaPagamento] = useState<"locador" | "desconto_aluguel" | "reembolso">("desconto_aluguel");
  const [kmRealizado, setKmRealizado] = useState(vehicle ? vehicle.km_atual : 139468);
  const [valorCusto, setValorCusto] = useState(250);
  const [fotoNotaUrl, setFotoNotaUrl] = useState("https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80");
  const [fotoOdometroUrl, setFotoOdometroUrl] = useState("https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80");
  const [observacoes, setObservacoes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Número do Gestor cadastrado no sistema (fallback para o telefone de Tony)
  const gestorPhone = (settings.whatsapp_gestor || "82988883740").replace(/\D/g, "");

  const handleFileUpload = (setter: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getWhatsAppMessage = () => {
    const formaTexto =
      formaPagamento === "desconto_aluguel"
        ? "Desconto na próxima parcela do aluguel"
        : formaPagamento === "reembolso"
        ? "Reembolso do valor gasto"
        : "Pago direto pelo Locador";

    const categoriaTexto = categoria === "periodica" ? "Periódica / Preventiva" : "Corretiva / Reparo Urgente";

    return encodeURIComponent(
      `Olá Tony (Gestor Seven Drive)!\n\n` +
      `🚗 *Solicitação de Manutenção / Reparo Realizado*\n` +
      `• *Motorista:* ${activeDriver.full_name}\n` +
      `• *Veículo:* ${vehicle?.marca} ${vehicle?.modelo} (${vehicle?.placa})\n` +
      `• *Categoria:* ${categoriaTexto}\n` +
      `• *Item / Serviço:* ${tipoItem}\n` +
      `• *KM do Veículo:* ${kmRealizado.toLocaleString("pt-BR")} km\n` +
      `• *Valor Gasto:* R$ ${valorCusto.toFixed(2)}\n` +
      `• *Opção de Acerto Escolhida:* ${formaTexto}\n` +
      (observacoes ? `• *Observações:* ${observacoes}\n` : "") +
      `\nEstou enviando em anexo por aqui a *foto da nota fiscal* e a *foto do odômetro* para sua conferência e aprovação!`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    addMaintenance({
      vehicle_id: vehicle.id,
      driver_id: currentUser.id,
      tipo_item: tipoItem,
      km_realizado: Number(kmRealizado),
      data_realizada: new Date().toISOString().split("T")[0],
      valor_custo: Number(valorCusto),
      foto_nota_url: fotoNotaUrl,
      foto_odometro_url: fotoOdometroUrl,
      observacoes,
      status: "solicitado",
      categoria,
      forma_pagamento_responsavel: formaPagamento,
    });

    triggerBrowserNotification(
      "Seven Drive - Evidência de Manutenção Enviada",
      `O motorista enviou solicitação de ${tipoItem} (${categoria === "periodica" ? "Periódica" : "Corretiva"}).`
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">Solicitação Registrada no Sistema!</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Sua solicitação de manutenção foi cadastrada e ficará aguardando aprovação do Gestor.
        </p>

        {/* Botão de Envio Direto via WhatsApp */}
        <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 text-left">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span>📱 Enviar Comprovante pelo WhatsApp</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Clique no botão abaixo para abrir a conversa com o Locador no WhatsApp já com a mensagem pronta preenchida, e anexe a foto da nota fiscal diretamente por lá!
          </p>
          <a
            href={`https://wa.me/55${gestorPhone}?text=${getWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition"
          >
            <span>Abrir WhatsApp do Gestor com Mensagem Pronta</span>
          </a>
        </div>

        <button
          onClick={() => router.push("/motorista")}
          className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition"
        >
          Voltar ao Meu Painel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Solicitar Revisão / Manutenção de Peças
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Informe os detalhes do serviço, escolha se pagou do bolso para abatimento ou reembolso, e envie a nota fiscal.
        </p>
      </div>

      {vehicle && (
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
          <span className="text-zinc-400">Veículo:</span>
          <span className="font-bold text-white flex items-center gap-1.5">
            <Car className="w-4 h-4 text-blue-400" />
            {vehicle.marca} {vehicle.modelo} ({formatPlate(vehicle.placa)})
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 text-xs">
        {/* 1. Categoria da Manutenção */}
        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-bold">Tipo de Manutenção:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCategoria("periodica")}
              className={`p-3 rounded-xl border text-left transition ${
                categoria === "periodica"
                  ? "bg-blue-600/20 border-blue-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <span className="font-bold block text-xs">🔄 Manutenção Periódica</span>
              <span className="text-[11px] opacity-80 block mt-0.5">Revisão por KM (Óleo, Filtro, Pneus etc)</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoria("corretiva")}
              className={`p-3 rounded-xl border text-left transition ${
                categoria === "corretiva"
                  ? "bg-amber-600/20 border-amber-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <span className="font-bold block text-xs">⚠️ Manutenção Corretiva</span>
              <span className="text-[11px] opacity-80 block mt-0.5">Conserto de quebra inesperada / reparo</span>
            </button>
          </div>
        </div>

        {/* 2. Item ou Serviço */}
        <div>
          <label className="block text-zinc-300 font-bold mb-1">Item / Serviço Realizado:</label>
          <select
            value={tipoItem}
            onChange={(e) => setTipoItem(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white"
          >
            {maintenanceRules.map((r) => (
              <option key={r.id} value={r.nome_item}>
                {r.nome_item} (Revisão a cada {r.intervalo_km.toLocaleString("pt-BR")} km)
              </option>
            ))}
            <option value="Outros Reparos">Outros Reparos / Peças</option>
          </select>
        </div>

        {/* 3. Forma de Acerto Financeiro */}
        <div className="space-y-1.5">
          <label className="block text-zinc-300 font-bold">Como foi feito o pagamento?:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormaPagamento("desconto_aluguel")}
              className={`p-2.5 rounded-xl border text-left transition ${
                formaPagamento === "desconto_aluguel"
                  ? "bg-emerald-600/20 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}
            >
              <span className="font-bold block text-xs">💸 Paguei do bolso</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Descontar no próximo aluguel</span>
            </button>

            <button
              type="button"
              onClick={() => setFormaPagamento("reembolso")}
              className={`p-2.5 rounded-xl border text-left transition ${
                formaPagamento === "reembolso"
                  ? "bg-emerald-600/20 border-emerald-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}
            >
              <span className="font-bold block text-xs">💳 Paguei do bolso</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Solicitar reembolso via PIX</span>
            </button>

            <button
              type="button"
              onClick={() => setFormaPagamento("locador")}
              className={`p-2.5 rounded-xl border text-left transition ${
                formaPagamento === "locador"
                  ? "bg-blue-600/20 border-blue-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}
            >
              <span className="font-bold block text-xs">🏢 Pago pelo Locador</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Locador pagou oficina</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 italic">
            * Todo abatimento ou reembolso necessita de análise e aprovação prévia do Gestor.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 font-bold mb-1">KM Atual no Momento da Troca:</label>
            <input
              type="number"
              value={kmRealizado}
              onChange={(e) => setKmRealizado(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">Valor Pago (R$):</label>
            <input
              type="number"
              step="0.01"
              value={valorCusto}
              onChange={(e) => setValorCusto(parseFloat(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white font-bold"
              required
            />
          </div>
        </div>

        {/* Uploads Obrigatórios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Foto da Nota Fiscal */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              1. Foto da Nota Fiscal / Recibo
            </span>
            <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 relative">
              <img src={fotoNotaUrl} alt="Nota Fiscal" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                <span className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-600">
                  Alterar Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(setFotoNotaUrl, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Foto do Odômetro */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              2. Foto do Odômetro (Painel)
            </span>
            <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 relative">
              <img src={fotoOdometroUrl} alt="Odômetro" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                <span className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-600">
                  Alterar Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(setFotoOdometroUrl, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-zinc-300 font-bold mb-1">Observações (Marca da peça, oficina etc):</label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Óleo Sintético 0W20 + Filtro Fram trocados no Auto Posto Shell."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition"
        >
          Enviar Evidências para o Locador
        </button>
      </form>
    </div>
  );
}
