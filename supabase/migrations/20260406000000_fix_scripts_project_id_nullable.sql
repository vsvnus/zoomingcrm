-- ============================================
-- FIX: Tornar project_id nullable na tabela scripts
-- Permite criar roteiros via Studio AI sem projeto associado
-- ============================================

ALTER TABLE scripts ALTER COLUMN project_id DROP NOT NULL;
