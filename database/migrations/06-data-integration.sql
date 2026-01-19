-- ============================================
-- MELHORIAS DE INTEGRAÇÃO DE DADOS
-- CRM Zoomer - Automação Completa de Fluxos Financeiros
-- ============================================
-- Versão: 2.0
-- Data: 2026-01-12
-- Autor: Claude AI + Vinícius Pimentel
--
-- OBJETIVO: Automatizar TODAS as integrações financeiras para
-- evitar duplicidade, esquecimentos e inconsistências de dados
-- ============================================

-- ============================================
-- 1. TRIGGER: PROPOSTAS → RECEITAS (AUTOMÁTICO)
-- ============================================
-- Quando uma proposta é aprovada, criar automaticamente
-- uma receita em contas a receber

CREATE OR REPLACE FUNCTION create_income_for_approved_proposal()
RETURNS TRIGGER AS $$
BEGIN
  -- Só criar receita se mudou para ACCEPTED
  IF NEW.status = 'ACCEPTED' AND (OLD.status IS NULL OR OLD.status != 'ACCEPTED') THEN

    -- Inserir transação de receita
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      description,
      status,
      due_date,
      proposal_id,
      client_id,
      created_at
    ) VALUES (
      NEW.organization_id,
      'INCOME',
      'CLIENT_PAYMENT',
      NEW.total_value,
      'Pagamento de proposta: ' || NEW.title,
      'PENDING',
      NEW.accepted_at::DATE + INTERVAL '30 days', -- Vencimento padrão: 30 dias após aprovação
      NEW.id,
      NEW.client_id,
      NOW()
    );

    RAISE NOTICE 'Receita criada automaticamente para proposta %', NEW.title;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que dispara após UPDATE na tabela proposals
DROP TRIGGER IF EXISTS trigger_create_income_for_proposal ON proposals;
CREATE TRIGGER trigger_create_income_for_proposal
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION create_income_for_approved_proposal();

COMMENT ON FUNCTION create_income_for_approved_proposal() IS
'Cria automaticamente uma receita em financial_transactions quando proposta é aprovada';


-- ============================================
-- 2. TRIGGER: EQUIPAMENTOS → DESPESAS (AUTOMÁTICO)
-- ============================================
-- Quando um equipamento é reservado para um projeto,
-- criar automaticamente a despesa baseada no daily_rate

CREATE OR REPLACE FUNCTION create_expense_for_equipment_booking()
RETURNS TRIGGER AS $$
DECLARE
  equipment_daily_rate DECIMAL;
  equipment_name TEXT;
  total_days INTEGER;
  total_cost DECIMAL;
BEGIN
  -- Buscar informações do equipamento
  SELECT daily_rate, name INTO equipment_daily_rate, equipment_name
  FROM equipments
  WHERE id = NEW.equipment_id;

  -- Só criar despesa se daily_rate estiver definido
  IF equipment_daily_rate IS NOT NULL AND equipment_daily_rate > 0 THEN
    -- Calcular dias e custo total (inclusive)
    total_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date))::INTEGER + 1;
    total_cost := equipment_daily_rate * total_days;

    -- Inserir transação de despesa
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      estimated_amount,
      description,
      status,
      project_id,
      equipment_id,
      created_at
    ) VALUES (
      NEW.organization_id,
      'EXPENSE',
      'EQUIPMENT_RENTAL',
      total_cost,
      total_cost,
      'Uso de ' || equipment_name || ' (' || total_days || ' dias)',
      'PENDING',
      NEW.project_id,
      NEW.equipment_id,
      NOW()
    );

    RAISE NOTICE 'Despesa de equipamento criada: R$ % para %', total_cost, equipment_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que dispara após INSERT na tabela equipment_bookings
DROP TRIGGER IF EXISTS trigger_create_expense_for_booking ON equipment_bookings;
CREATE TRIGGER trigger_create_expense_for_booking
  AFTER INSERT ON equipment_bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_expense_for_equipment_booking();

