"use client";

import React, { useState } from "react";
import { useSevenDrive } from "@/lib/store";
import { Vehicle } from "@/types/database";
import { formatKM, formatPlate } from "@/lib/utils";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  FileText,
  Upload,
  CheckCircle2,
  Wrench,
  X,
  Save,
  Eye,
  ExternalLink,
} from "lucide-react";

export default function VeiculosPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useSevenDrive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingKmId, setEditingKmId] = useState<string | null>(null);
  const [tempKm, setTempKm] = useState<number>(0);
  const [crlvFileName, setCrlvFileName] = useState<string>("");
  const [viewingCrlvUrl, setViewingCrlvUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    placa: "",
    renavam: "",
    marca: "",
    modelo: "",
    ano: 2024,
    cor: "Branco",
    combustivel: "Flex",
    chassi: "",
    km_inicial: 0,
    km_atual: 0,
    crlv_url: "",
    status: "disponivel" as Vehicle["status"],
  });

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setCrlvFileName("");
    setFormData({
      placa: "",
      renavam: "",
      marca: "",
      modelo: "",
      ano: 2024,
      cor: "Branco",
      combustivel: "Flex",
      chassi: "",
      km_inicial: 0,
      km_atual: 0,
      crlv_url: "",
      status: "disponivel",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setCrlvFileName(v.crlv_url ? "crlv_documento.pdf" : "");
    setFormData({
      placa: v.placa,
      renavam: v.renavam,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      combustivel: v.combustivel,
      chassi: v.chassi,
      km_inicial: v.km_inicial,
      km_atual: v.km_atual,
      crlv_url: v.crlv_url || "",
      status: v.status,
    });
    setIsModalOpen(true);
  };

  const handleCrlvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCrlvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            crlv_url: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, formData);
      setSuccessMessage(`Veículo ${formData.placa} atualizado com sucesso!`);
    } else {
      addVehicle(formData);
      setSuccessMessage(`Veículo ${formData.placa} cadastrado com sucesso e CRLV arquivado!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSaveQuickKm = (vehicleId: string) => {
    updateVehicle(vehicleId, { km_atual: tempKm });
    setEditingKmId(null);
    setSuccessMessage(`KM oficial atualizado para ${formatKM(tempKm)}!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Frota de Veículos & CRLV
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastro de veículos, validação manual de KM Oficial e upload real de documentos CRLV.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Veículo</span>
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
            <Car className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-semibold">Nenhum veículo cadastrado na frota.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
            >
              Cadastrar Primeiro Veículo
            </button>
          </div>
        ) : (
          vehicles.map((veh) => {
            const isKmEditing = editingKmId === veh.id;

            return (
              <div
                key={veh.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
                        {formatPlate(veh.placa)}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          veh.status === "alugado"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : veh.status === "disponivel"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {veh.status === "alugado"
                          ? "Alugado"
                          : veh.status === "disponivel"
                          ? "Disponível"
                          : "Manutenção"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-2">
                      {veh.marca} {veh.modelo}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Ano {veh.ano} • Cor {veh.cor} • {veh.combustivel}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(veh)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="Editar Veículo"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente remover o veículo ${veh.placa}? Todos os custos e contratos atrelados a ele também serão excluídos.`)) {
                          deleteVehicle(veh.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition"
                      title="Excluir Veículo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Informações de Documentação */}
                <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>RENAVAM:</span>
                    <span className="text-zinc-200">{veh.renavam}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>CHASSI:</span>
                    <span className="text-zinc-200 text-[10px]">{veh.chassi}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>KM Inicial:</span>
                    <span className="text-zinc-200">{formatKM(veh.km_inicial)}</span>
                  </div>
                </div>

                {/* Inserção Manual de KM Oficial pelo Locador */}
                <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      KM Oficial do Sistema:
                    </span>
                    {!isKmEditing && (
                      <button
                        onClick={() => {
                          setEditingKmId(veh.id);
                          setTempKm(veh.km_atual);
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                      >
                        Ajustar Manual
                      </button>
                    )}
                  </div>

                  {isKmEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        value={tempKm}
                        onChange={(e) => setTempKm(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveQuickKm(veh.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="Salvar KM Oficial"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingKmId(null)}
                        className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-lg font-mono font-black text-emerald-400">
                      {formatKM(veh.km_atual)}
                    </div>
                  )}
                </div>

                {/* Documento CRLV Fixo */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Documento CRLV:</span>
                  </div>
                  {veh.crlv_url ? (
                    <button
                      onClick={() => setViewingCrlvUrl(veh.crlv_url || null)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 underline"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizar CRLV
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-400 italic">Pendente upload</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro de Veículo com Upload Real de CRLV */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingVehicle ? "Editar Veículo" : "Cadastrar Novo Veículo na Frota"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Placa (Mercosul):</label>
                  <input
                    type="text"
                    placeholder="Ex: BRA2E19"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">RENAVAM:</label>
                  <input
                    type="text"
                    placeholder="Ex: 12345678901"
                    value={formData.renavam}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Marca:</label>
                  <input
                    type="text"
                    placeholder="Ex: Chevrolet"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Modelo:</label>
                  <input
                    type="text"
                    placeholder="Ex: Onix 1.0 Flex Plus"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Ano:</label>
                  <input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Cor:</label>
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Combustível:</label>
                  <select
                    value={formData.combustivel}
                    onChange={(e) => setFormData({ ...formData, combustivel: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Chassi:</label>
                <input
                  type="text"
                  placeholder="Ex: 9BGKS48V0PG123456"
                  value={formData.chassi}
                  onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">KM Inicial:</label>
                  <input
                    type="number"
                    value={formData.km_inicial}
                    onChange={(e) => setFormData({ ...formData, km_inicial: Number(e.target.value), km_atual: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle["status"] })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="alugado">Alugado</option>
                    <option value="manutencao">Em Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Upload REAL de Documento Fixo: CRLV */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <label className="block text-zinc-300 font-bold mb-1">
                  Upload de Documento Fixo: CRLV (PDF ou Foto)
                </label>
                <p className="text-[11px] text-zinc-400">
                  O documento CRLV fica armazenado na nuvem de forma permanente para consultas fiscais.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-bold transition shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Selecionar CRLV do Dispositivo</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleCrlvFileUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.crlv_url ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{crlvFileName || "Documento CRLV carregado com sucesso!"}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic">
                      Nenhum arquivo de CRLV selecionado
                    </span>
                  )}
                </div>

                {formData.crlv_url && formData.crlv_url.startsWith("data:image") && (
                  <div className="mt-2 max-w-[200px] rounded-lg overflow-hidden border border-zinc-700">
                    <img src={formData.crlv_url} alt="Preview CRLV" className="w-full h-auto" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de CRLV */}
      {viewingCrlvUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Documento CRLV do Veículo
              </h4>
              <button
                onClick={() => setViewingCrlvUrl(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2">
              {viewingCrlvUrl.startsWith("data:image") ? (
                <img src={viewingCrlvUrl} alt="CRLV" className="max-w-full h-auto rounded" />
              ) : (
                <div className="text-center py-8 text-zinc-300 space-y-3">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                  <p className="text-xs">Documento CRLV arquivado em formato digital.</p>
                  <a
                    href={viewingCrlvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Documento
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
