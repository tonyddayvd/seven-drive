export type UserRole = 'admin' | 'driver';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  cpf?: string | null;
  rg?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  contato_emergencia?: string | null;
  cnh_numero?: string | null;
  cnh_categoria?: string | null;
  cnh_validade?: string | null;
  cnh_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  renavam: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  combustivel: string;
  chassi: string;
  km_inicial: number;
  km_atual: number;
  crlv_url?: string | null;
  status: 'disponivel' | 'alugado' | 'manutencao';
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  vehicle_id: string;
  driver_id: string;
  valor_aluguel: number;
  periodicidade: 'semanal' | 'mensal';
  dia_vencimento: number;
  data_inicio: string;
  data_fim?: string | null;
  status: 'ativo' | 'encerrado';
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  vehicle?: Vehicle;
  driver?: Profile;
}

export interface Payment {
  id: string;
  contract_id: string;
  vehicle_id: string;
  driver_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status: 'pendente_envio' | 'pendente_conferencia' | 'confirmado' | 'atrasado';
  comprovante_url?: string | null;
  observacao_admin?: string | null;
  semana_ano?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  contract?: Contract;
  vehicle?: Vehicle;
  driver?: Profile;
  inspection?: Inspection;
}

export interface Inspection {
  id: string;
  payment_id?: string | null;
  vehicle_id: string;
  driver_id: string;
  km_registrado: number;
  foto_frente_url: string;
  foto_lateral_esq_url: string;
  foto_lateral_dir_url: string;
  foto_traseira_url: string;
  foto_interior_url: string;
  foto_odometro_url: string;
  observacoes?: string | null;
  status_conferencia: 'pendente' | 'aprovada' | 'rejeitada';
  created_at: string;
  // Joins
  vehicle?: Vehicle;
  driver?: Profile;
}

export interface MaintenanceRule {
  id: string;
  nome_item: string;
  intervalo_km: number;
  alerta_amarelo_km: number;
  alerta_vermelho_km: number;
  ativo: boolean;
  created_at: string;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  driver_id?: string | null;
  rule_id?: string | null;
  tipo_item: string;
  km_realizado: number;
  data_realizada: string;
  valor_custo: number;
  foto_nota_url?: string | null;
  foto_odometro_url?: string | null;
  status: 'solicitado' | 'aprovado' | 'concluido';
  observacoes?: string | null;
  created_at: string;
  // Joins
  vehicle?: Vehicle;
  driver?: Profile;
  rule?: MaintenanceRule;
}

export interface Fine {
  id: string;
  vehicle_id: string;
  driver_id?: string | null;
  auto_infracao: string;
  data_infracao: string;
  valor: number;
  pontos: number;
  orgao_emissor: string;
  descricao: string;
  local_infracao?: string | null;
  limite_defesa_data?: string | null;
  status_pagamento: 'pendente' | 'pago_locador' | 'repassado_locatario' | 'pago_locatario';
  status_transferencia_pontos: 'pendente' | 'fici_gerado' | 'transferido';
  created_at: string;
  // Joins
  vehicle?: Vehicle;
  driver?: Profile;
}

export interface Expense {
  id: string;
  vehicle_id: string;
  tipo: 'ipva' | 'seguro' | 'taxa' | 'licenciamento' | 'manutencao' | 'outros';
  valor: number;
  data_despesa: string;
  descricao?: string | null;
  comprovante_url?: string | null;
  created_at: string;
  // Joins
  vehicle?: Vehicle;
}

export interface SystemSettings {
  id: string;
  chave_pix: string;
  tipo_chave_pix: string;
  nome_beneficiario: string;
  cidade_beneficiario: string;
  dias_alerta_vencimento: number;
  created_at: string;
  updated_at: string;
}
