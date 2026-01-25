-- ============================================
-- MIGRATION 12: SIMPLIFY PROJECT CREATION
-- Adiciona campo 'origin' para diferenciar projetos manuais de automáticos
-- ============================================

-- 1. Adicionar campo origin
ALTER TABLE projects ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'manual';
COMMENT ON COLUMN projects.origin IS 'Origem do projeto: manual | proposal';

-- 2. Criar índice para filtrar por origem
CREATE INDEX IF NOT EXISTS idx_projects_origin ON projects(origin);

-- 3. Atualizar projetos existentes vindos de propostas
-- Projetos que vieram de propostas geralmente:
-- - Têm budget preenchido
-- - Começaram em PRE_PROD
-- - Têm transação financeira com proposal_id preenchido
UPDATE projects SET origin = 'proposal'
WHERE (origin IS NULL OR origin = 'manual')
  AND budget IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM financial_transactions ft
    WHERE ft.project_id = projects.id
      AND ft.proposal_id IS NOT NULL
  );

-- 4. Garantir que todos os projetos tenham origin
UPDATE projects SET origin = 'manual' WHERE origin IS NULL;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 
    '✅ Migration 12 aplicada com sucesso!' as status,
    'projects.origin' as campo_adicionado,
    'idx_projects_origin' as indice_criado;
