-- ==============================================================================
-- SEVEN DRIVE - SCHEMA DE BANCO DE DADOS & SEGURANÇA SUPABASE (100% GRATUITO)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE PERFIS DE USUÁRIOS (Admin / Locador e Driver / Locatário)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'driver')) DEFAULT 'driver',
    cpf TEXT,
    rg TEXT,
    telefone TEXT,
    endereco TEXT,
    contato_emergencia TEXT,
    cnh_numero TEXT,
    cnh_categoria TEXT DEFAULT 'B',
    cnh_validade DATE,
    cnh_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA DE VEÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa TEXT NOT NULL UNIQUE,
    renavam TEXT NOT NULL UNIQUE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    cor TEXT NOT NULL,
    combustivel TEXT NOT NULL,
    chassi TEXT NOT NULL UNIQUE,
    km_inicial INTEGER NOT NULL DEFAULT 0,
    km_atual INTEGER NOT NULL DEFAULT 0,
    crlv_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('disponivel', 'alugado', 'manutencao')) DEFAULT 'disponivel',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE CONTRATOS (Vinculação Locatário <-> Veículo)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    valor_aluguel NUMERIC(10, 2) NOT NULL,
    periodicidade TEXT NOT NULL CHECK (periodicidade IN ('semanal', 'mensal')) DEFAULT 'semanal',
    dia_vencimento INTEGER NOT NULL, -- 1-7 para dia da semana (segunda=1, domingo=7) ou 1-31 para dia do mês
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'encerrado')) DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pendente_envio', 'pendente_conferencia', 'confirmado', 'atrasado', 'recusado')) DEFAULT 'pendente_envio',
    comprovante_url TEXT,
    observacao_admin TEXT,
    motivo_recusa TEXT,
    semana_ano TEXT, -- Formato 'YYYY-WW' para linha do tempo
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE VISTORIAS DIGITAIS OBRIGATÓRIAS (Etapa 3 do Wizard)
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    km_registrado INTEGER NOT NULL,
    foto_frente_url TEXT NOT NULL,
    foto_lateral_esq_url TEXT NOT NULL,
    foto_lateral_dir_url TEXT NOT NULL,
    foto_traseira_url TEXT NOT NULL,
    foto_interior_url TEXT NOT NULL,
    foto_odometro_url TEXT NOT NULL,
    observacoes TEXT,
    status_conferencia TEXT NOT NULL CHECK (status_conferencia IN ('pendente', 'aprovada', 'rejeitada')) DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REGRAS DE MANUTENÇÃO PREVENTIVA (Parametrização por KM)