COMMENT ON FUNCTION create_expense_for_equipment_booking() IS
'Cria automaticamente uma despesa quando equipamento é reservado para projeto';


-- ============================================
-- 3. TRIGGER: MANUTENÇÃO → DESPESAS (AUTOMÁTICO)
-- ============================================
-- Quando uma manutenção é registrada, criar automaticamente
-- uma despesa fixa da empresa

CREATE OR REPLACE FUNCTION create_expense_for_maintenance()
RETURNS TRIGGER AS $$
DECLARE
  equipment_name TEXT;
BEGIN
  -- Só criar despesa se houver custo
  IF NEW.cost IS NOT NULL AND NEW.cost > 0 THEN

    -- Buscar nome do equipamento
    SELECT name INTO equipment_name
    FROM equipments
    WHERE id = NEW.equipment_id;

    -- Inserir transação de despesa
    INSERT INTO financial_transactions (
      organization_id,
      type,
      category,
      amount,
      description,
      status,
      due_date,
      equipment_id,
      invoice_number,
      notes,
      created_at
    ) VALUES (
      NEW.organization_id,
      'EXPENSE',
      'MAINTENANCE',
      NEW.cost,
      'Manutenção: ' || NEW.description || ' - ' || equipment_name,
      'PENDING',
      NEW.date_start, -- Vencimento na data da manutenção
      NEW.equipment_id,
      NEW.invoice_number,
      CASE
        WHEN NEW.external_service THEN 'Serviço externo - ' || COALESCE(NEW.technician_name, 'N/A')
        ELSE 'Manutenção interna'
      END,
      NOW()
    );

    RAISE NOTICE 'Despesa de manutenção criada: R$ % para %', NEW.cost, equipment_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que dispara após INSERT na tabela maintenance_logs
DROP TRIGGER IF EXISTS trigger_create_expense_for_maintenance ON maintenance_logs;
CREATE TRIGGER trigger_create_expense_for_maintenance
  AFTER INSERT ON maintenance_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_expense_for_maintenance();

COMMENT ON FUNCTION create_expense_for_maintenance() IS
'Cria automaticamente uma despesa fixa quando manutenção é registrada';


-- ============================================
-- 4. VIEW APRIMORADA: FREELANCER COM MÉDIA DIÁRIA REAL
-- ============================================
-- Calcular a média diária baseada nos projetos REAIS que o freelancer trabalhou

CREATE OR REPLACE VIEW freelancer_statistics AS
SELECT
  f.id as freelancer_id,
  f.name,
  f.email,
  f.role,
  f.specialty,
  f.status,
  f.rating,
  f.daily_rate as declared_daily_rate, -- Taxa declarada pelo freelancer

  -- MÉDIA DIÁRIA REAL (baseada em projetos)
  COALESCE(
    ROUND(AVG(pm.agreed_fee), 2),
    f.daily_rate
  ) as average_daily_rate,

  -- Estatísticas de projetos
  COUNT(pm.id) as total_projects,
  COUNT(CASE WHEN pm.status = 'CONFIRMED' THEN 1 END) as confirmed_projects,
  COUNT(CASE WHEN pm.status = 'INVITED' THEN 1 END) as pending_invites,

  -- Receita total gerada (soma de todos agreed_fee confirmados)
  COALESCE(SUM(CASE WHEN pm.status = 'CONFIRMED' THEN pm.agreed_fee END), 0) as total_revenue_generated,

  -- Receita pendente (projetos invited/confirmados mas ainda não pagos)
  COALESCE(
    SUM(
      CASE
        WHEN pm.status IN ('INVITED', 'CONFIRMED')
        AND ft.status IN ('PENDING', 'SCHEDULED')
        THEN pm.agreed_fee
      END
    ),
    0
  ) as pending_revenue,

  -- Último projeto
  MAX(pm.created_at) as last_project_date,

  -- Projeto mais recente (nome)
  (
    SELECT p.title
    FROM project_members pm2
    JOIN projects p ON pm2.project_id = p.id
    WHERE pm2.freelancer_id = f.id
    ORDER BY pm2.created_at DESC
    LIMIT 1
  ) as last_project_name,

  -- Taxa de conversão de convites (confirmados / total de convites)
  CASE
    WHEN COUNT(pm.id) > 0 THEN
      ROUND(
        (COUNT(CASE WHEN pm.status = 'CONFIRMED' THEN 1 END)::NUMERIC / COUNT(pm.id)::NUMERIC) * 100,
        1
      )
    ELSE 0
  END as conversion_rate_percent

