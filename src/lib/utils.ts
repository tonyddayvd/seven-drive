import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatKM(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0 km";
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const clean = String(dateString).trim();
    // Prioriza extração direta YYYY-MM-DD para evitar perda de 1 dia por fuso horário UTC
    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const clean = String(dateString).trim();
    // Se for formato ISO com hora zerada (ex: 2026-09-11T00:00:00+00:00), formata como data direta
    if (/^\d{4}-\d{2}-\d{2}(T00:00(:00)?(\.000)?(Z|\+00:00)?)?$/.test(clean)) {
      return formatDate(clean);
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return dateString;
  }
}

/**
 * Regra de Negócio Seven Drive:
 * O locatário tem até o fim do dia de vencimento (segunda-feira) para efetuar o pagamento.
 * Só é considerado atrasado a partir do dia seguinte (terça-feira).
 */
export function isPaymentLate(dueDateString: string, status: string): boolean {
  if (status === "confirmado" || status === "pendente_conferencia") return false;
  if (!dueDateString) return false;

  const cleanDue = dueDateString.split("T")[0];
  
  // Data atual no horário de Brasília (YYYY-MM-DD)
  const now = new Date();
  const spYear = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric" });
  const spMonth = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", month: "2-digit" });
  const spDay = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo", day: "2-digit" });
  const todayStr = `${spYear}-${spMonth}-${spDay}`;

  // Se a data de hoje for maior que a data de vencimento (ex: terça > segunda), está em atraso
  return todayStr > cleanDue;
}

export function formatPlate(plate: string | null | undefined): string {
  if (!plate) return "";
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return plate.toUpperCase();
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

// ==============================================================================
// GERADOR DE CÓDIGO PIX (EMV / BR CODE PADRÃO BANCO CENTRAL DO BRASIL)
// ==============================================================================

function emvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Normaliza a chave PIX conforme o padrão do Banco Central (BACEN):
 * - Telefone: Deve estar no formato internacional E.164 (+55DDDNÚMERO). Sem o +55, os bancos rejeitam.
 * - CPF: Apenas 11 números.
 * - CNPJ: Apenas 14 números.
 * - E-mail / EVP: Letras minúsculas / formato original.
 */
export function normalizePixKey(key: string, keyType?: string): string {
  if (!key) return "";
  let cleanKey = key.trim();

  const isDigitsOnly = /^\d+$/.test(cleanKey.replace(/[^\d]/g, ""));
  const rawDigits = cleanKey.replace(/\D/g, "");

  const type = keyType?.toLowerCase() || "";

  if (type.includes("tel") || type.includes("cel") || (!type && rawDigits.length === 11 && !cleanKey.includes("@") && !cleanKey.includes("."))) {
    // Se for telefone (ex: 82988883740 ou (82) 98888-3740)
    if (type.includes("tel") || type.includes("cel")) {
      if (!cleanKey.startsWith("+")) {
        return `+55${rawDigits}`;
      }
      return `+${rawDigits}`;
    }
  }

  if (type.includes("cpf") || type.includes("cnpj")) {
    return rawDigits;
  }

  // Se tem arroba, é email
  if (cleanKey.includes("@")) {
    return cleanKey.toLowerCase();
  }

  return cleanKey;
}

export function generatePixPayload({
  key,
  keyType,
  merchantName = "Seven Drive",
  merchantCity = "SAO PAULO",
  amount,
  txid = "***",
}: {
  key: string;
  keyType?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
}): string {
  // Normalização da Chave PIX segundo o BACEN
  const cleanKey = normalizePixKey(key, keyType);

  // Nome do recebedor (Max 25 caracteres, sem acentos, maiúsculo)
  const cleanName = merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, 25)
    .toUpperCase() || "RECEBEDOR";

  // Cidade do recebedor (Max 15 caracteres, sem acentos, maiúsculo)
  const cleanCity = merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, 15)
    .toUpperCase() || "SAO PAULO";

  // O BACEN padroniza '***' para QR Code estático sem txid específico, ou alfanumérico simples sem espaços
  const cleanTxid = txid && txid !== "***" 
    ? txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) 
    : "***";

  // GUI + Chave
  const accountInfo = emvField("00", "br.gov.bcb.pix") + emvField("01", cleanKey);

  let payload =
    emvField("00", "01") + // Payload Format Indicator
    emvField("01", "12") + // Point of Initiation Method (12 = QR reutilizável)
    emvField("26", accountInfo) + // Merchant Account Information
    emvField("52", "0000") + // Merchant Category Code
    emvField("53", "986"); // Transaction Currency (986 = Real BRL)

  if (amount && amount > 0) {
    payload += emvField("54", amount.toFixed(2));
  }

  payload +=
    emvField("58", "BR") + // Country Code
    emvField("59", cleanName) + // Merchant Name
    emvField("60", cleanCity) + // Merchant City
    emvField("62", emvField("05", cleanTxid)) + // Additional Data Field (TxID)
    "6304"; // CRC16 Header

  const checksum = crc16(payload);
  return `${payload}${checksum}`;
}
