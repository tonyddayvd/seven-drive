import React from "react";

interface CarDiagramProps {
  angle:
    | "frente"
    | "traseira"
    | "lateral_esquerda"
    | "lateral_direita"
    | "lateralEsq"
    | "lateralDir"
    | "interior"
    | "odometro"
    | string;
  className?: string;
}

export function CarDiagramIllustration({ angle, className = "w-full h-auto" }: CarDiagramProps) {
  switch (angle) {
    case "frente":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <path d="M 45 75 L 50 48 C 52 42 58 35 70 34 L 130 34 C 142 35 148 42 150 48 L 155 75 Z" fill="#27272a" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M 58 48 L 68 37 L 132 37 L 142 48 Z" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="35" y="70" width="130" height="32" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="42,75 62,75 58,84 42,84" fill="#38bdf8" opacity="0.9" />
          <polygon points="158,75 138,75 142,84 158,84" fill="#38bdf8" opacity="0.9" />
          <rect x="75" y="76" width="50" height="15" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <line x1="78" y1="83" x2="122" y2="83" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
          <rect x="80" y="93" width="40" height="8" rx="2" fill="#09090b" stroke="#38bdf8" strokeWidth="1" />
          <text x="100" y="99" fontSize="6" fontWeight="bold" fill="#38bdf8" textAnchor="middle">BRA-2026</text>
          <circle cx="48" cy="95" r="4" fill="#0ea5e9" opacity="0.8" />
          <circle cx="152" cy="95" r="4" fill="#0ea5e9" opacity="0.8" />
          <rect x="6" y="6" width="70" height="16" rx="4" fill="#0284c7" fillOpacity="0.2" />
          <text x="41" y="17" fontSize="8" fontWeight="bold" fill="#38bdf8" textAnchor="middle">FRENTE TOTAL</text>
        </svg>
      );
    case "traseira":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <path d="M 45 75 L 52 48 C 54 42 60 36 72 35 L 128 35 C 140 36 146 42 148 48 L 155 75 Z" fill="#27272a" stroke="#ef4444" strokeWidth="2.5" />
          <path d="M 60 48 L 70 38 L 130 38 L 140 48 Z" fill="#991b1b" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="35" y="70" width="130" height="32" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
          <polygon points="40,74 62,74 58,85 40,85" fill="#ef4444" />
          <polygon points="160,74 138,74 142,85 160,85" fill="#ef4444" />
          <rect x="80" y="76" width="40" height="12" rx="2" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
          <text x="100" y="85" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">MERCOSUL</text>
          <line x1="48" y1="96" x2="62" y2="96" stroke="#dc2626" strokeWidth="2" />
          <line x1="138" y1="96" x2="152" y2="96" stroke="#dc2626" strokeWidth="2" />
          <rect x="6" y="6" width="70" height="16" rx="4" fill="#ef4444" fillOpacity="0.2" />
          <text x="41" y="17" fontSize="8" fontWeight="bold" fill="#f87171" textAnchor="middle">TRASEIRA TOTAL</text>
        </svg>
      );
    case "lateral_esquerda":
    case "lateralEsq":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <path d="M 22 75 L 35 60 L 65 40 L 135 40 L 165 58 L 182 66 L 182 78 L 170 78 C 170 68 152 68 152 78 L 65 78 C 65 68 47 68 47 78 L 22 78 Z" fill="#27272a" stroke="#10b981" strokeWidth="2.5" />
          <path d="M 70 43 L 100 43 L 100 58 L 54 58 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.2" />
          <path d="M 104 43 L 132 43 L 152 58 L 104 58 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.2" />
          <line x1="102" y1="42" x2="102" y2="76" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="56" cy="78" r="14" fill="#09090b" stroke="#10b981" strokeWidth="3" />
          <circle cx="56" cy="78" r="6" fill="#334155" />
          <circle cx="161" cy="78" r="14" fill="#09090b" stroke="#10b981" strokeWidth="3" />
          <circle cx="161" cy="78" r="6" fill="#334155" />
          <rect x="6" y="6" width="94" height="16" rx="4" fill="#10b981" fillOpacity="0.2" />
          <text x="53" y="17" fontSize="8" fontWeight="bold" fill="#34d399" textAnchor="middle">LATERAL ESQUERDA</text>
        </svg>
      );
    case "lateral_direita":
    case "lateralDir":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ transform: "scaleX(-1)" }}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <path d="M 22 75 L 35 60 L 65 40 L 135 40 L 165 58 L 182 66 L 182 78 L 170 78 C 170 68 152 68 152 78 L 65 78 C 65 68 47 68 47 78 L 22 78 Z" fill="#27272a" stroke="#10b981" strokeWidth="2.5" />
          <path d="M 70 43 L 100 43 L 100 58 L 54 58 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.2" />
          <path d="M 104 43 L 132 43 L 152 58 L 104 58 Z" fill="#065f46" fillOpacity="0.35" stroke="#10b981" strokeWidth="1.2" />
          <line x1="102" y1="42" x2="102" y2="76" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="56" cy="78" r="14" fill="#09090b" stroke="#10b981" strokeWidth="3" />
          <circle cx="56" cy="78" r="6" fill="#334155" />
          <circle cx="161" cy="78" r="14" fill="#09090b" stroke="#10b981" strokeWidth="3" />
          <circle cx="161" cy="78" r="6" fill="#334155" />
          <rect x="6" y="6" width="94" height="16" rx="4" fill="#10b981" fillOpacity="0.2" />
          <text x="53" y="17" fontSize="8" fontWeight="bold" fill="#34d399" textAnchor="middle" style={{ transform: "scaleX(-1)", transformOrigin: "53px 17px" }}>LATERAL DIREITA</text>
        </svg>
      );
    case "interior":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <path d="M 20 20 L 180 20 L 165 95 L 35 95 Z" fill="#09090b" stroke="#475569" strokeWidth="1.5" />
          <path d="M 40 45 Q 40 30 55 30 Q 70 30 70 45 L 75 80 L 35 80 Z" fill="#27272a" stroke="#64748b" strokeWidth="2" />
          <rect x="46" y="16" width="18" height="12" rx="4" fill="#3f3f46" stroke="#64748b" strokeWidth="1.5" />
          <path d="M 130 45 Q 130 30 145 30 Q 160 30 160 45 L 165 80 L 125 80 Z" fill="#27272a" stroke="#64748b" strokeWidth="2" />
          <rect x="136" y="16" width="18" height="12" rx="4" fill="#3f3f46" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="65" cy="70" r="18" stroke="#38bdf8" strokeWidth="3" fill="#09090b" fillOpacity="0.4" />
          <circle cx="65" cy="70" r="6" fill="#38bdf8" />
          <line x1="47" y1="70" x2="83" y2="70" stroke="#38bdf8" strokeWidth="2.5" />
          <line x1="65" y1="70" x2="65" y2="88" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="96" y="88" width="8" height="16" rx="3" fill="#94a3b8" />
          <circle cx="100" cy="86" r="4" fill="#e2e8f0" />
          <rect x="6" y="6" width="94" height="16" rx="4" fill="#38bdf8" fillOpacity="0.2" />
          <text x="53" y="17" fontSize="8" fontWeight="bold" fill="#38bdf8" textAnchor="middle">INTERIOR &amp; BANCOS</text>
        </svg>
      );
    case "odometro":
      return (
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect width="200" height="120" rx="12" fill="#18181b" />
          <rect x="25" y="20" width="150" height="85" rx="16" fill="#09090b" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="75" cy="62" r="28" stroke="#334155" strokeWidth="3" strokeDasharray="120 40" strokeLinecap="round" />
          <line x1="75" y1="62" x2="60" y2="46" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="75" cy="62" r="4" fill="#ef4444" />
          <rect x="110" y="46" width="55" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="137" y="60" fontSize="10" fontWeight="bold" fill="#facc15" textAnchor="middle" fontFamily="monospace">38.450</text>
          <text x="137" y="67" fontSize="6" fontWeight="bold" fill="#94a3b8" textAnchor="middle">KM TOTAL</text>
          <circle cx="118" cy="80" r="3" fill="#22c55e" />
          <circle cx="130" cy="80" r="3" fill="#eab308" />
          <circle cx="142" cy="80" r="3" fill="#ef4444" />
          <rect x="6" y="6" width="94" height="16" rx="4" fill="#f59e0b" fillOpacity="0.2" />
          <text x="53" y="17" fontSize="8" fontWeight="bold" fill="#f59e0b" textAnchor="middle">ODÔMETRO &amp; PAINEL</text>
        </svg>
      );
    default:
      return null;
  }
}