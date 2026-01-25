-- ============================================
-- CORREÇÃO DA VIEW FINANCEIRA (EN-US vs PT-BR)
-- ============================================

-- Dropar a view antiga
DROP VIEW IF EXISTS financial_summary;

-- Recriar a função de saldo (opcional, mas bom garantir)
CREATE OR REPLACE FUNCTION calculate_current_balance(org_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
  total_receitas DECIMAL;
  total_despesas DECIMAL;
  capital_inicial DECIMAL;
  saldo_atual DECIMAL;
BEGIN
  -- Buscar capital inicial (INITIAL_CAPITAL + PAID)
  SELECT COALESCE(
    (SELECT amount
     FROM financial_transactions
     WHERE organization_id = org_id
       AND type = 'INITIAL_CAPITAL'
       AND status = 'PAID'
     LIMIT 1),
    0
  ) INTO capital_inicial;

  -- Calcular total de receitas confirmadas (INCOME + PAID)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_receitas
  FROM financial_transactions
  WHERE organization_id = org_id
    AND type = 'INCOME'
    AND status = 'PAID';

  -- Calcular total de despesas confirmadas (EXPENSE + PAID)
  SELECT COALESCE(SUM(ABS(amount)), 0)
  INTO total_despesas
  FROM financial_transactions
  WHERE organization_id = org_id
    AND type = 'EXPENSE'
    AND status = 'PAID';

  -- Saldo = Capital Inicial + Receitas - Despesas
  saldo_atual := capital_inicial + total_receitas - total_despesas;

  RETURN saldo_atual;
END;
$$ LANGUAGE plpgsql;

-- Recriar a VIEW usando os termos em INGLÊS (que o Prisma usa)
CREATE OR REPLACE VIEW financial_summary AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  o.initial_capital,
  o.initial_capital_set_at,

  -- Capital inicial (transação)
  (SELECT amount
   FROM financial_transactions
   WHERE organization_id = o.id
     AND type = 'INITIAL_CAPITAL'
     AND status = 'PAID'
   LIMIT 1) as capital_inicial_transaction,

  -- Total de receitas confirmadas (INCOME + PAID)
  COALESCE(SUM(ft.amount) FILTER (
    WHERE ft.type = 'INCOME' AND ft.status = 'PAID'
  ), 0) as total_receitas,

  -- Total de despesas confirmadas (EXPENSE + PAID)
  COALESCE(SUM(ABS(ft.amount)) FILTER (
    WHERE ft.type = 'EXPENSE' AND ft.status = 'PAID'
  ), 0) as total_despesas,

  -- Receitas pendentes (INCOME + PENDING/SCHEDULED)
  COALESCE(SUM(ft.amount) FILTER (
    WHERE ft.type = 'INCOME' AND ft.status IN ('PENDING', 'SCHEDULED')
  ), 0) as receitas_pendentes,

  -- Despesas pendentes (EXPENSE + PENDING/SCHEDULED)
  COALESCE(SUM(ABS(ft.amount)) FILTER (
    WHERE ft.type = 'EXPENSE' AND ft.status IN ('PENDING', 'SCHEDULED')
  ), 0) as despesas_pendentes,

  -- Saldo atual (calculado via função)
  calculate_current_balance(o.id) as saldo_atual,

  -- Contadores
  COUNT(DISTINCT ft.id) FILTER (WHERE ft.type = 'INCOME') as total_receitas_count,
  COUNT(DISTINCT ft.id) FILTER (WHERE ft.type = 'EXPENSE') as total_despesas_count,

  -- Última transação
  MAX(ft.created_at) as ultima_transacao

FROM organizations o
LEFT JOIN financial_transactions ft ON o.id = ft.organization_id
GROUP BY o.id, o.name, o.initial_capital, o.initial_capital_set_at;

COMMENT ON VIEW financial_summary IS
'View corrigida para usar ENUMs em INGLÊS (INCOME, PAID, etc) compatíveis com o Prisma.';
