-- ============================================
-- FREELANCERS SCHEMA ENHANCEMENT
-- Adiciona campos role e specialty à tabela freelancers
-- ============================================

DO $$
BEGIN
  -- Adicionar role se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'freelancers' AND column_name = 'role'
  ) THEN
    ALTER TABLE freelancers ADD COLUMN role TEXT;
    COMMENT ON COLUMN freelancers.role IS 'Função principal: Camera Operator, Video Editor, Sound Engineer, etc.';
  END IF;

  -- Adicionar specialty (array de texto) se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'freelancers' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE freelancers ADD COLUMN specialty TEXT[];
    COMMENT ON COLUMN freelancers.specialty IS 'Especialidades: {Camera, Sound, Editing, Color, Motion}';
  END IF;

END $$;

-- Atualizar status para usar os valores corretos
COMMENT ON COLUMN freelancers.status IS 'Status: AVAILABLE, BUSY, INACTIVE, BLACKLISTED';

-- Verificar resultado
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'freelancers'
ORDER BY ordinal_position;
