-- ============================================
-- MIGRATION 13: ITEM ASSIGNMENTS
-- Vincula freelancers a itens de propostas e projetos
-- ============================================

-- 1. Criar tabela de assignments
CREATE TABLE IF NOT EXISTS item_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  
  -- Freelancer
  freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  
  -- Vínculo com item (um dos dois, ou ambos se copiado)
  proposal_item_id TEXT REFERENCES proposal_items(id) ON DELETE CASCADE,
  project_item_id TEXT REFERENCES project_items(id) ON DELETE CASCADE,
  
  -- Dados do trabalho
  role TEXT, -- Função: Câmera, Editor, Roteirista, etc.
  agreed_fee DECIMAL(12,2), -- Cachê combinado (opcional)
  estimated_hours DECIMAL(5,2), -- Horas estimadas (opcional)
  scheduled_date TIMESTAMP WITH TIME ZONE, -- Data prevista (opcional)
  status TEXT DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, DONE
  notes TEXT, -- Observações
  
  -- Multi-tenant
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: deve ter pelo menos um vínculo
  CONSTRAINT item_assignment_has_item CHECK (
    proposal_item_id IS NOT NULL OR project_item_id IS NOT NULL
  )
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_item_assignments_freelancer ON item_assignments(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_item_assignments_proposal_item ON item_assignments(proposal_item_id);
CREATE INDEX IF NOT EXISTS idx_item_assignments_project_item ON item_assignments(project_item_id);
CREATE INDEX IF NOT EXISTS idx_item_assignments_status ON item_assignments(status);
CREATE INDEX IF NOT EXISTS idx_item_assignments_org ON item_assignments(organization_id);

-- 3. Comentários
COMMENT ON TABLE item_assignments IS 'Vincula freelancers a itens de propostas e projetos';
COMMENT ON COLUMN item_assignments.role IS 'Função no item: Câmera, Editor, Roteirista, Diretor, etc.';
COMMENT ON COLUMN item_assignments.agreed_fee IS 'Cachê combinado para este item específico (opcional)';
COMMENT ON COLUMN item_assignments.status IS 'Status do trabalho: PENDING, IN_PROGRESS, DONE';

-- 4. RLS
ALTER TABLE item_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view item_assignments from their org" ON item_assignments;
CREATE POLICY "Users can view item_assignments from their org"
  ON item_assignments FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can insert item_assignments for their org" ON item_assignments;
CREATE POLICY "Users can insert item_assignments for their org"
  ON item_assignments FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can update item_assignments from their org" ON item_assignments;
CREATE POLICY "Users can update item_assignments from their org"
  ON item_assignments FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

DROP POLICY IF EXISTS "Users can delete item_assignments from their org" ON item_assignments;
CREATE POLICY "Users can delete item_assignments from their org"
  ON item_assignments FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()::text));

-- 5. View: Histórico de trabalhos do freelancer
CREATE OR REPLACE VIEW freelancer_work_history AS
SELECT 
  f.id AS freelancer_id,
  f.name AS freelancer_name,
  ia.id AS assignment_id,
  ia.role,
  ia.agreed_fee,
  ia.status,
  ia.scheduled_date,
  ia.created_at,
  
  -- Info do item
  COALESCE(pi.description, prji.description) AS item_description,
  
  -- Info da proposta/projeto
  CASE 
    WHEN ia.proposal_item_id IS NOT NULL THEN 'proposal'
    ELSE 'project'
  END AS source_type,
  
  COALESCE(p.id, prj.id) AS source_id,
  COALESCE(p.title, prj.title) AS source_title,
  
  -- Cliente
  COALESCE(pc.name, prjc.name) AS client_name,
  
  ia.organization_id
  
FROM item_assignments ia
JOIN freelancers f ON ia.freelancer_id = f.id
LEFT JOIN proposal_items pi ON ia.proposal_item_id = pi.id
LEFT JOIN proposals p ON pi.proposal_id = p.id
LEFT JOIN clients pc ON p.client_id = pc.id
LEFT JOIN project_items prji ON ia.project_item_id = prji.id
LEFT JOIN projects prj ON prji.project_id = prj.id
LEFT JOIN clients prjc ON prj.client_id = prjc.id;

COMMENT ON VIEW freelancer_work_history IS 'Histórico completo de trabalhos de cada freelancer';

-- 6. View: Resumo financeiro do freelancer
CREATE OR REPLACE VIEW freelancer_financial_summary AS
SELECT 
  f.id AS freelancer_id,
  f.name AS freelancer_name,
  f.daily_rate,
  
  -- Métricas de assignments
  COUNT(ia.id) AS total_assignments,
  COUNT(CASE WHEN ia.status = 'DONE' THEN 1 END) AS completed_assignments,
  COUNT(CASE WHEN ia.status = 'PENDING' THEN 1 END) AS pending_assignments,
  
  COALESCE(SUM(ia.agreed_fee), 0) AS total_agreed_fees,
  COALESCE(SUM(CASE WHEN ia.status = 'DONE' THEN ia.agreed_fee END), 0) AS completed_fees,
  
  -- Métricas de transações (pagamentos reais)
  COALESCE(SUM(CASE WHEN ft.status = 'PAID' THEN ft.amount END), 0) AS total_paid,
  COALESCE(SUM(CASE WHEN ft.status = 'PENDING' THEN ft.amount END), 0) AS pending_payment,
  
  -- Contagem de projetos únicos
  COUNT(DISTINCT prj.id) AS projects_count,
  
  f.organization_id
  
FROM freelancers f
LEFT JOIN item_assignments ia ON f.id = ia.freelancer_id
LEFT JOIN project_items prji ON ia.project_item_id = prji.id
LEFT JOIN projects prj ON prji.project_id = prj.id
LEFT JOIN financial_transactions ft ON ft.freelancer_id = f.id AND ft.type = 'EXPENSE'
GROUP BY f.id, f.name, f.daily_rate, f.organization_id;

COMMENT ON VIEW freelancer_financial_summary IS 'Resumo financeiro de cada freelancer: trabalhos, pagamentos, projetos';
