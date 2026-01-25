
-- Migration: Add branding fields to Proposals
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cover_image" TEXT;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "primary_color" TEXT;
