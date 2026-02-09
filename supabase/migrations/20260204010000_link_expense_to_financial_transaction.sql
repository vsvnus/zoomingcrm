-- ==============================================================================
-- Add financial_transaction_id to project_expenses for sync with main financeiro
-- ==============================================================================

ALTER TABLE project_expenses
ADD COLUMN IF NOT EXISTS financial_transaction_id TEXT REFERENCES financial_transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_expenses_ft_id ON project_expenses(financial_transaction_id);
