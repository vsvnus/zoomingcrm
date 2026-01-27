-- Update financial views to include ALL transactions (Paid, Cancelled, Pending)
-- This ensures that "Contas a Pagar" and "Contas a Receber" maintain a history
-- instead of disappearing when marked as paid.

-- View: accounts_payable
DROP VIEW IF EXISTS accounts_payable;

CREATE OR REPLACE VIEW accounts_payable AS
SELECT 
  t.*,
  (t.due_date < NOW() AND t.status NOT IN ('PAID', 'CANCELLED') AND t.status != 'PAID') as is_overdue
FROM financial_transactions t
WHERE t.type = 'EXPENSE';

-- View: accounts_receivable
DROP VIEW IF EXISTS accounts_receivable;

CREATE OR REPLACE VIEW accounts_receivable AS
SELECT 
  t.*,
  (t.due_date < NOW() AND t.status NOT IN ('PAID', 'CANCELLED') AND t.status != 'PAID') as is_overdue
FROM financial_transactions t
WHERE t.type IN ('INCOME', 'INITIAL_CAPITAL');

-- Grant permissions
GRANT SELECT ON accounts_payable TO authenticated;
GRANT SELECT ON accounts_receivable TO authenticated;
GRANT SELECT ON accounts_payable TO service_role;
GRANT SELECT ON accounts_receivable TO service_role;