FROM freelancers f
LEFT JOIN project_members pm ON f.id = pm.freelancer_id
LEFT JOIN financial_transactions ft ON ft.freelancer_id = f.id AND ft.project_id = pm.project_id
GROUP BY f.id, f.name, f.email, f.role, f.specialty, f.status, f.rating, f.daily_rate
ORDER BY f.name;

COMMENT ON VIEW freelancer_statistics IS
'Estatísticas completas de freelancers incluindo média diária REAL baseada em projetos executados';


-- ============================================
-- 5. VIEW APRIMORADA: ROI DE EQUIPAMENTOS CONSIDERANDO PROJETOS
-- ============================================
-- Melhorar o cálculo de ROI para considerar os projetos reais

CREATE OR REPLACE VIEW equipment_roi_analysis AS
SELECT
  e.id as equipment_id,
  e.name,
  e.brand,
  e.model,
  e.category,
  e.status,
  e.serial_number,
  e.purchase_date,
  e.purchase_price,
  e.daily_rate,
  e.organization_id,

  -- BOOKINGS (Reservas)
  COUNT(DISTINCT eb.id) as total_bookings,

  -- Total de dias reservados (soma de todos os períodos)
  COALESCE(
    SUM(EXTRACT(DAY FROM (eb.end_date - eb.start_date))::INTEGER + 1),
    0
  ) as total_days_booked,

  -- RECEITA GERADA (baseada em financial_transactions REAIS)
  COALESCE(
    (
      SELECT SUM(ft.amount)
      FROM financial_transactions ft
      WHERE ft.equipment_id = e.id
      AND ft.type = 'EXPENSE'
      AND ft.category = 'EQUIPMENT_RENTAL'
      AND ft.status IN ('PAID', 'PENDING', 'SCHEDULED')
    ),
    0
  ) as total_revenue_generated,

  -- RECEITA PAGA (apenas transações pagas)
  COALESCE(
    (
      SELECT SUM(ft.amount)
      FROM financial_transactions ft
      WHERE ft.equipment_id = e.id
      AND ft.type = 'EXPENSE'
      AND ft.category = 'EQUIPMENT_RENTAL'
      AND ft.status = 'PAID'
    ),
    0
  ) as revenue_paid,

  -- CUSTOS DE MANUTENÇÃO (baseado em maintenance_logs)
  COALESCE(
    (
      SELECT SUM(ml.cost)
      FROM maintenance_logs ml
      WHERE ml.equipment_id = e.id
      AND ml.status = 'COMPLETED'
    ),
    0
  ) as total_maintenance_costs,

  -- ROI LÍQUIDO (considerando manutenção)
  CASE
    WHEN e.purchase_price > 0 THEN
      ROUND(
        (
          (
            COALESCE(
              (
                SELECT SUM(ft.amount)
                FROM financial_transactions ft
                WHERE ft.equipment_id = e.id
                AND ft.type = 'EXPENSE'
                AND ft.category = 'EQUIPMENT_RENTAL'
                AND ft.status IN ('PAID', 'PENDING', 'SCHEDULED')
              ),
              0
            )
            -
            COALESCE(
              (
                SELECT SUM(ml.cost)
                FROM maintenance_logs ml
                WHERE ml.equipment_id = e.id
                AND ml.status = 'COMPLETED'
              ),
              0
            )
          ) / e.purchase_price * 100
        )::NUMERIC,
        2
      )
    ELSE NULL
  END as roi_percent,

  -- ROI BRUTO (sem considerar manutenção - mantido para comparação)
  CASE
    WHEN e.purchase_price > 0 THEN
      ROUND(
        (
          COALESCE(
            (
              SELECT SUM(ft.amount)
              FROM financial_transactions ft
              WHERE ft.equipment_id = e.id
              AND ft.type = 'EXPENSE'
              AND ft.category = 'EQUIPMENT_RENTAL'
              AND ft.status IN ('PAID', 'PENDING', 'SCHEDULED')
            ),
            0
          ) / e.purchase_price * 100
        )::NUMERIC,
        2
      )
    ELSE NULL
  END as roi_gross_percent,

  -- Booking atual
  EXISTS (
    SELECT 1 FROM equipment_bookings eb2
    WHERE eb2.equipment_id = e.id
    AND eb2.start_date <= CURRENT_DATE
    AND eb2.end_date >= CURRENT_DATE
  ) as currently_booked,

  -- Próxima reserva
  (
    SELECT MIN(eb2.start_date)
    FROM equipment_bookings eb2
    WHERE eb2.equipment_id = e.id
    AND eb2.start_date > CURRENT_DATE
  ) as next_booking_date,

  -- Projetos únicos que usaram este equipamento
  COUNT(DISTINCT eb.project_id) as unique_projects_count,

  -- Última utilização
  MAX(eb.end_date) as last_used_date,

  -- Taxa de utilização (dias reservados vs dias desde compra)
  CASE
    WHEN e.purchase_date IS NOT NULL THEN
      ROUND(
        (
          COALESCE(SUM(EXTRACT(DAY FROM (eb.end_date - eb.start_date))::INTEGER + 1), 0)::NUMERIC /
          GREATEST((CURRENT_DATE - e.purchase_date), 1)::NUMERIC * 100
        ),
        2
      )
    ELSE NULL
  END as utilization_rate_percent

