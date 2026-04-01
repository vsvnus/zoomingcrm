-- ============================================
-- Converter coluna category de ENUM para TEXT
-- ============================================
-- O enum transaction_category não inclui GENERAL_EXPENSE nem categorias
-- personalizadas que o sistema permite criar via UI.
-- Solução: converter para TEXT para aceitar qualquer valor.

-- 1. Dropar views que dependem da coluna category
DROP VIEW IF EXISTS accounts_payable;
DROP VIEW IF EXISTS accounts_receivable;
DROP VIEW IF EXISTS project_financials;

-- 2. Alterar a coluna category para TEXT
ALTER TABLE financial_transactions
  ALTER COLUMN category TYPE TEXT
  USING category::TEXT;

-- 3. Remover o tipo ENUM (não será mais usado)
DROP TYPE IF EXISTS transaction_category;

-- 4. Recriar accounts_payable
CREATE VIEW accounts_payable AS
SELECT id, organization_id, type, category, description, amount, estimated_amount,
  status, due_date, payment_date, payment_method, invoice_number, receipt_url, notes,
  project_id, proposal_id, client_id, freelancer_id, equipment_id,
  created_at, updated_at, created_by,
  due_date < now() AND (status <> ALL (ARRAY['PAID'::payment_status, 'CANCELLED'::payment_status])) AND status <> 'PAID'::payment_status AS is_overdue
FROM financial_transactions t
WHERE type = 'EXPENSE'::transaction_type;

-- 5. Recriar accounts_receivable
CREATE VIEW accounts_receivable AS
SELECT id, organization_id, type, category, description, amount, estimated_amount,
  status, due_date, payment_date, payment_method, invoice_number, receipt_url, notes,
  project_id, proposal_id, client_id, freelancer_id, equipment_id,
  created_at, updated_at, created_by,
  due_date < now() AND (status <> ALL (ARRAY['PAID'::payment_status, 'CANCELLED'::payment_status])) AND status <> 'PAID'::payment_status AS is_overdue
FROM financial_transactions t
WHERE type = ANY (ARRAY['INCOME'::transaction_type, 'INITIAL_CAPITAL'::transaction_type]);

-- 6. Recriar project_financials (sem casts ::transaction_category pois agora é TEXT)
CREATE VIEW project_financials AS
SELECT p.id AS project_id, p.title AS project_name, p.stage AS project_stage,
  p.organization_id, c.name AS client_name, p.deadline_date AS deadline,
  COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS revenue_received,
  COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND (ft.status = ANY (ARRAY['PENDING'::payment_status, 'SCHEDULED'::payment_status])) THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS revenue_pending,
  COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS revenue_total,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS costs_paid,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND (ft.status = ANY (ARRAY['PENDING'::payment_status, 'SCHEDULED'::payment_status])) THEN COALESCE(ft.estimated_amount, ft.amount) ELSE NULL::numeric END), 0::numeric) AS costs_estimated,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) + COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND (ft.status = ANY (ARRAY['PENDING'::payment_status, 'SCHEDULED'::payment_status])) THEN COALESCE(ft.estimated_amount, ft.amount) ELSE NULL::numeric END), 0::numeric) AS costs_total,
  COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) - COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS profit_realized,
  COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type THEN ft.amount ELSE NULL::numeric END), 0::numeric) - (COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) + COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND (ft.status = ANY (ARRAY['PENDING'::payment_status, 'SCHEDULED'::payment_status])) THEN COALESCE(ft.estimated_amount, ft.amount) ELSE NULL::numeric END), 0::numeric)) AS profit_projected,
  CASE WHEN COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) > 0::numeric THEN (COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) - COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric)) / COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 1::numeric) * 100::numeric ELSE 0::numeric END AS margin_realized_percent,
  CASE WHEN COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type THEN ft.amount ELSE NULL::numeric END), 0::numeric) > 0::numeric THEN (COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type THEN ft.amount ELSE NULL::numeric END), 0::numeric) - (COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) + COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND (ft.status = ANY (ARRAY['PENDING'::payment_status, 'SCHEDULED'::payment_status])) THEN COALESCE(ft.estimated_amount, ft.amount) ELSE NULL::numeric END), 0::numeric))) / COALESCE(sum(CASE WHEN ft.type = 'INCOME'::transaction_type THEN ft.amount ELSE NULL::numeric END), 1::numeric) * 100::numeric ELSE 0::numeric END AS margin_projected_percent,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.category = 'CREW_TALENT' AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS crew_cost,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.category = 'EQUIPMENT_RENTAL' AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS equipment_cost,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.category = 'LOGISTICS' AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS logistics_cost,
  COALESCE(sum(CASE WHEN ft.type = 'EXPENSE'::transaction_type AND ft.category = 'POST_PRODUCTION' AND ft.status = 'PAID'::payment_status THEN ft.amount ELSE NULL::numeric END), 0::numeric) AS postprod_cost
FROM projects p
  LEFT JOIN clients c ON p.client_id = c.id
  LEFT JOIN financial_transactions ft ON ft.project_id = p.id
GROUP BY p.id, p.title, p.stage, p.organization_id, c.name, p.deadline_date
ORDER BY p.created_at DESC;
