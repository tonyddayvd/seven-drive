"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { compressImage } from "@/lib/image-compressor";

function PagarWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramPaymentId = searchParams.get("id");

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

  // Busca os pagamentos do motorista
  const driverPayments = payments.filter(
    (p) => (activeContract && p.contract_id === activeContract.id) || p.driver_id === activeDriver.id || p.vehicle_id === vehicle?.id
  );

  // Seleciona o pagamento específico da URL, ou o recusado prioritariamente, ou o mais próximo a vencer
  const paramPayment = paramPaymentId ? payments.find((p) => p.id === paramPaymentId) : null;
  const rejectedPayment = driverPayments.find((p) => p.status === "recusado");

  const openPayments = driverPayments
    .filter((p) => p.status === "recusado" || p.status === "pendente_envio" || p.status === "atrasado" || p.status === "pendente_conferencia")
    .sort((a, b) => {
      if (a.status === "recusado" && b.status !== "recusado") return -1;
      if (b.status === "recusado" && a.status !== "recusado") return 1;
      return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
    });

  const currentPayment = paramPayment || rejectedPayment || openPayments[0] || driverPayments[0];

  // Estados do Wizard
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [compressingReceipt, setCompressingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vistoria: o KM inicial deve ser vazio ou 0 para exigir digitação explícita do motorista
  const previousKM = vehicle ? vehicle.km_atual : 0;
  const [currentKM, setCurrentKM] = useState<number>(0);
  const [photos, setPhotos] = useState<InspectionPhotos>({
    frente: "",
    lateralEsq: "",
    lateralDir: "",
    traseira: "",
    interior: "",
    odometro: "",
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

  // Validação da Etapa 3: 6 fotos + KM estritamente superior ao anterior
  const filledPhotosCount = Object.values(photos).filter(Boolean).length;
  const isKMValid = previousKM > 0 ? currentKM > previousKM : currentKM > 0;
  const isInspectionValid = filledPhotosCount === 6 && isKMValid;

  const handleReceiptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      try {
        setCompressingReceipt(true);
        const compressed = await compressImage(file, 1400, 1400, 0.75);
        setReceiptUrl(compressed);
      } catch (err) {
        console.error("Erro ao processar comprovante:", err);
      } finally {
        setCompressingReceipt(false);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!isReceiptValid || !isInspectionValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await submitPaymentAndInspection({
        paymentId: currentPayment.id,
        receiptUrl,
        kmRegistrado: currentKM,
        photos,
        observacoes,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Erro ao enviar pagamento e vistoria:", err);
      alert("Houve um erro no processamento do envio. Por favor tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
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
          Seu comprovante e as 6 fotos da vistoria digital com o novo KM ({currentKM.toLocaleString("pt-BR")} km) foram enviados com sucesso para a <strong>Fila de Conferência do Locador</strong>.
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
      {/* Alerta Chamativo se o Pagamento Estiver Recusado */}
      {currentPayment.status === "recusado" && (
        <div className="p-4 sm:p-5 bg-red-950/80 border-2 border-red-500 rounded-3xl text-xs space-y-2.5 text-red-200 shadow-xl shadow-red-950/50 animate-fade-in">
          <div className="flex items-center gap-2 text-red-400 font-black text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Atenção: Você está corrigindo um envio que foi recusado pelo locador</span>
          </div>
          <div className="bg-black/60 p-3.5 rounded-2xl border border-red-900/60">
            <span className="text-red-400 font-bold block mb-1 uppercase text-[10px] tracking-wide">
              Motivo da Recusa Informado pelo Locador:
            </span>
            <p className="text-zinc-200 italic font-medium leading-relaxed">
              &ldquo;{currentPayment.motivo_recusa || currentPayment.observacao_admin || "Comprovante ilegível ou vistoria necessita de reenvio."}&rdquo;
            </p>
          </div>
          <p className="text-zinc-300">
            Substitua o comprovante de pagamento ou as fotos conforme solicitado acima e conclua o envio para nova análise.
          </p>
        </div>
      )}

      {/* Cabeçalho do Wizard */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {currentPayment.status === "recusado" ? "Correção & Reenvio de Pagamento" : "Pagamento do Aluguel & Vistoria Obrigatória"}
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
        ].map((item) => {
          const isAccessible =
            item.step === 1 ||
            (item.step === 2) ||
            (item.step === 3 && isReceiptValid);

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => {
                if (item.step === 3 && !isReceiptValid) return;
                setCurrentStep(item.step as any);
              }}
              className={`py-3 px-2 rounded-xl text-center border transition-all ${
                currentStep === item.step
                  ? "bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-900/30"
                  : currentStep > item.step
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                  : isAccessible
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  : "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <span className="text-xs block">{item.label}</span>
            </button>
          );
        })}
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
              keyType={settings.tipo_chave_pix}
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
                {compressingReceipt ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Comprovante...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Escolher Arquivo do Comprovante</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  disabled={compressingReceipt}
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

              {!isReceiptValid && (
                <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Anexe o comprovante para poder avançar</span>
                </div>
              )}

              <button
                type="button"
                disabled={!isReceiptValid}
                onClick={() => setCurrentStep(3)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition ${
                  isReceiptValid
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                }`}
              >
                <span>Avançar para Vistoria Digital</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: VISTORIA DIGITAL OBRIGATÓRIA (6 FOTOS + KM SUPERIOR) */}
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
              previousKM={previousKM}
            />

            {/* Alerta de Validação com detalhes claros */}
            {(!isInspectionValid || !isReceiptValid) && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {!isReceiptValid
                    ? "Comprovante bancário pendente na Etapa 2."
                    : filledPhotosCount < 6
                    ? `Complete todas as 6 fotos da vistoria (atualmente ${filledPhotosCount} de 6).`
                    : !isKMValid
                    ? `A quilometragem informada (${currentKM} km) deve ser maior que o último registro do veículo (${previousKM.toLocaleString("pt-BR")} km).`
                    : "Preencha todos os campos obrigatórios para enviar."}
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
                disabled={!isInspectionValid || !isReceiptValid || isSubmitting}
                onClick={handleFinalSubmit}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm shadow-xl transition-all ${
                  isInspectionValid && isReceiptValid && !isSubmitting
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 scale-[1.02]"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando Comprovante e Vistoria...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Concluir e Enviar para Conferência</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PagarWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto p-12 text-center text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-xs">Carregando dados de pagamento...</span>
        </div>
      }
    >
      <PagarWizardContent />
    </Suspense>
  );
}