CREATE TABLE IF NOT EXISTS public.maintenance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_item TEXT NOT NULL,
    intervalo_km INTEGER NOT NULL, -- Ex: 8000 (óleo), 40000 (pneus), 10000 (filtros)
    alerta_amarelo_km INTEGER NOT NULL DEFAULT 1000, -- Alerta de atenção
    alerta_vermelho_km INTEGER NOT NULL DEFAULT 500, -- Alerta de urgência
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REGISTRO DE MANUTENÇÕES REALIZADAS E EVIDÊNCIAS
CREATE TABLE IF NOT EXISTS public.maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rule_id UUID REFERENCES public.maintenance_rules(id) ON DELETE SET NULL,
    tipo_item TEXT NOT NULL,
    km_realizado INTEGER NOT NULL,
    data_realizada DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_custo NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    foto_nota_url TEXT,
    foto_odometro_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('solicitado', 'aprovado', 'concluido')) DEFAULT 'concluido',
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. GESTÃO DE MULTAS & TRANSFERÊNCIA DE PONTOS (FICI)
CREATE TABLE IF NOT EXISTS public.fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    auto_infracao TEXT NOT NULL,
    data_infracao TIMESTAMPTZ NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    pontos INTEGER NOT NULL DEFAULT 0,
    orgao_emissor TEXT NOT NULL,
    descricao TEXT NOT NULL,
    local_infracao TEXT,
    limite_defesa_data DATE,
    status_pagamento TEXT NOT NULL CHECK (status_pagamento IN ('pendente', 'pago_locador', 'repassado_locatario', 'pago_locatario')) DEFAULT 'pendente',
    status_transferencia_pontos TEXT NOT NULL CHECK (status_transferencia_pontos IN ('pendente', 'fici_gerado', 'transferido')) DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DESPESAS E TAXAS ADICIONAIS (IPVA, Seguros, Licenciamento etc)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('ipva', 'seguro', 'taxa', 'licenciamento', 'manutencao', 'outros')),
    valor NUMERIC(10, 2) NOT NULL,
    data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao TEXT NOT NULL,
    comprovante_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CONFIGURAÇÕES DO SISTEMA (Chave PIX, Alertas, etc)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_pix TEXT NOT NULL DEFAULT 'financeiro@sevendrive.com.br',
    tipo_chave_pix TEXT NOT NULL DEFAULT 'E-mail',
    nome_beneficiario TEXT NOT NULL DEFAULT 'Seven Drive Locadora Ltda',
    cidade_beneficiario TEXT NOT NULL DEFAULT 'SAO PAULO',
    dias_alerta_vencimento INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INSCRIÇÕES DE NOTIFICAÇÃO WEB PUSH
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. FUNÇÕES AUXILIARES DE SEGURANÇA E RLS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
DROP POLICY IF EXISTS "Perfis: Admin acessa todos" ON public.profiles;
CREATE POLICY "Perfis: Admin acessa todos" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Perfis: Usuário lê e edita seu próprio perfil" ON public.profiles;
CREATE POLICY "Perfis: Usuário lê e edita seu próprio perfil" ON public.profiles
    FOR ALL TO authenticated USING (auth.uid() = id);

-- POLÍTICAS: VEÍCULOS
DROP POLICY IF EXISTS "Veículos: Admin acesso total" ON public.vehicles;
CREATE POLICY "Veículos: Admin acesso total" ON public.vehicles
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Veículos: Motorista lê seu veículo ativo" ON public.vehicles;
CREATE POLICY "Veículos: Motorista lê seu veículo ativo" ON public.vehicles
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            WHERE c.vehicle_id = vehicles.id
            AND c.driver_id = auth.uid()
            AND c.status = 'ativo'
        )
    );

-- POLÍTICAS: CONTRATOS
DROP POLICY IF EXISTS "Contratos: Admin acesso total" ON public.contracts;
CREATE POLICY "Contratos: Admin acesso total" ON public.contracts
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Contratos: Motorista lê seus contratos" ON public.contracts;
CREATE POLICY "Contratos: Motorista lê seus contratos" ON public.contracts
    FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- POLÍTICAS: PAGAMENTOS
DROP POLICY IF EXISTS "Pagamentos: Admin acesso total" ON public.payments;
CREATE POLICY "Pagamentos: Admin acesso total" ON public.payments
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Pagamentos: Motorista lê seus pagamentos" ON public.payments;
CREATE POLICY "Pagamentos: Motorista lê seus pagamentos" ON public.payments
    FOR SELECT TO authenticated USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "Pagamentos: Motorista envia comprovante" ON public.payments;
CREATE POLICY "Pagamentos: Motorista envia comprovante" ON public.payments
    FOR UPDATE TO authenticated USING (driver_id = auth.uid())
    WITH CHECK (driver_id = auth.uid());

-- POLÍTICAS: VISTORIAS
DROP POLICY IF EXISTS "Vistorias: Admin acesso total" ON public.inspections;
CREATE POLICY "Vistorias: Admin acesso total" ON public.inspections
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Vistorias: Motorista envia e lê suas vistorias" ON public.inspections;
CREATE POLICY "Vistorias: Motorista envia e lê suas vistorias" ON public.inspections
    FOR ALL TO authenticated USING (driver_id = auth.uid());

