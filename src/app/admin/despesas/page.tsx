"use client";

import React, { useState, useMemo } from "react";
import { useSevenDrive } from "@/lib/store";
import { formatCurrency, formatPlate } from "@/lib/utils";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Car,
  Shield,
  FileText,
  CheckCircle2,
  X,
  ExternalLink,
  Filter,
  Layers,
  Upload,
} from "lucide-react";

type ExpenseType = "seguro" | "ipva" | "licenciamento" | "taxa" | "manutencao" | "outros";

const categoryLabels: Record<ExpenseType, { label: string; color: string; bg: string }> = {
  seguro: { label: "Seguro do Carro", color: "text-blue-400 border-blue-500/30", bg: "bg-blue-500/10" },
  ipva: { label: "IPVA", color: "text-purple-400 border-purple-500/30", bg: "bg-purple-500/10" },
  licenciamento: { label: "Licenciamento / DPVAT", color: "text-amber-400 border-amber-500/30", bg: "bg-amber-500/10" },
  taxa: { label: "Taxa / Emplacamento / Detran", color: "text-emerald-400 border-emerald-500/30", bg: "bg-emerald-500/10" },
  manutencao: { label: "Manutenção Operacional", color: "text-orange-400 border-orange-500/30", bg: "bg-orange-500/10" },
  outros: { label: "Outros Custos", color: "text-zinc-300 border-zinc-600", bg: "bg-zinc-800" },
};

