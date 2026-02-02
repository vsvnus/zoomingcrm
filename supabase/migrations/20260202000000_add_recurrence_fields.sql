-- Adicionar colunas de recorrência na tabela financial_transactions

ALTER TABLE financial_transactions
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_period TEXT CHECK (recurrence_period IN ('MONTHLY', 'YEARLY', 'WEEKLY')),
ADD COLUMN IF NOT EXISTS parent_transaction_id TEXT REFERENCES financial_transactions(id);

-- Criar índice para performance em buscas de transações filhas/ recorrentes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_parent_id ON financial_transactions(parent_transaction_id);
