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
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return dateString;
  }
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
// GERADOR DE CÓDIGO PIX (EMV / BR CODE PADRÃO BANCO CENTRAL)
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

export function generatePixPayload({
  key,
  merchantName = "Seven Drive",
  merchantCity = "SAO PAULO",
  amount,
  txid = "***",
}: {
  key: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
}): string {
  // Limpeza de campos para formato padrão BR Code
  const cleanKey = key.trim();
  const cleanName = merchantName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 25);
  const cleanCity = merchantCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 15);
  const cleanTxid = txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  // GUI + Chave
  const accountInfo = emvField("00", "br.gov.bcb.pix") + emvField("01", cleanKey);

  let payload =
    emvField("00", "01") + // Payload Format Indicator
    emvField("26", accountInfo) + // Merchant Account Information
    emvField("52", "0000") + // Merchant Category Code
    emvField("53", "986"); // Transaction Currency (986 = BRL)

  if (amount && amount > 0) {
    payload += emvField("54", amount.toFixed(2));
  }

  payload +=
    emvField("58", "BR") + // Country Code
    emvField("59", cleanName) + // Merchant Name
    emvField("60", cleanCity) + // Merchant City
    emvField("62", emvField("05", cleanTxid)) + // Additional Data Field Template (TxID)
    "6304"; // CRC16 Header

  const checksum = crc16(payload);
  return `${payload}${checksum}`;
}
