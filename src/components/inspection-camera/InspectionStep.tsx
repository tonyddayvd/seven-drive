"use client";

import React, { useState } from "react";
import { Camera, Check, Upload, AlertCircle, Info, Image as ImageIcon } from "lucide-react";

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
}

export function InspectionStep({
  currentKM,
  onKMChange,
  photos,
  onPhotosChange,
  observacoes,
  onObservacoesChange,
}: InspectionStepProps) {
  const photoSlots = [
    { key: "frente", label: "Frente do Veículo", desc: "Foto frontal completa pegando a placa" },
    { key: "lateralEsq", label: "Lateral Esquerda", desc: "Foto completa da lateral do motorista" },
    { key: "lateralDir", label: "Lateral Direita", desc: "Foto completa da lateral do passageiro" },
    { key: "traseira", label: "Traseira do Veículo", desc: "Foto traseira completa com placa visível" },
    { key: "interior", label: "Interior / Bancos", desc: "Foto dos assentos, volante e higienização" },
    { key: "odometro", label: "Painel & Odômetro (KM)", desc: "Foto NÍTIDA e legível do velocímetro e KM" },
  ];

  const filledCount = Object.values(photos).filter(Boolean).length;
  const isComplete = filledCount === 6 && currentKM > 0;

  const handleFileUpload = (key: keyof InspectionPhotos, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotosChange({
            ...photos,
            [key]: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
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

      {/* Campo de KM Atual com Destaque */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <label className="block text-sm font-bold text-white mb-1">
          Quilometragem Atual (KM do Odômetro) <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-zinc-400 mb-3">
          Digite exatamente o valor exibido no painel do carro neste momento:
        </p>
        <div className="relative">
          <input
            type="number"
            value={currentKM || ""}
            onChange={(e) => onKMChange(Number(e.target.value))}
            placeholder="Ex: 38450"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg font-mono font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-3.5 text-zinc-400 font-bold text-sm">
            KM
          </span>
        </div>
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
                        capture="environment"
                        onChange={(e) => handleFileUpload(slot.key as keyof InspectionPhotos, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-800/40 hover:bg-zinc-800 transition aspect-video">
                    <div className="w-10 h-10 rounded-full bg-zinc-700/60 flex items-center justify-center text-zinc-300">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-300 text-center">
                      Tirar foto ou selecionar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileUpload(slot.key as keyof InspectionPhotos, e)}
                      className="hidden"
                    />
                  </label>
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
