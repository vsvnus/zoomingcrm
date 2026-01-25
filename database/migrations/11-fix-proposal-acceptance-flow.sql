-- ============================================
-- FIX: PROPOSAL ACCEPTANCE FLOW
-- Adiciona tabelas e colunas faltantes para o fluxo de aceite de proposta
-- ============================================

-- 1. Remover Trigger duplicado (para uniformizar fluxo via código)
DROP TRIGGER IF EXISTS trigger_create_income_for_proposal ON proposals;
DROP FUNCTION IF EXISTS create_income_for_approved_proposal();

-- 2. Adicionar coluna 'budget' na tabela projects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'budget'
    ) THEN
        ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2);
        COMMENT ON COLUMN projects.budget IS 'Orçamento aprovado do projeto (copiado da proposta)';
    END IF;
END $$;

-- 3. Criar tabela 'project_finances'
CREATE TABLE IF NOT EXISTS project_finances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    approved_value DECIMAL(12,2) DEFAULT 0,
    target_margin_percent DECIMAL(5,2) DEFAULT 30.00,
    realized_margin_percent DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id) -- Um registro financeiro por projeto
);

COMMENT ON TABLE project_finances IS 'Dados financeiros consolidados do projeto';

-- 3. Criar tabela 'calendar_events'
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'other', -- shooting, delivery, meeting, other
    location TEXT,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance no calendário
CREATE INDEX IF NOT EXISTS idx_calendar_events_org_dates 
ON calendar_events(organization_id, start_date, end_date);

COMMENT ON TABLE calendar_events IS 'Eventos gerais do calendário e eventos gerados a partir de propostas';

-- ============================================
-- 5. FIX: Corrigir policies antigas que usavam auth.uid() sem cast
-- ============================================

-- financial_transactions (Migration 01)
-- Necessário recriar para adicionar ::text no auth.uid()
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_transactions_org_isolation ON financial_transactions;
CREATE POLICY financial_transactions_org_isolation ON financial_transactions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()::text
    )
  );

-- ============================================
-- 6. Habilitar RLS nas novas tabelas
-- ============================================

-- project_finances
ALTER TABLE project_finances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view project_finances from their org" ON project_finances;
CREATE POLICY "Users can view project_finances from their org"
    ON project_finances FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can insert project_finances for their org" ON project_finances;
CREATE POLICY "Users can insert project_finances for their org"
    ON project_finances FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can update project_finances from their org" ON project_finances;
CREATE POLICY "Users can update project_finances from their org"
    ON project_finances FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

-- calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view calendar_events from their org" ON calendar_events;
CREATE POLICY "Users can view calendar_events from their org"
    ON calendar_events FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can insert calendar_events for their org" ON calendar_events;
CREATE POLICY "Users can insert calendar_events for their org"
    ON calendar_events FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can update calendar_events from their org" ON calendar_events;
CREATE POLICY "Users can update calendar_events from their org"
    ON calendar_events FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can delete calendar_events from their org" ON calendar_events;
CREATE POLICY "Users can delete calendar_events from their org"
    ON calendar_events FOR DELETE
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    '✅ Tabelas e colunas criadas com sucesso!' as status,
    'projects.budget' as coluna_adicionada,
    'project_finances, calendar_events' as tabelas_criadas;