-- POLÍTICAS: REGRAS DE MANUTENÇÃO
DROP POLICY IF EXISTS "Regras Manutenção: Todos autenticados leem" ON public.maintenance_rules;
CREATE POLICY "Regras Manutenção: Todos autenticados leem" ON public.maintenance_rules
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Regras Manutenção: Admin gerencia" ON public.maintenance_rules;
CREATE POLICY "Regras Manutenção: Admin gerencia" ON public.maintenance_rules
    FOR ALL TO authenticated USING (public.is_admin());

-- POLÍTICAS: MANUTENÇÕES
DROP POLICY IF EXISTS "Manutenções: Admin acesso total" ON public.maintenances;
CREATE POLICY "Manutenções: Admin acesso total" ON public.maintenances
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Manutenções: Motorista registra ou lê suas revisões" ON public.maintenances;
CREATE POLICY "Manutenções: Motorista registra ou lê suas revisões" ON public.maintenances
    FOR ALL TO authenticated USING (driver_id = auth.uid());

-- POLÍTICAS: MULTAS
DROP POLICY IF EXISTS "Multas: Admin acesso total" ON public.fines;
CREATE POLICY "Multas: Admin acesso total" ON public.fines
    FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Multas: Motorista lê suas multas" ON public.fines;
CREATE POLICY "Multas: Motorista lê suas multas" ON public.fines
    FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- POLÍTICAS: DESPESAS
DROP POLICY IF EXISTS "Despesas: Admin acesso total" ON public.expenses;
CREATE POLICY "Despesas: Admin acesso total" ON public.expenses
    FOR ALL TO authenticated USING (public.is_admin());

-- POLÍTICAS: CONFIGURAÇÕES
DROP POLICY IF EXISTS "Configurações: Todos leem" ON public.system_settings;
CREATE POLICY "Configurações: Todos leem" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Configurações: Admin gerencia" ON public.system_settings;
CREATE POLICY "Configurações: Admin gerencia" ON public.system_settings
    FOR ALL TO authenticated USING (public.is_admin());

-- POLÍTICAS: PUSH SUBSCRIPTIONS
DROP POLICY IF EXISTS "Push: Usuário gerencia sua subscrição" ON public.push_subscriptions;
CREATE POLICY "Push: Usuário gerencia sua subscrição" ON public.push_subscriptions
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- ==============================================================================
-- 14. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL NO SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'driver')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 15. ROTINA DE PURGA AUTOMÁTICA DE MÍDIAS TEMPORÁRIAS (> 60 DIAS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.purge_old_temporary_media()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Remove objetos criados há mais de 60 dias do bucket 'temporary-media'
    -- Mantendo intactos todos os arquivos do bucket 'documents-fixed' (CRLV e CNH)
    DELETE FROM storage.objects
    WHERE bucket_id = 'temporary-media'
    AND created_at < NOW() - INTERVAL '60 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserção de configurações padrão
INSERT INTO public.system_settings (chave_pix, tipo_chave_pix, nome_beneficiario, cidade_beneficiario, dias_alerta_vencimento)
SELECT 'financeiro@sevendrive.com.br', 'E-mail', 'Seven Drive Locadora Ltda', 'SAO PAULO', 2
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Inserção de regras de manutenção padrão
INSERT INTO public.maintenance_rules (nome_item, intervalo_km, alerta_amarelo_km, alerta_vermelho_km)
VALUES
    ('Troca de Óleo e Filtro', 8000, 1000, 500),
    ('Alinhamento e Balanceamento', 10000, 1000, 500),
    ('Pastilhas de Freio', 20000, 1500, 500),
    ('Troca de Pneus', 40000, 2000, 1000),
    ('Velas de Ignição', 30000, 1500, 500)
ON CONFLICT DO NOTHING;
