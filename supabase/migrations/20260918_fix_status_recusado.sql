ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pendente_envio', 'pendente_conferencia', 'confirmado', 'atrasado', 'recusado'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS motivo_recusa TEXT;
ALTER TABLE public.inspections DROP CONSTRAINT IF EXISTS inspections_status_conferencia_check;
ALTER TABLE public.inspections ADD CONSTRAINT inspections_status_conferencia_check CHECK (status_conferencia IN ('pendente', 'aprovada', 'rejeitada'));
