
-- Add new columns to Organization table
ALTER TABLE "organizations" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "organizations" ADD COLUMN "address" TEXT;
ALTER TABLE "organizations" ADD COLUMN "bank_name" TEXT;
ALTER TABLE "organizations" ADD COLUMN "agency" TEXT;
ALTER TABLE "organizations" ADD COLUMN "account_number" TEXT;
ALTER TABLE "organizations" ADD COLUMN "pix_key" TEXT;
ALTER TABLE "organizations" ADD COLUMN "primary_color" TEXT DEFAULT '#000000';
ALTER TABLE "organizations" ADD COLUMN "default_terms" TEXT;
