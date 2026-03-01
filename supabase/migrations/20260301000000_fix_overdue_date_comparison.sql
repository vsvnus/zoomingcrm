-- Fix: is_overdue comparison should use CURRENT_DATE instead of NOW()
-- NOW() returns a timestamp, so a DATE of today (midnight) < NOW() (e.g. 10:00)
-- would be TRUE, incorrectly marking today's due dates as overdue.
-- CURRENT_DATE returns just the date, so due_date = today is NOT overdue.

-- View: accounts_payable
DROP VIEW IF EXISTS accounts_payable;

CREATE OR REPLACE VIEW accounts_payable AS
SELECT
  t.*,
  (t.due_date < CURRENT_DATE AND t.status NOT IN ('PAID', 'CANCELLED')) as is_overdue
FROM financial_transactions t
WHERE t.type = 'EXPENSE';

-- View: accounts_receivable
DROP VIEW IF EXISTS accounts_receivable;

CREATE OR REPLACE VIEW accounts_receivable AS
SELECT
  t.*,
  (t.due_date < CURRENT_DATE AND t.status NOT IN ('PAID', 'CANCELLED')) as is_overdue
FROM financial_transactions t
WHERE t.type IN ('INCOME', 'INITIAL_CAPITAL');

-- Grant permissions
GRANT SELECT ON accounts_payable TO authenticated;
GRANT SELECT ON accounts_receivable TO authenticated;
GRANT SELECT ON accounts_payable TO service_role;
GRANT SELECT ON accounts_receivable TO service_role;
