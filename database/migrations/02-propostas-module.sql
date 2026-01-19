-- ============================================
-- MIGRATIONS COMPLETAS - MÓDULO DE PROPOSTAS
-- CRM Zoomer - Implementação Completa
-- ============================================
-- Data: 2026-01-12
-- Versão: 1.0
-- ============================================

-- ============================================
-- 1. ADICIONAR NOVOS CAMPOS NA TABELA PROPOSALS
-- ============================================

-- Campos para rastreamento
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS email_notification_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_client_edits BOOLEAN DEFAULT true;

-- Adicionar order em proposal_optionals
ALTER TABLE proposal_optionals
  ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;

-- ============================================
-- 2. CONSTRAINTS E VALIDAÇÕES
-- ============================================

-- Garantir que desconto está entre 0 e 100 (%)
ALTER TABLE proposals
  DROP CONSTRAINT IF EXISTS check_discount_valid;

ALTER TABLE proposals
  ADD CONSTRAINT check_discount_valid
  CHECK (discount >= 0 AND discount <= 100);

-- ============================================
-- 3. FUNÇÃO: RECALCULAR TOTAL DA PROPOSTA AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_proposal_total()
RETURNS TRIGGER AS $$
DECLARE
  items_total DECIMAL;
  optionals_total DECIMAL;
  discount_amt DECIMAL;
BEGIN
  -- Somar todos os itens
  SELECT COALESCE(SUM(total), 0)
  INTO items_total
  FROM proposal_items
  WHERE proposal_id = NEW.id;

  -- Somar opcionais selecionados
  SELECT COALESCE(SUM(price), 0)
  INTO optionals_total
  FROM proposal_optionals
  WHERE proposal_id = NEW.id AND is_selected = true;

  -- Calcular desconto em reais
  discount_amt = items_total * (NEW.discount / 100);

  -- Atualizar valores
  NEW.base_value = items_total;
  NEW.discount_amount = discount_amt;
  NEW.total_value = items_total + optionals_total - discount_amt;

  RAISE NOTICE 'Proposta % recalculada: Base=%, Opcionais=%, Desconto=%, Total=%',
    NEW.id, items_total, optionals_total, discount_amt, NEW.total_value;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular quando proposta é inserida/atualizada
DROP TRIGGER IF EXISTS trigger_recalculate_proposal_total ON proposals;
CREATE TRIGGER trigger_recalculate_proposal_total
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_total();

-- ============================================
-- 4. FUNÇÃO: RECALCULAR QUANDO ITENS MUDAM
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_proposal_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
  prop_id TEXT;
BEGIN
  -- Pegar o proposal_id (funciona para INSERT, UPDATE e DELETE)
  prop_id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  -- Forçar recálculo da proposta
  UPDATE proposals
  SET updated_at = NOW()
  WHERE id = prop_id;

  RAISE NOTICE 'Proposta % será recalculada devido a mudança em item/opcional', prop_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular quando item muda
DROP TRIGGER IF EXISTS trigger_recalc_on_item_change ON proposal_items;
CREATE TRIGGER trigger_recalc_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON proposal_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_on_item_change();

-- Trigger para recalcular quando opcional muda
DROP TRIGGER IF EXISTS trigger_recalc_on_optional_change ON proposal_optionals;
CREATE TRIGGER trigger_recalc_on_optional_change
  AFTER INSERT OR UPDATE OR DELETE ON proposal_optionals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_proposal_on_item_change();

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por token (página pública)
CREATE INDEX IF NOT EXISTS idx_proposals_token
ON proposals(token);

-- Índice para propostas por status
CREATE INDEX IF NOT EXISTS idx_proposals_status
ON proposals(status);

-- Índice para propostas por cliente
CREATE INDEX IF NOT EXISTS idx_proposals_client
ON proposals(client_id);

-- Índice para itens por proposta
CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal
ON proposal_items(proposal_id);

-- Índice para opcionais por proposta
CREATE INDEX IF NOT EXISTS idx_proposal_optionals_proposal
ON proposal_optionals(proposal_id);

-- Índice para vídeos por proposta
CREATE INDEX IF NOT EXISTS idx_proposal_videos_proposal
ON proposal_videos(proposal_id);

-- ============================================
-- 6. VIEW: PROPOSTAS COM INFORMAÇÕES AGREGADAS
-- ============================================

