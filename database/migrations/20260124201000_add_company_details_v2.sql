
-- Migration: Add Company Details
-- Description: Adds CNPJ, Address, Bank Info and Branding fields to organizations table

ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "cnpj" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "bank_name" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "agency" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "account_number" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "pix_key" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "primary_color" TEXT DEFAULT '#000000';
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "default_terms" TEXT;
