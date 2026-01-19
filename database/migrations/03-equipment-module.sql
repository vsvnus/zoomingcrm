-- ============================================
-- MÓDULO DE EQUIPAMENTOS - MELHORIAS (CORRIGIDO)
-- ============================================
-- Versão: 1.1
-- Data: 2026-01-11
-- Propósito: Adicionar campos de rastreamento, ROI e manutenção

-- ============================================
-- 1. ADICIONAR CAMPOS EM EQUIPMENTS
-- ============================================

-- Adicionar campos financeiros e de rastreamento
ALTER TABLE equipments
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS qr_code_hash TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Criar índice único para qr_code_hash (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipments_qr_code_hash ON equipments(qr_code_hash);

-- Atualizar ENUM de status para incluir LOST
DO $$
BEGIN
  -- Verificar se o tipo já existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_status') THEN
    -- Adicionar novo valor se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'equipment_status')
      AND enumlabel = 'LOST'
    ) THEN
      ALTER TYPE equipment_status ADD VALUE 'LOST';
    END IF;
  END IF;
END $$;

-- Comentários descritivos
COMMENT ON COLUMN equipments.brand IS 'Marca do equipamento (ex: Sony, Canon, Blackmagic)';
COMMENT ON COLUMN equipments.model IS 'Modelo específico (ex: FX3, R5, Pocket 6K)';
COMMENT ON COLUMN equipments.purchase_date IS 'Data de aquisição do equipamento';
COMMENT ON COLUMN equipments.purchase_price IS 'Valor pago na compra (para cálculo de ROI)';
COMMENT ON COLUMN equipments.daily_rate IS 'Valor de aluguel interno por dia';
COMMENT ON COLUMN equipments.qr_code_hash IS 'Hash único para geração de QR Code de rastreamento';
COMMENT ON COLUMN equipments.photo_url IS 'URL da foto do equipamento';

-- ============================================
-- 2. CRIAR TABELA DE LOGS DE MANUTENÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Detalhes da manutenção
  description TEXT NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,

  -- Período
  date_start DATE NOT NULL,
  date_end DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED

  -- Responsável
  technician_name TEXT,
  external_service BOOLEAN DEFAULT FALSE, -- Manutenção externa ou interna?

  -- Metadata
  notes TEXT,
  invoice_number TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_equipment ON maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_org ON maintenance_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_dates ON maintenance_logs(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);

-- Comentários
COMMENT ON TABLE maintenance_logs IS 'Histórico completo de manutenções e reparos';
COMMENT ON COLUMN maintenance_logs.external_service IS 'TRUE = assistência técnica externa, FALSE = reparo interno';

-- ============================================
-- 3. MELHORAR TABELA DE BOOKINGS (se necessário)
-- ============================================

-- Adicionar campo para reservas de kits (além de equipamentos individuais)
ALTER TABLE equipment_bookings
ADD COLUMN IF NOT EXISTS kit_id TEXT REFERENCES equipment_kits(id) ON DELETE SET NULL;

-- Remover constraint antiga se existir
ALTER TABLE equipment_bookings
DROP CONSTRAINT IF EXISTS booking_must_have_equipment_or_kit;

-- Adicionar constraint: ou equipment_id ou kit_id deve estar preenchido
ALTER TABLE equipment_bookings
ADD CONSTRAINT booking_must_have_equipment_or_kit
CHECK (
  (equipment_id IS NOT NULL AND kit_id IS NULL) OR
  (equipment_id IS NULL AND kit_id IS NOT NULL)
);

-- Índice adicional para busca por kit
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_kit ON equipment_bookings(kit_id)
WHERE kit_id IS NOT NULL;

COMMENT ON COLUMN equipment_bookings.kit_id IS 'ID do kit reservado (alternativa a equipment_id para reservar bundle completo)';

-- ============================================
-- 4. VIEWS ÚTEIS
-- ============================================

