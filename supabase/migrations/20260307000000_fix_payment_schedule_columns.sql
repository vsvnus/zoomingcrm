-- ==============================================================================
-- FIX: Normalizar tabela payment_schedule para snake_case
-- A tabela foi criada pelo Prisma com colunas camelCase ("proposalId", "dueDate", etc.)
-- A RPC accept_proposal_v1 usa snake_case (proposal_id, due_date), causando erro
-- Este migration garante que as colunas estão em snake_case
-- ==============================================================================

-- Criar tabela com snake_case se não existir
CREATE TABLE IF NOT EXISTS public.payment_schedule (
    id TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2),
    "order" INTEGER NOT NULL DEFAULT 0,
    paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    proposal_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT payment_schedule_pkey PRIMARY KEY (id)
);

-- Se a tabela já existia com colunas camelCase (do Prisma), renomear para snake_case
-- Usa DO block para ser idempotente
DO $$
BEGIN
    -- Renomear "proposalId" para proposal_id se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_schedule'
          AND column_name = 'proposalId'
    ) THEN
        ALTER TABLE public.payment_schedule RENAME COLUMN "proposalId" TO proposal_id;
    END IF;

    -- Renomear "dueDate" para due_date se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_schedule'
          AND column_name = 'dueDate'
    ) THEN
        ALTER TABLE public.payment_schedule RENAME COLUMN "dueDate" TO due_date;
    END IF;

    -- Renomear "paidAt" para paid_at se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_schedule'
          AND column_name = 'paidAt'
    ) THEN
        ALTER TABLE public.payment_schedule RENAME COLUMN "paidAt" TO paid_at;
    END IF;

    -- Renomear "createdAt" para created_at se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_schedule'
          AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE public.payment_schedule RENAME COLUMN "createdAt" TO created_at;
    END IF;

    -- Renomear "updatedAt" para updated_at se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payment_schedule'
          AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE public.payment_schedule RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- Garantir que due_date é nullable (pode ser configurada depois)
ALTER TABLE public.payment_schedule ALTER COLUMN due_date DROP NOT NULL;

-- Adicionar FK para proposals se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND table_name = 'payment_schedule'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%proposal%'
    ) THEN
        ALTER TABLE public.payment_schedule
            ADD CONSTRAINT payment_schedule_proposal_id_fkey
            FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS payment_schedule_proposal_id_idx ON public.payment_schedule(proposal_id);
CREATE INDEX IF NOT EXISTS payment_schedule_due_date_idx ON public.payment_schedule(due_date);
CREATE INDEX IF NOT EXISTS payment_schedule_paid_idx ON public.payment_schedule(paid);

-- Habilitar RLS
ALTER TABLE public.payment_schedule ENABLE ROW LEVEL SECURITY;

-- Policies de acesso: dono da organização pode ver/editar
DROP POLICY IF EXISTS "Org isolation for payment_schedule" ON public.payment_schedule;
CREATE POLICY "Org isolation for payment_schedule" ON public.payment_schedule
FOR ALL USING (
    proposal_id IN (
        SELECT id FROM public.proposals WHERE organization_id = auth_org_id()
    )
);

-- Policy de leitura pública (para visualização da proposta pelo cliente)
DROP POLICY IF EXISTS "Public view payment_schedule" ON public.payment_schedule;
CREATE POLICY "Public view payment_schedule" ON public.payment_schedule
FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM public.proposals WHERE token IS NOT NULL
    )
);

-- Garantir permissões
GRANT ALL ON public.payment_schedule TO authenticated;
GRANT SELECT ON public.payment_schedule TO anon;
GRANT ALL ON public.payment_schedule TO service_role;
