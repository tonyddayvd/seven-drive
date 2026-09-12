import { Vehicle, Profile, Contract, Payment, Inspection, MaintenanceRule, Maintenance, Fine, Expense, SystemSettings } from "@/types/database";

export const initialProfiles: Profile[] = [
  {
    id: "admin-uuid-1",
    email: "admin@sevendrive.com.br",
    full_name: "Tony Admin (Locador)",
    role: "admin",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    telefone: "(11) 98888-7777",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo/SP",
    contato_emergencia: "(11) 97777-6666",
    cnh_numero: "00112233445",
    cnh_categoria: "AB",
    cnh_validade: "2028-10-15",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialVehicles: Vehicle[] = [];

export const initialContracts: Contract[] = [];

export const initialMaintenanceRules: MaintenanceRule[] = [
  {
    id: "rule-1",
    nome_item: "Troca de Óleo e Filtro",
    intervalo_km: 8000,
    alerta_amarelo_km: 1000,
    alerta_vermelho_km: 500,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-2",
    nome_item: "Alinhamento e Balanceamento",
    intervalo_km: 10000,
    alerta_amarelo_km: 1000,
    alerta_vermelho_km: 500,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-3",
    nome_item: "Pastilhas de Freio",
    intervalo_km: 20000,
    alerta_amarelo_km: 1500,
    alerta_vermelho_km: 500,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-4",
    nome_item: "Troca de Pneus",
    intervalo_km: 40000,
    alerta_amarelo_km: 2000,
    alerta_vermelho_km: 1000,
    ativo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-5",
    nome_item: "Filtro de Ar e Cabine",
    intervalo_km: 15000,
    alerta_amarelo_km: 1000,
    alerta_vermelho_km: 400,
    ativo: true,
    created_at: new Date().toISOString(),
  }
];

export const initialMaintenances: Maintenance[] = [];

export const initialPayments: Payment[] = [];

export const initialInspections: Inspection[] = [];

export const initialFines: Fine[] = [];

export const initialExpenses: Expense[] = [];

export const initialSettings: SystemSettings = {
  id: "sett-1",
  chave_pix: "financeiro@sevendrive.com.br",
  tipo_chave_pix: "E-mail",
  nome_beneficiario: "Seven Drive Gestão de Frotas",
  cidade_beneficiario: "SAO PAULO",
  dias_alerta_vencimento: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