export default function DespesasPage() {
  const { vehicles, expenses, addExpense, deleteExpense } = useSevenDrive();

  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>("todos");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState<{
    vehicle_id: string;
    tipo: ExpenseType;
    valor: string;
    data_despesa: string;
    descricao: string;
    comprovante_url: string;
  }>({
    vehicle_id: vehicles[0]?.id || "",
    tipo: "seguro",
    valor: "",
    data_despesa: new Date().toISOString().split("T")[0],
    descricao: "",
    comprovante_url: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      vehicle_id: vehicles[0]?.id || "",
      tipo: "seguro",
      valor: "",
      data_despesa: new Date().toISOString().split("T")[0],
      descricao: "",
      comprovante_url: "",
    });
    setDocFileName("");
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            comprovante_url: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id) {
      alert("Por favor selecione um veículo.");
      return;
    }

    const valorNum = parseFloat(formData.valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor insira um valor válido maior que zero.");
      return;
    }

    addExpense({
      vehicle_id: formData.vehicle_id,
      tipo: formData.tipo,
      valor: valorNum,
      data_despesa: formData.data_despesa,
      descricao: formData.descricao || "",
      comprovante_url: formData.comprovante_url || null,
    });

    const veh = vehicles.find((v) => v.id === formData.vehicle_id);
    const label = categoryLabels[formData.tipo]?.label || "Despesa";
    setSuccessMessage(`${label} de ${formatCurrency(valorNum)} para o veículo ${veh?.placa || ""} lançado com sucesso!`);
    setIsModalOpen(false);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Filtragem
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchVeh = selectedVehicleFilter === "todos" || exp.vehicle_id === selectedVehicleFilter;
      const matchCat = selectedCategoryFilter === "todas" || exp.tipo === selectedCategoryFilter;
      return matchVeh && matchCat;
    });
  }, [expenses, selectedVehicleFilter, selectedCategoryFilter]);

  // Totais Consolidados
  const totalGeral = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Number(curr.valor), 0);
  }, [expenses]);

  const totalSeguro = useMemo(() => {
    return expenses
      .filter((e) => e.tipo === "seguro")
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
  }, [expenses]);

  const totalIpvaLic = useMemo(() => {
    return expenses
      .filter((e) => e.tipo === "ipva" || e.tipo === "licenciamento")
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
  }, [expenses]);

  const totalOutros = useMemo(() => {
    return expenses
      .filter((e) => e.tipo !== "seguro" && e.tipo !== "ipva" && e.tipo !== "licenciamento")
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-blue-500" />
            Custos & Despesas Extras da Frota
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Lançamento de seguros, IPVA, licenciamento, taxas e custos operacionais que abatem automaticamente do saldo líquido do veículo.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Novo Custo / Seguro</span>
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Despesas</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalGeral)}</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            {expenses.length} lançamento(s) na nuvem
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Seguros de Carro</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">{formatCurrency(totalSeguro)}</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Apólices e mensalidades
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">IPVA & Licenciamento</span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400">{formatCurrency(totalIpvaLic)}</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Tributos e taxas obrigatórias
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Outros Custos / Taxas</span>
            <div className="p-2 bg-zinc-800 rounded-xl text-zinc-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-200">{formatCurrency(totalOutros)}</div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Vistorias, emplacamento, outros
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto text-zinc-400 font-semibold">
          <Filter className="w-4 h-4 text-blue-500" />
          <span>Filtrar Custos:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 text-[11px]">Veículo:</span>
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Veículos</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatPlate(v.placa)} - {v.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 text-[11px]">Categoria:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="seguro">Seguro do Carro</option>
              <option value="ipva">IPVA</option>
              <option value="licenciamento">Licenciamento / DPVAT</option>
              <option value="taxa">Taxa / Emplacamento</option>
              <option value="manutencao">Manutenção Operacional</option>
              <option value="outros">Outros Custos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            Extrato de Custos Registrados ({filteredExpenses.length})
          </h2>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-400">
              Nenhuma despesa ou custo lançado no momento.
            </p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Clique no botão acima para registrar os custos do seguro, IPVA, licenciamento ou outras despesas do seu veículo.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Lançar Primeira Despesa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Veículo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Data da Despesa</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Comprovante</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredExpenses.map((exp) => {
                  const veh = vehicles.find((v) => v.id === exp.vehicle_id);
                  const cat = categoryLabels[exp.tipo] || categoryLabels.outros;

                  return (
                    <tr key={exp.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{veh ? `${veh.marca} ${veh.modelo}` : "Veículo Removido"}</div>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {veh ? formatPlate(veh.placa) : exp.vehicle_id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg}`}
                        >
                          {cat.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300">
                        {exp.descricao || "Sem descrição informada"}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {exp.data_despesa.split("-").reverse().join("/")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-sm text-red-400">
                        - {formatCurrency(Number(exp.valor))}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {exp.comprovante_url ? (
                          <button
                            onClick={() => setViewingDocUrl(exp.comprovante_url!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 text-[11px] font-bold border border-blue-800/80 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Anexo</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-600">Sem anexo</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente remover esta despesa de ${formatCurrency(Number(exp.valor))}?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition"
                          title="Excluir Custo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Lançar Nova Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-500" />
                Lançar Novo Custo / Despesa
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Veículo */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Veículo Beneficiário:
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                >
                  {vehicles.length === 0 && (
                    <option value="">Nenhum veículo cadastrado</option>
                  )}
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatPlate(v.placa)} - {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Custo e Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Tipo de Custo:
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ExpenseType })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="seguro">Seguro do Carro</option>
                    <option value="ipva">IPVA</option>
                    <option value="licenciamento">Licenciamento / DPVAT</option>
                    <option value="taxa">Taxa / Emplacamento Detran</option>
                    <option value="manutencao">Manutenção Operacional</option>
                    <option value="outros">Outros Custos Avulsos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Valor da Despesa (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 250.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Data da Despesa */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Data do Pagamento / Vencimento:
                </label>
                <input
                  type="date"
                  value={formData.data_despesa}
                  onChange={(e) => setFormData({ ...formData, data_despesa: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Descrição / Detalhes do Custo:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parcela 2 de 4 do Seguro Porto Seguro"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload de Comprovante / Apólice / Boleto */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Anexar Comprovante / Apólice / Boleto (PDF ou Imagem):
                </label>
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-xl cursor-pointer bg-zinc-950/60 transition group">
                  <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 mb-1" />
                  <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200">
                    {docFileName ? docFileName : "Clique para selecionar arquivo (PDF ou Imagem)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[11px] text-zinc-400">
                💡 Este custo abaterá automaticamente do <strong className="text-white">Saldo Líquido Real</strong> do veículo no Dashboard Executivo.
              </div>

              {/* Botões */}
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition"
                >
                  Salvar Custo na Nuvem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Documento Anexado */}
      {viewingDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                Comprovante / Documento da Despesa
              </h4>
              <button
                onClick={() => setViewingDocUrl(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] min-h-[400px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-2 w-full">
              {viewingDocUrl.startsWith("data:image") ? (
                <img src={viewingDocUrl} alt="Comprovante da Despesa" className="max-w-full max-h-[70vh] object-contain rounded" />
              ) : viewingDocUrl.startsWith("data:application/pdf") ? (
                <div className="w-full h-[65vh] flex flex-col space-y-3">
                  <iframe
                    src={viewingDocUrl}
                    className="w-full flex-1 rounded border border-zinc-700 bg-white"
                    title="Visualização da Despesa em PDF"
                  />
                  <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Comprovante em formato PDF
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const byteString = atob(viewingDocUrl.split(",")[1]);
                          const ab = new ArrayBuffer(byteString.length);
                          const ia = new Uint8Array(ab);
                          for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                          }
                          const blob = new Blob([ab], { type: "application/pdf" });
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.download = "Comprovante_Despesa.pdf";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (e) {
                          window.open(viewingDocUrl, "_blank");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Baixar / Abrir PDF Completo
                    </button>
                  </div>
                </div>
              ) : (
                <a
                  href={viewingDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir Documento em Nova Aba
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