-- View: Disponibilidade de Equipamentos (CORRIGIDA)
CREATE OR REPLACE VIEW equipment_availability AS
SELECT
  e.id,
  e.name,
  e.brand,
  e.model,
  e.category,
  e.status,
  e.organization_id,

  -- Verifica se está em booking ativo agora
  CASE
    WHEN EXISTS (
      SELECT 1 FROM equipment_bookings eb
      WHERE eb.equipment_id = e.id
      AND eb.start_date <= CURRENT_DATE
      AND eb.end_date >= CURRENT_DATE
    ) THEN TRUE
    ELSE FALSE
  END as currently_booked,

  -- Próxima reserva
  (
    SELECT MIN(eb.start_date)
    FROM equipment_bookings eb
    WHERE eb.equipment_id = e.id
    AND eb.start_date > CURRENT_DATE
  ) as next_booking_date,

  -- Total de dias reservados (histórico) - CORRIGIDO
  COALESCE(
    (
      SELECT SUM((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1)
      FROM equipment_bookings eb
      WHERE eb.equipment_id = e.id
    ),
    0
  ) as total_days_booked,

  -- Receita total gerada (estimada) - CORRIGIDO
  COALESCE(
    (
      SELECT SUM(((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) * e.daily_rate)
      FROM equipment_bookings eb
      WHERE eb.equipment_id = e.id
      AND e.daily_rate IS NOT NULL
    ),
    0
  ) as total_revenue_generated,

  -- ROI em porcentagem - CORRIGIDO
  CASE
    WHEN e.purchase_price > 0 AND e.daily_rate IS NOT NULL THEN
      ROUND(
        (
          COALESCE(
            (
              SELECT SUM(((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) * e.daily_rate)
              FROM equipment_bookings eb
              WHERE eb.equipment_id = e.id
            ),
            0
          ) / e.purchase_price * 100
        )::NUMERIC,
        2
      )
    ELSE NULL
  END as roi_percent

FROM equipments e;

COMMENT ON VIEW equipment_availability IS 'Visão completa de disponibilidade e ROI de cada equipamento';

-- View: Histórico de Projetos por Equipamento (CORRIGIDA)
CREATE OR REPLACE VIEW equipment_project_history AS
SELECT
  e.id as equipment_id,
  e.name as equipment_name,
  e.category,
  p.id as project_id,
  p.title as project_title,
  c.name as client_name,
  eb.start_date,
  eb.end_date,
  eb.return_date,
  ((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) as days_used,
  ((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) * COALESCE(e.daily_rate, 0) as estimated_revenue,
  eb.notes,
  eb.created_at as booking_created_at
FROM equipment_bookings eb
JOIN equipments e ON e.id = eb.equipment_id
JOIN projects p ON p.id = eb.project_id
JOIN clients c ON c.id = p.client_id
ORDER BY eb.start_date DESC;

COMMENT ON VIEW equipment_project_history IS 'Histórico completo de uso de equipamentos em projetos';

-- View: Equipamentos em Manutenção (CORRIGIDA)
CREATE OR REPLACE VIEW equipment_maintenance_status AS
SELECT
  e.id as equipment_id,
  e.name as equipment_name,
  e.brand,
  e.model,
  e.category,
  ml.id as maintenance_id,
  ml.description,
  ml.cost,
  ml.date_start,
  ml.date_end,
  ml.status as maintenance_status,
  ml.technician_name,
  ml.external_service,
  CASE
    WHEN ml.date_end IS NULL THEN CURRENT_DATE - ml.date_start
    ELSE ml.date_end - ml.date_start
  END as days_in_maintenance,
  ml.created_at
FROM equipments e
JOIN maintenance_logs ml ON ml.equipment_id = e.id
WHERE ml.status = 'IN_PROGRESS'
  OR (ml.date_end IS NOT NULL AND ml.date_end >= (CURRENT_DATE - 30))
ORDER BY ml.date_start DESC;

COMMENT ON VIEW equipment_maintenance_status IS 'Equipamentos atualmente em manutenção ou manutenções recentes (últimos 30 dias)';

-- View: ROI Summary por Categoria (CORRIGIDA)
CREATE OR REPLACE VIEW equipment_roi_summary AS
SELECT
  e.category,
  e.organization_id,
  COUNT(e.id) as total_items,
  SUM(e.purchase_price) as total_investment,
  SUM(
    COALESCE(
      (
        SELECT SUM(((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) * e.daily_rate)
        FROM equipment_bookings eb
        WHERE eb.equipment_id = e.id
        AND e.daily_rate IS NOT NULL
      ),
      0
    )
  ) as total_revenue,
  ROUND(
    (
      SUM(
        COALESCE(
          (
            SELECT SUM(((DATE_PART('day', eb.end_date::TIMESTAMP - eb.start_date::TIMESTAMP))::INTEGER + 1) * e.daily_rate)
            FROM equipment_bookings eb
            WHERE eb.equipment_id = e.id
            AND e.daily_rate IS NOT NULL
          ),
          0
        )
      ) / NULLIF(SUM(e.purchase_price), 0) * 100
    )::NUMERIC,
    2
  ) as avg_roi_percent
FROM equipments e
GROUP BY e.category, e.organization_id;

COMMENT ON VIEW equipment_roi_summary IS 'Resumo de ROI agrupado por categoria de equipamento';

-- ============================================
-- 5. FUNCTION: Verificar Conflito de Booking
-- ============================================

CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_equipment_id TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  has_conflict BOOLEAN,
  conflicting_project_id TEXT,
  conflicting_project_title TEXT,
  conflict_start DATE,
  conflict_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE as has_conflict,
    p.id as conflicting_project_id,
    p.title as conflicting_project_title,
    eb.start_date as conflict_start,
    eb.end_date as conflict_end
  FROM equipment_bookings eb
  JOIN projects p ON p.id = eb.project_id
  WHERE eb.equipment_id = p_equipment_id
    AND (p_exclude_booking_id IS NULL OR eb.id != p_exclude_booking_id)
    AND (
      -- Overlap de datas
      (eb.start_date <= p_end_date AND eb.end_date >= p_start_date)
    )
  LIMIT 1;

  -- Se não encontrou conflito, retornar FALSE
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::DATE, NULL::DATE;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_booking_conflict IS 'Verifica se há conflito de reserva para um equipamento em determinado período';

-- ============================================
-- 6. FUNCTION: Gerar QR Code Hash
-- ============================================

CREATE OR REPLACE FUNCTION generate_qr_code_hash()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar hash único se não foi fornecido
  IF NEW.qr_code_hash IS NULL THEN
    NEW.qr_code_hash := 'EQP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 12));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar QR Code automaticamente
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON equipments;
CREATE TRIGGER trigger_generate_qr_code
  BEFORE INSERT ON equipments
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_hash();

COMMENT ON FUNCTION generate_qr_code_hash IS 'Gera hash único para QR Code ao inserir novo equipamento';

-- ============================================
-- 7. HABILITAR RLS
-- ============================================

ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view maintenance logs from their org" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can insert maintenance logs for their org" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can update maintenance logs from their org" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can delete maintenance logs from their org" ON maintenance_logs;

-- Políticas RLS para maintenance_logs
CREATE POLICY "Users can view maintenance logs from their org"
  ON maintenance_logs FOR SELECT
  USING (organization_id = 'org_demo');

CREATE POLICY "Users can insert maintenance logs for their org"
  ON maintenance_logs FOR INSERT
  WITH CHECK (organization_id = 'org_demo');

CREATE POLICY "Users can update maintenance logs from their org"
  ON maintenance_logs FOR UPDATE
  USING (organization_id = 'org_demo');

CREATE POLICY "Users can delete maintenance logs from their org"
  ON maintenance_logs FOR DELETE
  USING (organization_id = 'org_demo');

-- ============================================
-- 8. DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Exemplo de equipamento com todos os campos preenchidos
/*
INSERT INTO equipments (
  name, brand, model, category, serial_number,
  purchase_date, purchase_price, daily_rate, status,
  organization_id
) VALUES (
  'Sony FX3 (Câmera Principal)',
  'Sony',
  'ILME-FX3',
  'CAMERA',
  'SN123456789',
  '2023-01-15',
  25000.00,
  800.00,
  'AVAILABLE',
  'org_demo'
);

-- Exemplo de log de manutenção
INSERT INTO maintenance_logs (
  equipment_id,
  organization_id,
  description,
  cost,
  date_start,
  status,
  technician_name,
  external_service
) VALUES (
  (SELECT id FROM equipments WHERE serial_number = 'SN123456789'),
  'org_demo',
  'Limpeza de sensor e ajuste de foco',
  450.00,
  CURRENT_DATE - 7,
  'COMPLETED',
  'João Silva',
  TRUE
);
*/

-- ============================================
-- 9. VERIFICAÇÃO FINAL
-- ============================================

-- Listar novos campos em equipments
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'equipments'
  AND column_name IN ('brand', 'model', 'purchase_date', 'purchase_price', 'daily_rate', 'qr_code_hash', 'photo_url')
ORDER BY column_name;

-- Listar views criadas
SELECT
  viewname,
  schemaname
FROM pg_views
WHERE viewname LIKE 'equipment_%'
ORDER BY viewname;

-- Verificar função de conflito
SELECT
  proname as function_name
FROM pg_proc
WHERE proname = 'check_booking_conflict';

-- ============================================
-- ✅ MÓDULO DE EQUIPAMENTOS APRIMORADO!
-- ============================================

SELECT
  '✅ Módulo de Equipamentos aprimorado com sucesso!' as status,
  'Campos adicionados: brand, model, purchase_date, purchase_price, daily_rate, qr_code_hash' as novos_campos,
  'Tabela maintenance_logs criada' as nova_tabela,
  '4 views criadas: availability, project_history, maintenance_status, roi_summary' as views,
  'Função check_booking_conflict() disponível' as funcao;
