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
  {
    id: "driver-uuid-1",
    email: "carlos.silva@gmail.com",
    full_name: "Carlos Eduardo Silva",
    role: "driver",
    cpf: "345.678.901-22",
    rg: "45.678.910-1",
    telefone: "(11) 99123-4567",
    endereco: "Rua Vergueiro, 2500 - Vila Mariana, São Paulo/SP",
    contato_emergencia: "(11) 98111-2222 (Esposa Maria)",
    cnh_numero: "04981273910",
    cnh_categoria: "B",
    cnh_validade: "2027-05-20",
    cnh_url: "/placeholder-cnh.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "driver-uuid-2",
    email: "marcos.souza@gmail.com",
    full_name: "Marcos Vinicius Souza",
    role: "driver",
    cpf: "567.890.123-44",
    rg: "32.145.987-X",
    telefone: "(11) 97321-8899",
    endereco: "Av. do Cursino, 150 - Saúde, São Paulo/SP",
    contato_emergencia: "(11) 96543-2100 (Irmão Roberto)",
    cnh_numero: "05872194833",
    cnh_categoria: "B",
    cnh_validade: "2026-11-30",
    cnh_url: "/placeholder-cnh.pdf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: "veh-uuid-1",
    placa: "BRA2E19",
    renavam: "12345678901",
    marca: "Chevrolet",
    modelo: "Onix 1.0 Flex Plus",
    ano: 2023,
    cor: "Branco",
    combustivel: "Flex",
    chassi: "9BGKS48V0PG123456",
    km_inicial: 30000,
    km_atual: 37650, // Óleo vence aos 38.000 km -> Faltam 350 km (ALERTA VERMELHO URGENTE)
    crlv_url: "/placeholder-crlv.pdf",
    status: "alugado",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "veh-uuid-2",
    placa: "RTY7A88",
    renavam: "98765432109",
    marca: "Hyundai",
    modelo: "HB20 1.0 Sense",
    ano: 2024,
    cor: "Prata",
    combustivel: "Flex",
    chassi: "9BHBA51C8RP987654",
    km_inicial: 10000,
    km_atual: 19150, // Pastilhas vencem aos 20.000 km -> Faltam 850 km (ALERTA AMARELO ATENÇÃO)
    crlv_url: "/placeholder-crlv.pdf",
    status: "alugado",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "veh-uuid-3",
    placa: "KLO4H22",
    renavam: "55443322110",
    marca: "Fiat",
    modelo: "Mobi 1.0 Like",
    ano: 2023,
    cor: "Preto",
    combustivel: "Flex",
    chassi: "9BD157041P8554433",
    km_inicial: 45000,
    km_atual: 46200,
    crlv_url: "/placeholder-crlv.pdf",
    status: "disponivel",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialContracts: Contract[] = [
  {
    id: "cont-uuid-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    valor_aluguel: 650.00,
    periodicidade: "semanal",
    dia_vencimento: 5, // Sexta-feira
    data_inicio: "2026-08-01",
    status: "ativo",
    observacoes: "Caução de R$ 1.200,00 depositada. Franquia de 1.500 km/semana.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cont-uuid-2",
    vehicle_id: "veh-uuid-2",
    driver_id: "driver-uuid-2",
    valor_aluguel: 680.00,
    periodicidade: "semanal",
    dia_vencimento: 1, // Segunda-feira
    data_inicio: "2026-07-15",
    status: "ativo",
    observacoes: "Sem limite de KM. Uso em aplicativos Uber/99.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

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

export const initialMaintenances: Maintenance[] = [
  {
    id: "maint-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    rule_id: "rule-1",
    tipo_item: "Troca de Óleo e Filtro",
    km_realizado: 30000, // Próxima revisão aos 38.000 km! Como está em 37.650 km -> faltam 350 km!
    data_realizada: "2026-07-10",
    valor_custo: 240.00,
    foto_nota_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80",
    foto_odometro_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80",
    status: "concluido",
    observacoes: "Óleo 0W20 Sintético + Filtro de Óleo",
    created_at: new Date().toISOString(),
  },
  {
    id: "maint-2",
    vehicle_id: "veh-uuid-2",
    driver_id: "driver-uuid-2",
    rule_id: "rule-3",
    tipo_item: "Pastilhas de Freio",
    km_realizado: 10000, // Próxima revisão aos 30.000 km (ou regra de 20k -> 20.000km). Com 19.150 km -> faltam 850 km!
    data_realizada: "2026-05-18",
    valor_custo: 180.00,
    foto_nota_url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80",
    foto_odometro_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&q=80",
    status: "concluido",
    observacoes: "Pastilhas dianteiras substituídas",
    created_at: new Date().toISOString(),
  }
];

export const initialPayments: Payment[] = [
  {
    id: "pay-1",
    contract_id: "cont-uuid-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    valor: 650.00,
    data_vencimento: "2026-08-28",
    data_pagamento: "2026-08-28T14:30:00Z",
    status: "confirmado",
    comprovante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
    semana_ano: "2026-35",
    observacao_admin: "Comprovante conferido e KM validado.",
    created_at: "2026-08-28T10:00:00Z",
    updated_at: "2026-08-28T15:00:00Z",
  },
  {
    id: "pay-2",
    contract_id: "cont-uuid-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    valor: 650.00,
    data_vencimento: "2026-09-04",
    data_pagamento: "2026-09-04T16:00:00Z",
    status: "confirmado",
    comprovante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
    semana_ano: "2026-36",
    observacao_admin: "Tudo em ordem com a vistoria.",
    created_at: "2026-09-04T10:00:00Z",
    updated_at: "2026-09-04T16:20:00Z",
  },
  {
    id: "pay-3",
    contract_id: "cont-uuid-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    valor: 650.00,
    data_vencimento: "2026-09-11",
    data_pagamento: "2026-09-11T18:40:00Z",
    status: "pendente_conferencia", // Aguardando aprovação do Locador!
    comprovante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80",
    semana_ano: "2026-37",
    observacao_admin: null,
    created_at: "2026-09-11T18:30:00Z",
    updated_at: "2026-09-11T18:40:00Z",
  },
  {
    id: "pay-4",
    contract_id: "cont-uuid-2",
    vehicle_id: "veh-uuid-2",
    driver_id: "driver-uuid-2",
    valor: 680.00,
    data_vencimento: "2026-09-14",
    status: "pendente_envio", // A vencer
    semana_ano: "2026-37",
    created_at: "2026-09-07T10:00:00Z",
    updated_at: "2026-09-07T10:00:00Z",
  }
];

export const initialInspections: Inspection[] = [
  {
    id: "insp-1",
    payment_id: "pay-3",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    km_registrado: 37650,
    foto_frente_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&q=80",
    foto_lateral_esq_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80",
    foto_lateral_dir_url: "https://images.unsplash.com/photo-1542362567-b07e5359a973?w=500&q=80",
    foto_traseira_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80",
    foto_interior_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80",
    foto_odometro_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80",
    observacoes: "Veículo limpo, pequenos arranhões superficiais no para-choque dianteiro já mapeados.",
    status_conferencia: "pendente",
    created_at: "2026-09-11T18:35:00Z",
  }
];

export const initialFines: Fine[] = [
  {
    id: "fine-1",
    vehicle_id: "veh-uuid-1",
    driver_id: "driver-uuid-1",
    auto_infracao: "R882910382",
    data_infracao: "2026-08-15T10:25:00Z",
    valor: 130.16,
    pontos: 4,
    orgao_emissor: "DETRAN-SP",
    descricao: "Transitar em velocidade superior à máxima permitida em até 20%",
    local_infracao: "Av. 23 de Maio, Km 3.5 - Sentido Bairro",
    limite_defesa_data: "2026-10-15",
    status_pagamento: "pago_locador",
    status_transferencia_pontos: "fici_gerado",
    created_at: "2026-08-20T14:00:00Z",
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    vehicle_id: "veh-uuid-1",
    tipo: "seguro",
    valor: 185.00,
    data_despesa: "2026-08-10",
    descricao: "Parcela Seguro Mensal Porto Seguro",
    created_at: "2026-08-10T10:00:00Z",
  },
  {
    id: "exp-2",
    vehicle_id: "veh-uuid-1",
    tipo: "licenciamento",
    valor: 160.00,
    data_despesa: "2026-08-05",
    descricao: "Taxa de Licenciamento Anual 2026",
    created_at: "2026-08-05T10:00:00Z",
  }
];

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
