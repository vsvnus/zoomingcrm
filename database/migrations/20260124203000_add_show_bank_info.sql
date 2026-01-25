
-- Migration: Add show_bank_info column
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "show_bank_info" BOOLEAN DEFAULT true;