CREATE OR REPLACE VIEW proposals_summary AS
SELECT
  p.id,
  p.token,
  p.title,
  p.description,
  p.status,
  p.base_value,
  p.discount,
  p.discount_amount,
  p.total_value,
  p.valid_until,
  p.accepted_at,
  p.sent_at,
  p.viewed_at,
  p.created_at,
  p.updated_at,

  -- Cliente
  c.id as client_id,
  c.name as client_name,
  c.email as client_email,
  c.company as client_company,

  -- Organização
  o.id as organization_id,
  o.name as organization_name,

  -- Estatísticas
  COUNT(DISTINCT pi.id) as items_count,
  COUNT(DISTINCT po.id) as optionals_count,
  COUNT(DISTINCT po.id) FILTER (WHERE po.is_selected = true) as optionals_selected_count,
  COUNT(DISTINCT pv.id) as videos_count,

  -- Valores agregados
  COALESCE(SUM(DISTINCT pi.total), 0) as items_total,
  COALESCE(SUM(DISTINCT po.price) FILTER (WHERE po.is_selected = true), 0) as optionals_total

FROM proposals p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN organizations o ON p.organization_id = o.id
LEFT JOIN proposal_items pi ON p.id = pi.proposal_id
LEFT JOIN proposal_optionals po ON p.id = po.proposal_id
LEFT JOIN proposal_videos pv ON p.id = pv.proposal_id
GROUP BY
  p.id, p.token, p.title, p.description, p.status,
  p.base_value, p.discount, p.discount_amount, p.total_value,
  p.valid_until, p.accepted_at, p.sent_at, p.viewed_at,
  p.created_at, p.updated_at,
  c.id, c.name, c.email, c.company,
  o.id, o.name;

COMMENT ON VIEW proposals_summary IS
'View agregada com estatísticas de propostas para dashboards e listagens';

-- ============================================
-- 7. FUNÇÃO HELPER: BUSCAR PROPOSTA COMPLETA
-- ============================================

CREATE OR REPLACE FUNCTION get_proposal_with_details(proposal_id_param TEXT)
RETURNS TABLE (
  proposal_data JSONB,
  items_data JSONB,
  optionals_data JSONB,
  videos_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(p.*) as proposal_data,
    COALESCE(jsonb_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]'::jsonb) as items_data,
    COALESCE(jsonb_agg(DISTINCT po.*) FILTER (WHERE po.id IS NOT NULL), '[]'::jsonb) as optionals_data,
    COALESCE(jsonb_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]'::jsonb) as videos_data
  FROM proposals p
  LEFT JOIN proposal_items pi ON p.id = pi.proposal_id
  LEFT JOIN proposal_optionals po ON p.id = po.proposal_id
  LEFT JOIN proposal_videos pv ON p.id = pv.proposal_id
  WHERE p.id = proposal_id_param
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_proposal_with_details(TEXT) IS
'Busca proposta completa com todos os relacionamentos em uma única query';

-- ============================================
-- 8. DADOS DE EXEMPLO (OPCIONAL - APENAS PARA TESTES)
-- ============================================

-- Comentar esta seção se não quiser dados de exemplo

/*
-- Exemplo: Adicionar itens a uma proposta existente
-- Substitua 'PROPOSAL_ID_AQUI' pelo ID real de uma proposta

INSERT INTO proposal_items (id, proposal_id, description, quantity, unit_price, total, "order")
VALUES
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Roteiro e Storyboard', 1, 2000, 2000, 1),
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Gravação 1 dia (8 horas)', 1, 5000, 5000, 2),
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Edição e Color Grading', 1, 3000, 3000, 3);

-- Exemplo: Adicionar opcionais
INSERT INTO proposal_optionals (id, proposal_id, title, description, price, is_selected, "order")
VALUES
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Filmagem com Drone', 'Capturas aéreas em 4K', 2500, false, 1),
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Motion Graphics 2D', 'Animações e transições customizadas', 1500, false, 2),
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Trilha Sonora Original', 'Composição musical exclusiva', 1000, false, 3);

-- Exemplo: Adicionar vídeos portfolio
INSERT INTO proposal_videos (id, proposal_id, title, video_url, "order")
VALUES
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Case - Empresa XYZ 2025', 'https://vimeo.com/123456789', 1),
  (gen_random_uuid()::text, 'PROPOSAL_ID_AQUI', 'Campanha ABC - Resultado', 'https://www.youtube.com/watch?v=abc123', 2);
*/

-- ============================================
-- ✅ INSTALAÇÃO COMPLETA!
-- ============================================

SELECT
  '✅ Migrations de Propostas instaladas com sucesso!' as status,
  '2 novos triggers criados (recalcular total)' as triggers,
  '1 view agregada (proposals_summary)' as views,
  '6 índices adicionais para performance' as indices,
  '1 função helper (get_proposal_with_details)' as funcoes;

-- ============================================
-- 📋 COMO TESTAR
-- ============================================

/*
-- 1. Verificar se triggers estão ativos
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%proposal%';

-- 2. Testar recálculo automático
-- Criar uma proposta de teste e adicionar itens
-- O total_value deve ser calculado automaticamente

-- 3. Verificar view
SELECT * FROM proposals_summary LIMIT 5;

-- 4. Testar função helper
SELECT * FROM get_proposal_with_details('seu-proposal-id-aqui');
*/
