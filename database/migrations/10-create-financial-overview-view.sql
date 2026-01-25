-- ============================================
-- FIX: CORRIGIR VIEW USADA PELO FRONTEND (financial_overview)
-- ============================================

-- O frontend usa 'financial_overview', mas a migration original criou 'financial_summary'.
-- Vamos criar 'financial_overview' com a lógica correta (EN-US Enums).

DROP VIEW IF EXISTS financial_overview;

CREATE OR REPLACE VIEW financial_overview AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  
  -- Campos compatíveis com o frontend interface (snaked_case)
  
  -- Faturamento Total (Income confirmed)
  COALESCE(SUM(ft.amount) FILTER (
    WHERE ft.type = 'INCOME' AND ft.status = 'PAID'
  ), 0) as total_income,

  -- Custos Totais (Expense confirmed)
  COALESCE(SUM(ABS(ft.amount)) FILTER (
    WHERE ft.type = 'EXPENSE' AND ft.status = 'PAID'
  ), 0) as total_expenses,

  -- Lucro Líquido (Calculado: Capital + Income - Expense)
  (
    -- Capital Inicial
    COALESCE((SELECT amount FROM financial_transactions 
     WHERE organization_id = o.id AND type = 'INITIAL_CAPITAL' AND status = 'PAID' LIMIT 1), 0)
    +
    -- Receitas
    COALESCE(SUM(ft.amount) FILTER (WHERE ft.type = 'INCOME' AND ft.status = 'PAID'), 0)
    -
    -- Despesas
    COALESCE(SUM(ABS(ft.amount)) FILTER (WHERE ft.type = 'EXPENSE' AND ft.status = 'PAID'), 0)
  ) as net_profit,

  -- Margem de Lucro %
  CASE 
    WHEN COALESCE(SUM(ft.amount) FILTER (WHERE ft.type = 'INCOME' AND ft.status = 'PAID'), 0) > 0 
    THEN (
      (
        COALESCE(SUM(ft.amount) FILTER (WHERE ft.type = 'INCOME' AND ft.status = 'PAID'), 0) -
        COALESCE(SUM(ABS(ft.amount)) FILTER (WHERE ft.type = 'EXPENSE' AND ft.status = 'PAID'), 0)
      ) / 
      COALESCE(SUM(ft.amount) FILTER (WHERE ft.type = 'INCOME' AND ft.status = 'PAID'), 0)
    ) * 100
    ELSE 0 
  END as profit_margin_percent,

  -- Pendente a Receber
  COALESCE(SUM(ft.amount) FILTER (
    WHERE ft.type = 'INCOME' AND ft.status IN ('PENDING', 'SCHEDULED')
  ), 0) as pending_receivable,

  -- Pendente a Pagar
  COALESCE(SUM(ABS(ft.amount)) FILTER (
    WHERE ft.type = 'EXPENSE' AND ft.status IN ('PENDING', 'SCHEDULED')
  ), 0) as pending_payable,

  -- Metadados
  MAX(ft.created_at) as updated_at

FROM organizations o
LEFT JOIN financial_transactions ft ON o.id = ft.organization_id
GROUP BY o.id;

COMMENT ON VIEW financial_overview IS 
'View ajustada para o Frontend (OverviewTab). Mapeia INCOME/EXPENSE/PAID e expõe campos snake_case esperados pela interface.';