FROM equipments e
LEFT JOIN equipment_bookings eb ON e.id = eb.equipment_id
GROUP BY e.id, e.name, e.brand, e.model, e.category, e.status,
         e.serial_number, e.purchase_date, e.purchase_price,
         e.daily_rate, e.organization_id
ORDER BY e.name;

COMMENT ON VIEW equipment_roi_analysis IS
'Análise completa de ROI de equipamentos considerando receita REAL de projetos e custos de manutenção';


-- ============================================
-- 6. VALIDAÇÕES E CONSTRAINTS ADICIONAIS
-- ============================================

-- Impedir deletar proposta aprovada (deve cancelar antes)
CREATE OR REPLACE FUNCTION prevent_delete_approved_proposal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'ACCEPTED' THEN
    RAISE EXCEPTION 'Não é possível deletar proposta aprovada. Cancele-a primeiro.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_delete_approved_proposal ON proposals;
CREATE TRIGGER trigger_prevent_delete_approved_proposal
  BEFORE DELETE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_approved_proposal();


-- Sincronizar valor de agreed_fee se project_member for atualizado
CREATE OR REPLACE FUNCTION sync_transaction_on_member_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o agreed_fee mudou, atualizar a transação correspondente
  IF NEW.agreed_fee IS NOT NULL AND NEW.agreed_fee != OLD.agreed_fee THEN
    UPDATE financial_transactions
    SET
      amount = NEW.agreed_fee,
      estimated_amount = NEW.agreed_fee,
      updated_at = NOW()
    WHERE
      project_id = NEW.project_id
      AND freelancer_id = NEW.freelancer_id
      AND type = 'EXPENSE'
      AND category = 'CREW_TALENT';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_transaction_on_member_update ON project_members;
CREATE TRIGGER trigger_sync_transaction_on_member_update
  AFTER UPDATE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_transaction_on_member_update();

COMMENT ON FUNCTION sync_transaction_on_member_update() IS
'Sincroniza automaticamente o valor da transação financeira quando agreed_fee do membro muda';


-- ============================================
-- 7. FUNÇÃO HELPER: RECALCULAR ROI DE EQUIPAMENTO
-- ============================================
-- Útil para forçar recálculo quando necessário

