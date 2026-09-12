"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSevenDrive } from "@/lib/store";
import { PixQrCode } from "@/components/pix-display/PixQrCode";
import { InspectionStep, InspectionPhotos } from "@/components/inspection-camera/InspectionStep";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  Upload,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function PagarWizardPage() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    payments,
    settings,
    vehicles,
    contracts,
    submitPaymentAndInspection,
  } = useSevenDrive();

  // Encontra o motorista ativo dinamicamente (se logado como motorista ou o primeiro motorista real cadastrado)
  const activeDriver = profiles.find((p) => p.role === "driver" && (p.id === currentUser.id || currentUser.role !== "driver")) || currentUser;

  // Busca o contrato e veículo ativo do motorista
  const activeContract = contracts.find((c) => c.driver_id === activeDriver.id && c.status === "ativo") || contracts[0];
  const vehicle = vehicles.find((v) => v.id === activeContract?.vehicle_id) || vehicles[0];

  // Busca o pagamento em aberto do motorista
  const currentPayment = payments.find(
    (p) => (p.driver_id === activeDriver.id || p.vehicle_id === vehicle?.id) && (p.status === "pendente_envio" || p.status === "pendente_conferencia" || p.status === "atrasado")
  ) || payments.find((p) => p.driver_id === activeDriver.id || p.vehicle_id === vehicle?.id) || payments[0];

  // Estados do Wizard
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [receiptUrl, setReceiptUrl] = useState<string>(
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80"
  );
  const [receiptFileName, setReceiptFileName] = useState<string>("comprovante_pix.pdf");

  // Vistoria
  const [currentKM, setCurrentKM] = useState<number>(vehicle ? vehicle.km_atual + 150 : 38000);
  const [photos, setPhotos] = useState<InspectionPhotos>({
    frente: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&q=80",
    lateralEsq: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80",
    lateralDir: "https://images.unsplash.com/photo-1542362567-b07e5359a973?w=500&q=80",
    traseira: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80",
    interior: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80",
    odometro: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80",
  });
  const [observacoes, setObservacoes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!currentPayment) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Nenhum Pagamento Pendente</h2>
        <p className="text-xs text-zinc-400">
          Você está com todos os seus aluguéis em dia e quitados. Obrigado!
        </p>
      </div>
    );
  }

  // Validação da Etapa 2: Comprovante
  const isReceiptValid = Boolean(receiptUrl);

  // Validação da Etapa 3: 6 fotos + KM preenchido
  const filledPhotosCount = Object.values(photos).filter(Boolean).length;
  const isInspectionValid = filledPhotosCount === 6 && currentKM > 0;

  const handleReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    if (!isReceiptValid || !isInspectionValid) return;

    submitPaymentAndInspection({
      paymentId: currentPayment.id,
      receiptUrl,
      kmRegistrado: currentKM,
      photos,
      observacoes,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">
          Pagamento & Vistoria Enviados!
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Seu comprovante e as 6 fotos da vistoria digital com o KM ({currentKM} km) foram enviados com sucesso para a <strong>Fila de Conferência do Locador</strong>.
        </p>
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800 text-xs text-blue-300">
          O status do seu aluguel mudou para <strong>Pendente de Conferência</strong>. Assim que o locador confirmar, seu saldo e histórico serão atualizados.
        </div>
        <div className="pt-4">
          <button
            onClick={() => router.push("/motorista")}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition"
          >
            Voltar ao Meu Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho do Wizard */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Pagamento do Aluguel & Vistoria Obrigatória
        </h1>
        <p className="text-xs text-zinc-400">
          Processo sequencial em 3 etapas com dupla checagem de evidências.
        </p>
      </div>

      {/* Barra de Progresso das 3 Etapas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { step: 1, label: "1. PIX & QR Code" },
          { step: 2, label: "2. Comprovante" },
          { step: 3, label: "3. Vistoria (6 Fotos)" },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setCurrentStep(item.step as any)}
            className={`py-3 px-2 rounded-xl text-center border transition-all ${
              currentStep === item.step
                ? "bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-900/30"
                : currentStep > item.step
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
          >
            <span className="text-xs block">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da Etapa Atual */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* ETAPA 1: PIX E QR CODE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-zinc-400">Aluguel Semanal:</span>
                <h3 className="text-lg font-bold text-white">
                  Veículo {vehicle?.placa} ({vehicle?.marca} {vehicle?.modelo})
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Vencimento:</span>
                <span className="font-bold text-white block text-sm">
                  {formatDate(currentPayment.data_vencimento)}
                </span>
              </div>
            </div>

            <PixQrCode
              amount={Number(currentPayment.valor)}
              pixKey={settings.chave_pix}
              merchantName={settings.nome_beneficiario}
              merchantCity={settings.cidade_beneficiario}
            />

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition"
              >
                <span>Avançar para Envio do Comprovante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: UPLOAD DO COMPROVANTE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Etapa 2: Anexar Comprovante Bancário
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Faça o upload do comprovante de transferência bancária ou PIX (PDF, imagem ou captura de tela).
              </p>
            </div>

            {/* Dropzone do Comprovante */}
            <div className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 bg-zinc-950/60 transition">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <span className="text-sm font-bold text-white block">
                  {receiptFileName || "Nenhum arquivo selecionado"}
                </span>
                <span className="text-xs text-zinc-400">
                  Formatos aceitos: PDF, JPEG, PNG
                </span>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md transition">
                <Upload className="w-4 h-4" />
                <span>Escolher Arquivo do Comprovante</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Pré-visualização se for imagem */}
            {receiptUrl && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-300">
                  Pré-visualização do Comprovante:
                </span>
                <div className="max-h-60 overflow-hidden rounded-lg border border-zinc-700 bg-black/40 flex items-center justify-center">
                  <img
                    src={receiptUrl}
                    alt="Comprovante"
                    className="max-h-60 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition"
              >
                <span>Avançar para Vistoria Digital</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: VISTORIA DIGITAL OBRIGATÓRIA (6 FOTOS + KM) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Etapa 3: Vistoria Digital Obrigatória por Câmera
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Tire as 6 fotos do veículo e insira o KM exato do painel para finalizar o envio.
              </p>
            </div>

            <InspectionStep
              currentKM={currentKM}
              onKMChange={setCurrentKM}
              photos={photos}
              onPhotosChange={setPhotos}
              observacoes={observacoes}
              onObservacoesChange={setObservacoes}
            />

            {/* Alerta de Validação */}
            {(!isInspectionValid || !isReceiptValid) && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Para concluir o envio, certifique-se de que o comprovante bancário foi anexado, todas as 6 fotos foram tiradas e o KM atual foi informado.
                </span>
              </div>
            )}

            {/* Ações Finais */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                disabled={!isInspectionValid || !isReceiptValid}
                onClick={handleFinalSubmit}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm shadow-xl transition-all ${
                  isInspectionValid && isReceiptValid
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 scale-[1.02]"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Concluir e Enviar para Conferência</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
