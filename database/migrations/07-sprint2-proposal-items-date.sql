-- ============================================
-- SPRINT 2: Motor de Propostas e Fluxo Financeiro
-- Migration: Adicionar campo de data nos itens da proposta
-- ============================================

-- 1. Adicionar campo de data opcional nos itens da proposta
ALTER TABLE proposal_items
ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Comentário explicativo
COMMENT ON COLUMN proposal_items.date IS 'Data opcional do item para sincronização com calendário ao aceitar proposta';

-- 3. Índice para queries de busca por data
CREATE INDEX IF NOT EXISTS idx_proposal_items_date ON proposal_items(date) WHERE date IS NOT NULL;

-- ============================================
-- NOTA: O workflow de aceite manual executa:
-- 1. Muda status da proposta para ACCEPTED
-- 2. Cria eventos no calendário (itens com data)
-- 3. Cria projeto automaticamente
-- 4. Gera lançamentos financeiros
-- ============================================