CREATE OR REPLACE FUNCTION recalculate_equipment_roi(equipment_uuid TEXT)
RETURNS TABLE (
  equipment_name TEXT,
  revenue_generated DECIMAL,
  maintenance_costs DECIMAL,
  net_revenue DECIMAL,
  roi_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.name,
    era.total_revenue_generated,
    era.total_maintenance_costs,
    era.total_revenue_generated - era.total_maintenance_costs as net_revenue,
    era.roi_percent
  FROM equipment_roi_analysis era
  JOIN equipments e ON e.id = era.equipment_id
  WHERE e.id = equipment_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_equipment_roi(TEXT) IS
'Retorna o ROI recalculado de um equipamento específico';


-- ============================================
-- 8. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================

-- Índice para busca rápida de transações por equipamento
CREATE INDEX IF NOT EXISTS idx_financial_transactions_equipment_category
ON financial_transactions(equipment_id, category)
WHERE equipment_id IS NOT NULL;

-- Índice para busca de freelancer + projeto
CREATE INDEX IF NOT EXISTS idx_financial_transactions_freelancer_project
ON financial_transactions(freelancer_id, project_id)
WHERE freelancer_id IS NOT NULL;

-- Índice para busca de propostas aprovadas
CREATE INDEX IF NOT EXISTS idx_proposals_status_accepted
ON proposals(status, accepted_at)
WHERE status = 'ACCEPTED';

-- Índice para bookings por data (range queries)
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_dates
ON equipment_bookings(start_date, end_date);


-- ============================================
-- ✅ INSTALAÇÃO COMPLETA!
-- ============================================

SELECT
  '✅ Melhorias de integração instaladas com sucesso!' as status,
  '3 triggers de automação criados' as triggers,
  '2 views aprimoradas (freelancers + equipamentos)' as views,
  '2 funções de validação criadas' as validacoes,
  '4 índices adicionais criados' as performance;

-- ============================================
-- 📋 RESUMO DAS AUTOMAÇÕES IMPLEMENTADAS
-- ============================================

/*
FLUXOS AUTOMÁTICOS:

1. ✅ PROPOSTA APROVADA → RECEITA
   - Trigger: create_income_for_approved_proposal()
   - Quando: proposals.status = 'ACCEPTED'
   - Resultado: Nova linha em financial_transactions (INCOME)

2. ✅ EQUIPAMENTO RESERVADO → DESPESA
   - Trigger: create_expense_for_equipment_booking()
   - Quando: INSERT em equipment_bookings
   - Resultado: Nova linha em financial_transactions (EXPENSE, EQUIPMENT_RENTAL)

3. ✅ MANUTENÇÃO REGISTRADA → DESPESA
   - Trigger: create_expense_for_maintenance()
   - Quando: INSERT em maintenance_logs com cost > 0
   - Resultado: Nova linha em financial_transactions (EXPENSE, MAINTENANCE)

4. ✅ FREELANCER ADICIONADO → DESPESA (JÁ EXISTIA)
   - Trigger: create_transaction_for_project_member()
   - Quando: INSERT em project_members com agreed_fee > 0
   - Resultado: Nova linha em financial_transactions (EXPENSE, CREW_TALENT)

5. ✅ AGREED_FEE ATUALIZADO → SINCRONIZA TRANSAÇÃO
   - Trigger: sync_transaction_on_member_update()
   - Quando: UPDATE em project_members.agreed_fee
   - Resultado: Atualiza financial_transactions.amount correspondente

VIEWS MELHORADAS:

1. ✅ freelancer_statistics
   - Calcula média diária REAL baseada em projetos
   - Mostra conversão de convites, receita total, último projeto

2. ✅ equipment_roi_analysis
   - ROI considerando receita REAL de financial_transactions
   - Desconta custos de manutenção (ROI líquido)
   - Mostra taxa de utilização e projetos únicos

VALIDAÇÕES:

1. ✅ Impede deletar proposta aprovada
2. ✅ Sincroniza transação quando agreed_fee muda

*/
