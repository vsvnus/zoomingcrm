-- ============================================
-- PROJECTS MODULE ENHANCEMENT
-- Adiciona campos necessários e cria tabela project_members
-- ============================================

-- ============================================
-- 1. ADICIONAR CAMPOS FALTANTES NA TABELA PROJECTS
-- ============================================

DO $$
BEGIN
  -- Adicionar video_format se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'video_format'
  ) THEN
    ALTER TABLE projects ADD COLUMN video_format TEXT;
    COMMENT ON COLUMN projects.video_format IS 'Formato do vídeo: 16:9, 9:16, 1:1, 4:5';
  END IF;

  -- Adicionar resolution se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'resolution'
  ) THEN
    ALTER TABLE projects ADD COLUMN resolution TEXT;
    COMMENT ON COLUMN projects.resolution IS 'Resolução: 1080p, 4K, 8K';
  END IF;

  -- Adicionar drive_folder_link se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'drive_folder_link'
  ) THEN
    ALTER TABLE projects ADD COLUMN drive_folder_link TEXT;
    COMMENT ON COLUMN projects.drive_folder_link IS 'Link da pasta do Google Drive do projeto';
  END IF;

  -- Adicionar script_link se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'script_link'
  ) THEN
    ALTER TABLE projects ADD COLUMN script_link TEXT;
    COMMENT ON COLUMN projects.script_link IS 'Link do roteiro (Google Docs, Notion, etc.)';
  END IF;

  -- Adicionar shooting_end_date se não existir (para range de datas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'shooting_end_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN shooting_end_date TIMESTAMP;
    COMMENT ON COLUMN projects.shooting_end_date IS 'Data final de gravação (para shoots de múltiplos dias)';
  END IF;

  -- Renomear 'deadline' para 'deadline_date' se necessário
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'deadline'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'deadline_date'
  ) THEN
    ALTER TABLE projects RENAME COLUMN deadline TO deadline_date;
  END IF;

  -- Atualizar campo 'stage' para usar o novo enum 'status'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    -- Criar coluna status
    ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'BRIEFING';

    -- Migrar dados de stage para status
    UPDATE projects SET status =
      CASE
        WHEN stage = 'LEAD' THEN 'BRIEFING'
        WHEN stage = 'BRIEFING' THEN 'BRIEFING'
        WHEN stage = 'PRE_PRODUCTION' THEN 'PRE_PROD'
        WHEN stage = 'SHOOTING' THEN 'SHOOTING'
        WHEN stage = 'POST_PRODUCTION' THEN 'POST_PROD'
        WHEN stage = 'REVIEW' THEN 'REVIEW'
        WHEN stage = 'DELIVERED' THEN 'DONE'
        WHEN stage = 'ARCHIVED' THEN 'DONE'
        ELSE 'BRIEFING'
      END;

    -- Remover coluna antiga stage (opcional, comentado para segurança)
    -- ALTER TABLE projects DROP COLUMN stage;
  END IF;

END $$;

-- Adicionar comentário na tabela
COMMENT ON TABLE projects IS 'Projetos de vídeo com pipeline completo de produção';

-- ============================================
-- 2. CRIAR TABELA PROJECT_MEMBERS (PIVOT)
-- ============================================

CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  freelancer_id TEXT NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  agreed_fee DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'INVITED',
  invited_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  notes TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, freelancer_id)
);

-- Adicionar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_project_members_updated_at ON project_members;
CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_freelancer ON project_members(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_project_members_status ON project_members(status);

-- Comentários
COMMENT ON TABLE project_members IS 'Equipe de freelancers alocados em cada projeto';
COMMENT ON COLUMN project_members.role IS 'Função no projeto: Diretor, Câmera, Editor, etc.';
COMMENT ON COLUMN project_members.agreed_fee IS 'Cachê combinado para este projeto específico';
COMMENT ON COLUMN project_members.status IS 'Status do convite: INVITED, CONFIRMED, DECLINED, REMOVED';

-- ============================================
-- 3. FUNCTION: CRIAR TRANSAÇÃO FINANCEIRA AO ADICIONAR MEMBRO
-- ============================================

CREATE OR REPLACE FUNCTION create_transaction_for_project_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Só criar transação se tiver agreed_fee definido
  IF NEW.agreed_fee IS NOT NULL AND NEW.agreed_fee > 0 THEN
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      description,
      status,
      project_id,
      freelancer_id,
      created_at
    ) VALUES (
      NEW.organization_id,
      'EXPENSE',
      'CREW_TALENT',
      NEW.agreed_fee,
      'Cachê de ' || NEW.role || ' para projeto',
      'PENDING',
      NEW.project_id,
      NEW.freelancer_id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar transação automaticamente
DROP TRIGGER IF EXISTS trigger_create_transaction_for_project_member ON project_members;
CREATE TRIGGER trigger_create_transaction_for_project_member
  AFTER INSERT ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION create_transaction_for_project_member();

-- ============================================
-- 4. VIEW: PROJECT_TEAM_SUMMARY
-- ============================================

CREATE OR REPLACE VIEW project_team_summary AS
SELECT
  p.id AS project_id,
  p.title AS project_title,
  p.status AS project_status,
  COUNT(pm.id) AS total_members,
  COUNT(CASE WHEN pm.status = 'CONFIRMED' THEN 1 END) AS confirmed_members,
  COUNT(CASE WHEN pm.status = 'INVITED' THEN 1 END) AS pending_members,
  COALESCE(SUM(pm.agreed_fee), 0) AS total_crew_cost,
  COALESCE(SUM(CASE WHEN pm.status = 'CONFIRMED' THEN pm.agreed_fee END), 0) AS confirmed_crew_cost,
  json_agg(
    json_build_object(
      'freelancer_id', f.id,
      'name', f.name,
      'role', pm.role,
      'status', pm.status,
      'agreed_fee', pm.agreed_fee
    ) ORDER BY pm.created_at
  ) AS team_members
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN freelancers f ON pm.freelancer_id = f.id
GROUP BY p.id, p.title, p.status;

COMMENT ON VIEW project_team_summary IS 'Resumo da equipe e custos por projeto';

-- ============================================
-- 5. RLS (ROW LEVEL SECURITY) para project_members
-- ============================================

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir acesso para membros da mesma organização
DROP POLICY IF EXISTS "Allow organization access to project_members" ON project_members;
CREATE POLICY "Allow organization access to project_members"
  ON project_members FOR ALL
  USING (organization_id = 'org_demo'); -- Substituir por current_setting('app.current_organization_id')::TEXT na produção

-- ============================================
-- 6. SEED DATA (Opcional - apenas para testes)
-- ============================================

-- Verificar resultado
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_members'
ORDER BY ordinal_position;
