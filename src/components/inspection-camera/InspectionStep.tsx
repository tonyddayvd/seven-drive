import React, { useState } from "react";
import { Camera, Check, Upload, AlertCircle, Info, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { CarDiagramIllustration } from "./CarDiagrams";
import { compressImage } from "@/lib/image-compressor";

export interface InspectionPhotos {
  frente: string;
  lateralEsq: string;
  lateralDir: string;
  traseira: string;
  interior: string;
  odometro: string;
}

interface InspectionStepProps {
  currentKM: number;
  onKMChange: (km: number) => void;
  photos: InspectionPhotos;
  onPhotosChange: (photos: InspectionPhotos) => void;
  observacoes: string;
  onObservacoesChange: (obs: string) => void;
  allowGallery?: boolean;
  previousKM?: number;
}

export function InspectionStep({
  currentKM,
  onKMChange,
  photos,
  onPhotosChange,
  observacoes,
  onObservacoesChange,
  allowGallery = false,
  previousKM,
}: InspectionStepProps) {
  const [compressingSlot, setCompressingSlot] = useState<string | null>(null);

  const photoSlots = [
    { key: "frente", label: "Frente do Veículo", desc: "Foto frontal completa pegando a placa" },
    { key: "lateralEsq", label: "Lateral Esquerda", desc: "Foto completa da lateral do motorista" },
    { key: "lateralDir", label: "Lateral Direita", desc: "Foto completa da lateral do passageiro" },
    { key: "traseira", label: "Traseira do Veículo", desc: "Foto traseira completa com placa visível" },
    { key: "interior", label: "Interior / Bancos", desc: "Foto dos assentos, volante e higienização" },
    { key: "odometro", label: "Painel & Odômetro (KM)", desc: "Foto NÍTIDA e legível do velocímetro e KM" },
  ];

  const filledCount = Object.values(photos).filter(Boolean).length;
  const isKMValid = previousKM !== undefined && previousKM > 0 ? currentKM > previousKM : currentKM > 0;
  const isComplete = filledCount === 6 && isKMValid;

  const handleFileUpload = async (key: keyof InspectionPhotos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setCompressingSlot(key);
        // Comprime automaticamente fotos de celulares (10MB -> ~100KB)
        const compressedBase64 = await compressImage(file, 1280, 1280, 0.72);
        onPhotosChange({
          ...photos,
          [key]: compressedBase64,
        });
      } catch (err) {
        console.error("Erro processando foto:", err);
      } finally {
        setCompressingSlot(null);
        e.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho explicativo */}
      <div className="bg-blue-950/40 border border-blue-800/80 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200 leading-relaxed">
          <strong className="text-white block mb-1">Vistoria Digital Obrigatória:</strong>
          Para sua segurança e do locador, tire as 6 fotos obrigatórias do veículo em local bem iluminado antes de enviar o pagamento. O comprovante só é liberado para conferência após todas as fotos e o KM atual serem preenchidos.
        </div>
      </div>

      {/* Campo de KM Atual com Destaque e Validação Superior */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-bold text-white">
            Quilometragem Atual (KM do Odômetro) <span className="text-red-500">*</span>
          </label>
          {previousKM !== undefined && previousKM > 0 && (
            <span className="text-xs text-zinc-400 font-mono">
              KM anterior: <strong className="text-zinc-200">{previousKM.toLocaleString("pt-BR")} km</strong>
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          {previousKM !== undefined && previousKM > 0 ? (
            <span>
              Digite a quilometragem exibida no painel. O valor <strong>deve ser maior</strong> que o último registro (<strong>{previousKM.toLocaleString("pt-BR")} km</strong>).
            </span>
          ) : (
            <span>Digite exatamente o valor exibido no painel do carro neste momento:</span>
          )}
        </p>
        <div className="relative">
          <input
            type="number"
            value={currentKM || ""}
            onChange={(e) => onKMChange(Number(e.target.value))}
            placeholder={previousKM ? `Maior que ${previousKM}` : "Ex: 38450"}
            className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-lg font-mono font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 ${
              previousKM !== undefined && previousKM > 0 && currentKM > 0 && currentKM <= previousKM
                ? "border-red-500 focus:ring-red-500"
                : "border-zinc-700 focus:ring-blue-500"
            }`}
          />
          <span className="absolute right-4 top-3.5 text-zinc-400 font-bold text-sm">
            KM
          </span>
        </div>

        {/* Mensagem de Erro de Validação de KM */}
        {previousKM !== undefined && previousKM > 0 && currentKM > 0 && currentKM <= previousKM && (
          <div className="mt-2.5 p-3 rounded-lg bg-red-950/60 border border-red-500 text-xs text-red-300 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>
              <strong>Quilometragem Inválida:</strong> O KM informado (<strong>{currentKM.toLocaleString("pt-BR")} km</strong>) não pode ser menor ou igual ao cadastrado anteriormente (<strong>{previousKM.toLocaleString("pt-BR")} km</strong>). O carro rodou durante a semana; informe a quilometragem atual do odômetro.
            </span>
          </div>
        )}

        {/* Feedback de Sucesso no KM */}
        {previousKM !== undefined && previousKM > 0 && currentKM > previousKM && (
          <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>
              Odômetro válido! (+{(currentKM - previousKM).toLocaleString("pt-BR")} km rodados nesta semana).
            </span>
          </div>
        )}
      </div>

      {/* Grid de Fotos de Vistoria (6 fotos) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">
            Fotos do Veículo ({filledCount} de 6 preenchidas)
          </h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              filledCount === 6
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {filledCount === 6 ? "Todas fotos prontas" : "Pendente fotos"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photoSlots.map((slot) => {
            const hasPhoto = Boolean(photos[slot.key as keyof InspectionPhotos]);
            const isOdometer = slot.key === "odometro";

            return (
              <div
                key={slot.key}
                className={`relative border rounded-xl p-3 flex flex-col justify-between transition-all ${
                  hasPhoto
                    ? "border-emerald-500/60 bg-emerald-950/10"
                    : isOdometer
                    ? "border-amber-500/60 bg-amber-950/10"
                    : "border-zinc-800 bg-zinc-900/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {slot.label}
                      {hasPhoto && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </h4>
                    {isOdometer && (
                      <span className="text-[10px] bg-amber-500 text-zinc-950 font-extrabold px-1.5 py-0.2 rounded">
                        Crucial
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-3">{slot.desc}</p>
                </div>

                {hasPhoto ? (
                  <div className="relative group rounded-lg overflow-hidden border border-zinc-700 aspect-video bg-zinc-950">
                    <img
                      src={photos[slot.key as keyof InspectionPhotos]}
                      alt={slot.label}
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                      <span className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-600">
                        Alterar Foto
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        {...(!allowGallery ? { capture: "environment" } : {})}
                        onChange={(e) => handleFileUpload(slot.key as keyof InspectionPhotos, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Desenho/Diagrama de Exemplo do Ângulo */}
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video relative group">
                      <CarDiagramIllustration
                        angle={slot.key as any}
                        className="w-full h-full object-contain p-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] text-zinc-300 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Exemplo do enquadramento
                        </span>
                      </div>
                    </div>

                    {/* Botão de Captura: Câmera para Motorista / Galeria para Admin */}
                    <label className="border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-950/40 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition">
                      {compressingSlot === slot.key ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                          <span className="text-xs font-bold text-amber-300">
                            Otimizando Foto...
                          </span>
                        </>
                      ) : allowGallery ? (
                        <>
                          <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-xs font-bold text-purple-300">
                            Selecionar da Galeria / Câmera
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-xs font-bold text-blue-300">
                            Tirar Foto Obrigatória
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={Boolean(compressingSlot)}
                        {...(!allowGallery ? { capture: "environment" } : {})}
                        onChange={(e) => handleFileUpload(slot.key as keyof InspectionPhotos, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Observações Opcionais */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <label className="block text-xs font-bold text-white mb-1">
          Observações Adicionais da Vistoria (Opcional)
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => onObservacoesChange(e.target.value)}
          placeholder="Ex: Veículo recém-lavado, pneu dianteiro com calibração feita, pequeno arranhão no para-choque traseiro..."
          rows={2}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
